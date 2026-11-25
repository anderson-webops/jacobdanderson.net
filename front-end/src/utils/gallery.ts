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

export async function fetchGalleryPage(gallery: Gallery, before: string | null = null) {
	const response = await fetch(`/api/gallery/${gallery}${before ? `?before=${before}` : ""}`, {
		credentials: "omit"
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
