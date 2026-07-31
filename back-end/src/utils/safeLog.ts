export function errorCategory(error: unknown): string {
	if (error instanceof Error) return error.name || "Error";
	if (typeof error === "object" && error && "code" in error) {
		const code = String((error as { code?: unknown }).code);
		if (/^[\w-]{1,40}$/.test(code)) return `Error:${code}`;
	}
	return "UnknownError";
}

export function logError(context: string, error: unknown) {
	console.error(`${context}: ${errorCategory(error)}`);
}
