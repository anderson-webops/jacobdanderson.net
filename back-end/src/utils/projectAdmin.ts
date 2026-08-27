import { Buffer } from "node:buffer";
import { timingSafeEqual } from "node:crypto";

const MIN_ADMIN_KEY_LENGTH = 32;
const MAX_ADMIN_KEY_LENGTH = 512;
const ADMIN_KEY_PATTERN = /^[\w-]+$/;

export const PROJECT_ADMIN_HEADER = "x-portfolio-admin-key";

export function validateProjectAdminConfiguration(enabled: boolean, configuredKey: string | undefined): void {
	const key = configuredKey?.trim();
	if (!key) {
		if (enabled) throw new Error("PROJECT_ADMIN_PROXY_KEY is required when project administration is enabled.");
		return;
	}

	if (
		configuredKey !== key
		|| key.length < MIN_ADMIN_KEY_LENGTH
		|| key.length > MAX_ADMIN_KEY_LENGTH
		|| !ADMIN_KEY_PATTERN.test(key)
	) {
		throw new Error("PROJECT_ADMIN_PROXY_KEY must use 32 to 512 base64url characters.");
	}
}

export function canUseProjectAdmin({
	configuredKey,
	enabled,
	providedKey
}: {
	configuredKey: string | undefined;
	enabled: boolean;
	providedKey: string | undefined;
}): boolean {
	if (!enabled || !configuredKey || !providedKey) return false;

	const expected = Buffer.from(configuredKey);
	const provided = Buffer.from(providedKey);
	return expected.length === provided.length && timingSafeEqual(expected, provided);
}

export function isLoopbackRemoteAddress(address: string | undefined): boolean {
	return address === "127.0.0.1" || address === "::1" || address === "::ffff:127.0.0.1";
}
