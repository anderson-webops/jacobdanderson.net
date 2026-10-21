// Stable in-page anchor ids so other pages can deep-link to a specific card.
export function toAnchor(value: string) {
	return value
		.normalize("NFKD")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}
