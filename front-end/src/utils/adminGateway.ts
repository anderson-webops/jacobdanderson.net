import { GALLERY_SITES, galleryOrigin } from "~/config/gallerySites";

const origins = new Set(["https://jacobdanderson.net", ...GALLERY_SITES.map(galleryOrigin)]);
export type GatewayState = { mode: "basic" | "login" | "unavailable" } | { mode: "session"; csrf: string };

export async function probeAdminGateway(origin: string, signal: AbortSignal): Promise<GatewayState> {
	if (!origins.has(origin)) return { mode: "basic" };
	try {
		const response = await fetch("/api/admin/session", {
			method: "GET",
			credentials: "same-origin",
			mode: "same-origin",
			redirect: "error",
			cache: "no-store",
			signal
		});
		if (response.headers.get("X-Portfolio-Auth") !== "session") {
			return { mode: [403, 404, 405].includes(response.status) ? "basic" : "unavailable" };
		}
		if ([401, 403].includes(response.status)) return { mode: "login" };
		const csrf = response.headers.get("X-Portfolio-CSRF");
		if (response.status === 204 && csrf && /^[\w-]{32,128}$/.test(csrf)) return { mode: "session", csrf };
	} catch {
		return { mode: "unavailable" };
	}
	return { mode: "unavailable" };
}
