import type { RouteLocationNormalizedLoaded } from "vue-router";

export const TRACKER_URL = "https://analytics.jacobdanderson.net/script.js";
export const TRACKER_INTEGRITY = "sha384-GCqIGuvWYg7O3NiELYWxOf/L6jh0MEUd1RXYXHaLbqZSLt7OY1ZAY8QSonb76YUk";
export const TRACKER_KEY = "site-analytics";
export const TRACKER_WEBSITE_ID = "2458e9b0-8758-42da-bf9b-d03167f78954";
export const TRACKER_FILTER = "portfolioAnalyticsBeforeSend";

function isPrivateUrl(value: unknown) {
	if (typeof value !== "string") return false;
	try {
		return /^\/(?:admin|api)(?:\/|$)/iu.test(new URL(value, "https://jacobdanderson.net").pathname);
	} catch {
		return true;
	}
}

export function filterAnalyticsPayload(_type: string, payload: Record<string, unknown>) {
	if (isPrivateUrl(payload.url)) return undefined;
	return isPrivateUrl(payload.referrer) ? { ...payload, referrer: "" } : payload;
}

export function installAnalyticsPrivacy(target: Window & typeof globalThis) {
	Object.assign(target, { [TRACKER_FILTER]: filterAnalyticsPayload });
}

export function isAdministrationRoute(route: Pick<RouteLocationNormalizedLoaded, "matched">) {
	return route.matched.some(record => (record.aliasOf ?? record).path === "/admin");
}
