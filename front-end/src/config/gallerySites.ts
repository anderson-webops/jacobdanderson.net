export const GALLERY_DOCUMENTS = "/.gallery-sites";

export const GALLERY_SITES = [
	{
		gallery: "photos",
		hostname: "pictures.jacobdanderson.net",
		title: "Top Photos | Jacob Anderson",
		description: "Jacob Anderson’s photos gallery."
	},
	{
		gallery: "drawings",
		hostname: "drawings.jacobdanderson.net",
		title: "Top Drawings | Jacob Anderson",
		description: "Jacob Anderson’s drawings gallery."
	}
] as const;

export type GallerySite = (typeof GALLERY_SITES)[number];

export function galleryDocumentPath(site: GallerySite) {
	return `${GALLERY_DOCUMENTS}/${site.gallery}`;
}

export function galleryOrigin(site: GallerySite) {
	return `https://${site.hostname}`;
}
