import type { Db, Document, Filter } from "mongodb";
import type { ProjectAdminAuditContext } from "../utils/adminAudit.js";
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
	gallery: Gallery | `hidden-${Gallery}`;
	orderKey?: string;
	description: string;
	favorite?: true | null;
	png: Binary;
	width: number;
	height: number;
	actor: string;
	requestId: string;
	createdAt: Date;
}

export type GalleryEdit = { favorite: boolean } | { visible: boolean } | { direction: "earlier" | "later" } | { confirm: string };
export interface GalleryStore {
	ensureIndexes: () => Promise<void>;
	list: (gallery: Gallery, before?: string, hidden?: boolean) => Promise<{ items: { id: string; description: string; width: number; height: number; favorite?: true }[]; next: string | null }>;
	edit: (gallery: Gallery, id: string, change: GalleryEdit, context: ProjectAdminAuditContext) => Promise<204 | 404 | 409>;
	image: (gallery: Gallery, id: string, preview?: boolean, hidden?: boolean) => Promise<Buffer | undefined>;
	publish: (image: Omit<ImageDocument, "_id" | "png" | "createdAt">, png: Buffer) => Promise<string>;
}

const privateGallery = (gallery: Gallery): ImageDocument["gallery"] => `hidden-${gallery}`;
type Position = Pick<ImageDocument, "_id" | "favorite" | "orderKey">;
const orderKey = (item: Position) => item.orderKey ?? `${item._id.toHexString()}8`;
const metadata = {
	_id: 1,
	width: 1,
	height: 1,
	description: 1,
	favorite: { $eq: [{ $ifNull: ["$favorite", false] }, true] },
	orderKey: { $ifNull: ["$orderKey", { $concat: [{ $toString: "$_id" }, "8"] }] }
};
const listOptions = { maxTimeMS: 3000, allowDiskUse: false, hint: "gallery_listing_v1" };

function relativeTo(item: Position, earlier: boolean) {
	const compare = earlier ? "$gt" : "$lt";
	return [{ orderKey: { [compare]: orderKey(item) } }, { orderKey: orderKey(item), _id: { [compare]: item._id } }];
}

