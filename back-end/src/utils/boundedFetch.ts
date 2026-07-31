const DEFAULT_TIMEOUT_MS = 5_000;
const DEFAULT_MAX_BYTES = 64 * 1024;

export interface BoundedFetchOptions {
	maxBytes?: number;
	timeoutMs?: number;
}

async function readBoundedBody(response: Response, maxBytes: number): Promise<string> {
	const declaredLength = Number(response.headers.get("content-length") || "0");
	if (declaredLength > maxBytes) throw new Error("Upstream response exceeded the allowed size.");
	if (!response.body) return "";

	const reader = response.body.getReader();
	const decoder = new TextDecoder();
	let total = 0;
	let text = "";

	try {
		while (true) {
			const { done, value } = await reader.read();
			if (done) break;
			total += value.byteLength;
			if (total > maxBytes) {
				await reader.cancel();
				throw new Error("Upstream response exceeded the allowed size.");
			}
			text += decoder.decode(value, { stream: true });
		}
		text += decoder.decode();
		return text;
	}
	finally {
		reader.releaseLock();
	}
}

export async function fetchJsonBounded<T>(
	input: string | URL,
	init: RequestInit = {},
	options: BoundedFetchOptions = {}
): Promise<{ data: T; response: Response }> {
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? DEFAULT_TIMEOUT_MS);

	try {
		const response = await fetch(input, {
			...init,
			redirect: "error",
			signal: controller.signal
		});
		const text = await readBoundedBody(response, options.maxBytes ?? DEFAULT_MAX_BYTES);
		try {
			return {
				data: JSON.parse(text) as T,
				response
			};
		}
		catch {
			throw new Error("Upstream returned invalid JSON.");
		}
	}
	finally {
		clearTimeout(timeout);
	}
}
