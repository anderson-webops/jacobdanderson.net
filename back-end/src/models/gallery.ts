import type { Db, Filter } from "mongodb";
import { Buffer } from "node:buffer";
import { Binary, ObjectId } from "mongodb";
import { createPreview } from "./galleryPng.js";

const PREVIEW_CACHE_BYTES = 4 * 1024 * 1024;
const PREVIEW_CACHE_ITEMS = 128;
const COLD_PREVIEW_LIMIT = 2;
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
	image: (gallery: Gallery, id: string, preview?: boolean) => Promise<Buffer | undefined>;
	publish: (image: Omit<ImageDocument, "_id" | "png" | "createdAt">, png: Buffer) => Promise<string>;
}

export function createGalleryStore(db: Db): GalleryStore {
	const images = db.collection<ImageDocument>("gallery_images");
	const audit = db.collection("gallery_favorite_audit");
	const previews = new Map<string, Buffer>();
	let previewBytes = 0;
	let activePreviews = 0;
	const waitingPreviews: (() => void)[] = [];

	async function withPreviewSlot<T>(operation: () => Promise<T>) {
		if (activePreviews < COLD_PREVIEW_LIMIT) {
			activePreviews++;
		}
		else {
			if (waitingPreviews.length >= COLD_PREVIEW_LIMIT) throw new Error("Gallery preview capacity exhausted");
			await new Promise<void>(resolve => waitingPreviews.push(resolve));
		}
		try {
			return await operation();
		}
		finally {
			const next = waitingPreviews.shift();
			if (next) next();
			else activePreviews--;
		}
	}

	async function readPng(gallery: Gallery, id: string) {
		const doc = await images.findOne({ gallery, _id: new ObjectId(id) }, { projection: { png: 1 } });
		if (!doc) return undefined;
		const bytes = doc.png.value();
		return Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength);
	}

	function cachePreview(key: string, bytes: Buffer) {
		if (bytes.length > PREVIEW_CACHE_BYTES || previews.has(key)) return;
		previews.set(key, bytes);
		previewBytes += bytes.length;
		while (previewBytes > PREVIEW_CACHE_BYTES || previews.size > PREVIEW_CACHE_ITEMS) {
			const oldest = previews.entries().next().value;
			if (!oldest) break;
			previews.delete(oldest[0]);
			previewBytes -= oldest[1].length;
		}
	}
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
		async image(gallery, id, preview) {
			if (!preview) return readPng(gallery, id);
			const key = `${gallery}/${id}`;
			const cached = previews.get(key);
			if (cached) {
				previews.delete(key);
				previews.set(key, cached);
				return cached;
			}
			return withPreviewSlot(async () => {
				const recent = previews.get(key);
				if (recent) return recent;
				const png = await readPng(gallery, id);
				if (!png) return undefined;
				const resized = await createPreview(png);
				if (resized !== png) cachePreview(key, resized);
				return resized;
			});
		},
		async publish(image, png) {
			const result = await images.insertOne({ ...image, _id: new ObjectId(), png: new Binary(png), createdAt: new Date() });
			return result.insertedId.toHexString();
		}
	};
}
