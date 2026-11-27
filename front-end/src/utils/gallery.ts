import { prioritizeGalleryList } from "./galleryImages";

export type Gallery = "photos" | "drawings";

export interface GalleryItem {
	id: string;
	description: string;
	width: number;
	height: number;
	favorite?: true;
}

const validId = (value: unknown) => typeof value === "string" && /^[a-f0-9]{24}$/.test(value);
const validSide = (value: number) => Number.isInteger(value) && value > 0;

export async function fetchGalleryPage(
	gallery: Gallery,
	before: string | null = null,
	signal?: AbortSignal,
	hiddenFetch?: typeof fetch
) {
	const path = hiddenFetch ? `/api/admin/gallery/${gallery}/hidden` : `/api/gallery/${gallery}`;
	const url = path + (before ? `?before=${before}` : "");
	const response = await prioritizeGalleryList(async () => {
		for (let attempt = 0; ; attempt++) {
			signal?.throwIfAborted();
			const result = await (hiddenFetch ?? fetch)(url, { credentials: "omit", signal });
			if (![429, 503].includes(result.status) || attempt >= 3) return result;
			const header = result.headers?.get("Retry-After")?.trim();
			const requested =
				header && /^\d+$/.test(header) ? Number(header) * 1000 : Date.parse(header || "") - Date.now();
			const delay = Number.isNaN(requested) ? 750 * 2 ** attempt : Math.max(100, requested);
			if (delay > 30000) return result;
			await result.body?.cancel();
			await new Promise<void>((resolve, reject) => {
				let timer: ReturnType<typeof setTimeout>;
				const abort = () => {
					clearTimeout(timer);
					reject(signal?.reason);
				};
				timer = setTimeout(() => {
					signal?.removeEventListener("abort", abort);
					resolve();
				}, delay);
				signal?.addEventListener("abort", abort, { once: true });
				if (signal?.aborted) abort();
			});
		}
	});
	if (!response.ok) throw new Error("Gallery request failed");
	const payload = await response.json();
	if (
		!Array.isArray(payload.items) ||
		payload.items.length > (gallery === "photos" ? 24 : 12) ||
		!(payload.next === null || (validId(payload.next) && payload.next !== before)) ||
		!payload.items.every(
			(item: GalleryItem) =>
				item &&
				validId(item.id) &&
				typeof item.description === "string" &&
				validSide(item.width) &&
				validSide(item.height) &&
				[true, undefined].includes(item.favorite)
		)
	) {
		throw new Error("Invalid gallery response");
	}
	return payload as { items: GalleryItem[]; next: string | null };
}