function between(lower: string, upper?: string): string {
	let prefix = "";
	for (let index = 0; ; index++) {
		const low = Number.parseInt(lower[index] ?? "0", 16);
		const high = upper?.[index] === undefined ? 16 : Number.parseInt(upper[index]!, 16);
		if (high - low > 1) return prefix + Math.floor((low + high) / 2).toString(16);
		if (high > low) return `${prefix + low.toString(16) + lower.slice(index + 1)}8`;
		prefix += low.toString(16);
	}
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

	async function readPng(gallery: ImageDocument["gallery"], id: string) {
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
			await images.createIndex({ gallery: 1, favorite: -1, orderKey: -1, _id: -1, width: 1, height: 1, description: 1 }, { name: listOptions.hint });
		},
		async list(gallery, before, hidden = false) {
			const pageSize = gallery === "photos" ? PHOTOS_PAGE_SIZE : DRAWINGS_PAGE_SIZE;
			const scope = hidden ? privateGallery(gallery) : gallery;
			const pipeline: Document[] = [{ $match: { gallery: scope } }, { $project: metadata }];
			if (before) {
				const anchor = await images.findOne({ gallery: scope, _id: new ObjectId(before) }, { projection: { favorite: 1, orderKey: 1 } });
				if (!anchor) return { items: [], next: null };
				pipeline.push({ $match: { $or: [
					...(anchor.favorite ? [{ favorite: false }] : []),
					{ favorite: Boolean(anchor.favorite), $or: relativeTo(anchor, false) }
				] } });
			}
			pipeline.push({ $sort: { favorite: -1, orderKey: -1, _id: -1 } }, { $limit: pageSize + 1 });
			const docs = await images.aggregate<ImageDocument>(pipeline, listOptions).toArray();
			const items = docs.slice(0, pageSize).map(({ _id, description, width, height, favorite }) => ({
				id: _id.toHexString(),
				description,
				width,
				height,
				...(favorite ? { favorite } : {})
			}));
			return { items, next: docs.length > pageSize ? items[pageSize - 1]!.id : null };
		},
		async edit(gallery, id, change, context) {
			const filter: Filter<ImageDocument> = { gallery: { $in: [gallery, privateGallery(gallery)] }, _id: new ObjectId(id) };
			const event = { ...context, gallery, imageId: filter._id, change, ...("favorite" in change ? { requestedFavorite: change.favorite } : {}) };
			await audit.insertOne({ ...event, phase: "attempt", occurredAt: new Date() });
			const projection = { favorite: 1, gallery: 1, orderKey: 1 };
			let result: 204 | 404 | 409 = 404;
			let previous: ImageDocument | null = null;
			try {
				if ("direction" in change) {
					const anchor = await images.findOne({ ...filter, gallery }, { projection });
					if (anchor) {
						result = 409;
						const earlier = change.direction === "earlier";
						const direction = earlier ? 1 : -1;
						const [neighbor, beyond] = await images.aggregate<Position>([
							{ $match: { gallery, favorite: anchor.favorite ? true : null } },
							{ $project: { orderKey: metadata.orderKey } },
							{ $match: { $or: relativeTo(anchor, earlier) } },
							{ $sort: { orderKey: direction, _id: direction } },
							{ $limit: 2 }
						], listOptions).toArray();
						if (neighbor) {
							const low = earlier ? orderKey(neighbor) : beyond && orderKey(beyond);
							const high = earlier ? beyond && orderKey(beyond) : orderKey(neighbor);
							if (!low || !high || low < high) {
								const rank = between(low ?? "", high);
								previous = await images.findOneAndUpdate({ ...filter, gallery, favorite: anchor.favorite ?? null, orderKey: anchor.orderKey ?? { $exists: false } }, { $set: { orderKey: rank } }, { projection });
							}
						}
					}
				}
				else if ("confirm" in change) {
					if (change.confirm !== id) throw new Error("Deletion was not confirmed");
					previous = await images.findOneAndDelete(filter, { projection });
				}
				else if ("visible" in change) {
					previous = await images.findOneAndUpdate(filter, { $set: { gallery: change.visible ? gallery : privateGallery(gallery) } }, { projection });
				}
				else {
					previous = await images.findOneAndUpdate(filter, change.favorite ? { $set: { favorite: true } } : { $unset: { favorite: "" } }, { projection });
				}
				if (previous) {
					result = 204;
					if ("visible" in change || "confirm" in change) {
						for (const scope of [gallery, privateGallery(gallery)]) {
							const key = `${scope}/${id}`;
							previewBytes -= previews.get(key)?.length ?? 0;
							previews.delete(key);
						}
					}
				}
			}
			catch (error) {
				await audit.insertOne({ ...event, phase: "result", outcome: "failed", occurredAt: new Date() });
				throw error;
			}
			await audit.insertOne({
				...event,
				phase: "result",
				outcome: result === 204 ? "succeeded" : result === 409 ? "conflict" : "not_found",
				previousGallery: previous?.gallery ?? null,
				previousOrder: previous && orderKey(previous),
				previousFavorite: previous ? Boolean(previous.favorite) : null,
				occurredAt: new Date()
			});
			return result;
		},
		async image(gallery, id, preview, hidden = false) {
			const scope = hidden ? privateGallery(gallery) : gallery;
			if (!preview) return readPng(scope, id);
			const key = `${scope}/${id}`;
			const cached = previews.get(key);
			if (cached) {
				if (!await images.findOne({ gallery: scope, _id: new ObjectId(id) }, { projection: { _id: 1 } })) return undefined;
				previews.delete(key);
				previews.set(key, cached);
				return cached;
			}
			return withPreviewSlot(async () => {
				const png = await readPng(scope, id);
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
