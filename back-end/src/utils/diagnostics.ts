import { Buffer } from "node:buffer";
import { timingSafeEqual } from "node:crypto";

export interface DiagnosticsAccessInput {
	configuredKey?: string;
	enabled?: boolean;
	providedKey?: string;
}

export function validateDiagnosticsConfiguration(enabled: boolean, configuredKey: string | undefined) {
	if (enabled && (!configuredKey || configuredKey.length < 32)) {
		throw new Error("Enabled diagnostics require an INTERNAL_DIAGNOSTICS_KEY of at least 32 characters.");
	}
}

export function canReadDiagnostics({
	configuredKey,
	enabled,
	providedKey
}: DiagnosticsAccessInput): boolean {
	if (!enabled || !configuredKey || configuredKey.length < 32 || !providedKey) return false;
	const expected = Buffer.from(configuredKey);
	const received = Buffer.from(providedKey);
	return expected.length === received.length && timingSafeEqual(expected, received);
}
