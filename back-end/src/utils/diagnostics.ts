import { Buffer } from "node:buffer";
import { timingSafeEqual } from "node:crypto";

export interface DiagnosticsAccessInput {
	configuredKey?: string;
	enabled?: boolean;
	providedKey?: string;
}

const MIN_DIAGNOSTICS_KEY_BYTES = 32;
const MAX_DIAGNOSTICS_KEY_BYTES = 512;

function validDiagnosticsKey(value: string | undefined): value is string {
	if (!value || /[\r\n\0]/.test(value)) return false;
	const bytes = Buffer.byteLength(value);
	return bytes >= MIN_DIAGNOSTICS_KEY_BYTES && bytes <= MAX_DIAGNOSTICS_KEY_BYTES;
}

export function validateDiagnosticsConfiguration(enabled: boolean, configuredKey: string | undefined) {
	if (enabled && !validDiagnosticsKey(configuredKey)) {
		throw new Error("Enabled diagnostics require an INTERNAL_DIAGNOSTICS_KEY of 32 to 512 bytes without controls.");
	}
}

export function canReadDiagnostics({
	configuredKey,
	enabled,
	providedKey
}: DiagnosticsAccessInput): boolean {
	if (!enabled || !validDiagnosticsKey(configuredKey) || !validDiagnosticsKey(providedKey)) return false;
	const expected = Buffer.from(configuredKey);
	const received = Buffer.from(providedKey);
	return expected.length === received.length && timingSafeEqual(expected, received);
}
