import type { Db, Filter } from "mongodb";
import { Buffer } from "node:buffer";
import { promisify } from "node:util";
import { crc32, deflate } from "node:zlib";
import { Binary, ObjectId } from "mongodb";

export const MAX_SIDE = 1024;
const DRAWINGS_PAGE_SIZE = 12;
const PHOTOS_PAGE_SIZE = 24;
export type Gallery = "photos" | "drawings";
export const isGallery = (value: unknown): value is Gallery => value === "photos" || value === "drawings";
export const isImageId = (value: unknown): value is string => typeof value === "string" && /^[a-f0-9]{24}$/.test(value);

interface ImageDocument {
	_id: ObjectId;
	gallery: Gallery;
	description: string;
	favorite?: true | null;
	png: Binary;
	width: number;
	height: number;
	actor: string;
	requestId: string;
	createdAt: Date;
}

export interface GalleryStore {
	ensureIndexes: () => Promise<void>;
	list: (gallery: Gallery, before?: string) => Promise<{ items: { id: string; description: string; width: number; height: number; favorite?: true }[]; next: string | null }>;
	setFavorite: (id: string, favorite: boolean, context: { actor: string; requestId: string }) => Promise<boolean>;
	image: (gallery: Gallery, id: string) => Promise<Buffer | undefined>;
	publish: (image: Omit<ImageDocument, "_id" | "png" | "createdAt">, png: Buffer) => Promise<string>;
}

function chunk(name: string, data: Buffer) {
	const output = Buffer.alloc(12 + data.length);
	output.writeUInt32BE(data.length);
	output.write(name, 4, 4, "ascii");
	data.copy(output, 8);
	output.writeUInt32BE(crc32(output.subarray(4, -4)), output.length - 4);
	return output;
}

const compress = promisify(deflate);

export async function encodePixels(width: number, height: number, pixels: Buffer) {
	if (![width, height].every(side => Number.isInteger(side) && side >= 1 && side <= MAX_SIDE)
		|| pixels.length !== width * height * 4) {
		throw new RangeError("Invalid dimensions");
	}
	const stride = width * 4;
	const rows = Buffer.alloc((stride + 1) * height);
	for (let row = 0; row < height; row++)
		pixels.copy(rows, row * (stride + 1) + 1, row * stride, (row + 1) * stride);
	const header = Buffer.alloc(13);
	header.writeUInt32BE(width);
	header.writeUInt32BE(height, 4);
	header[8] = 8;
	header[9] = 6;
	return Buffer.concat([Buffer.from("89504e470d0a1a0a", "hex"), chunk("IHDR", header), chunk("IDAT", await compress(rows)), chunk("IEND", Buffer.alloc(0))]);
}

export function createGalleryStore(db: Db): GalleryStore {
	const images = db.collection<ImageDocument>("gallery_images");
	const audit = db.collection("gallery_favorite_audit");
	return {
		async ensureIndexes() {
			await images.createIndex({ gallery: 1, _id: -1 });
			await images.createIndex({ gallery: 1, favorite: -1, _id: -1 });
		},
		async list(gallery, before) {
			const photos = gallery === "photos";
			const pageSize = photos ? PHOTOS_PAGE_SIZE : DRAWINGS_PAGE_SIZE;
			const query: Filter<ImageDocument> = { gallery };
			if (before) {
				const id = new ObjectId(before);
				if (photos) {
					const anchor = await images.findOne({ gallery, _id: id }, { projection: { favorite: 1 } });
					if (!anchor) return { items: [], next: null };
					if (anchor.favorite) {
						query.$or = [{ favorite: true, _id: { $lt: id } }, { favorite: { $eq: null } }];
					}
					else {
						query.favorite = { $eq: null };
						query._id = { $lt: id };
					}
				}
				else {
					query._id = { $lt: id };
				}
			}
			const docs = await images.find(query, { projection: { _id: 1, description: 1, width: 1, height: 1, favorite: 1 } })
				.sort(photos ? { favorite: -1, _id: -1 } : { _id: -1 })
				.limit(pageSize + 1)
				.toArray();
			const items = docs.slice(0, pageSize).map(({ _id, description, width, height, favorite }) => ({
				id: _id.toHexString(),
				description,
				width,
				height,
				...(photos && favorite ? { favorite } : {})
			}));
			return { items, next: docs.length > pageSize ? items[pageSize - 1]!.id : null };
		},
		async setFavorite(id, favorite, context) {
			const filter = { gallery: "photos" as const, _id: new ObjectId(id) };
			const event = { ...context, imageId: filter._id, requestedFavorite: favorite };
			await audit.insertOne({ ...event, phase: "attempt", occurredAt: new Date() });
			let previous: Pick<ImageDocument, "favorite"> | null;
			try {
				previous = await images.findOneAndUpdate(filter, favorite ? { $set: { favorite: true } } : { $unset: { favorite: "" } }, { projection: { favorite: 1 }, returnDocument: "before" });
			}
			catch (error) {
				await audit.insertOne({ ...event, phase: "result", outcome: "failed", occurredAt: new Date() });
				throw error;
			}
			await audit.insertOne({
				...event,
				phase: "result",
				outcome: previous ? "succeeded" : "not_found",
				previousFavorite: previous ? Boolean(previous.favorite) : null,
				occurredAt: new Date()
			});
			return previous !== null;
		},
		async image(gallery, id) {
			const doc = await images.findOne({ gallery, _id: new ObjectId(id) }, { projection: { png: 1 } });
			return doc ? Buffer.from(doc.png.value()) : undefined;
		},
		async publish(image, png) {
			const result = await images.insertOne({ ...image, _id: new ObjectId(), png: new Binary(png), createdAt: new Date() });
			return result.insertedId.toHexString();
		}
	};
}
