import type { Db } from "mongodb";
import { Buffer } from "node:buffer";
import { promisify } from "node:util";
import { crc32, deflate } from "node:zlib";
import { Binary, ObjectId } from "mongodb";

export const MAX_SIDE = 1024;
export const PAGE_SIZE = 12;
export type Gallery = "photos" | "drawings";
export const isGallery = (value: unknown): value is Gallery => value === "photos" || value === "drawings";
export const isImageId = (value: unknown): value is string => typeof value === "string" && /^[a-f0-9]{24}$/.test(value);

interface ImageDocument {
	_id: ObjectId;
	gallery: Gallery;
	description: string;
	png: Binary;
	width: number;
	height: number;
	actor: string;
	requestId: string;
	createdAt: Date;
}

export interface GalleryStore {
	list: (gallery: Gallery, before?: string) => Promise<{ items: { id: string; description: string; width: number; height: number }[]; next: string | null }>;
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
	return {
		async list(gallery, before) {
			const docs = await images.find({ gallery, ...(before ? { _id: { $lt: new ObjectId(before) } } : {}) }, { projection: { _id: 1, description: 1, width: 1, height: 1 } })
				.sort({ _id: -1 })
				.limit(PAGE_SIZE + 1)
				.toArray();
			const items = docs.slice(0, PAGE_SIZE).map(({ _id, description, width, height }) => ({
				id: _id.toHexString(),
				description,
				width,
				height
			}));
			return { items, next: docs.length > PAGE_SIZE ? items[PAGE_SIZE - 1]!.id : null };
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
