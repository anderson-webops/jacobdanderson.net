type Result = "loaded" | "failed" | "skipped";

interface Request {
	element: HTMLImageElement;
	url: string;
	needed: () => boolean;
	signal: AbortSignal;
	resolve: (result: Result) => void;
}

const MAX_ACTIVE = 4;
const MAX_STARTS = 7;
const RATE_WINDOW_MS = 1_050;
const LOAD_TIMEOUT_MS = 15_000;
const pending: Request[] = [];
let active = 0;
const recentStarts: number[] = [];
let scheduled: ReturnType<typeof setTimeout> | undefined;

function drain() {
	if (scheduled || active >= MAX_ACTIVE) return;
	while (pending[0] && (pending[0].signal.aborted || !pending[0].needed())) {
		pending.shift()!.resolve("skipped");
	}
	if (!pending.length) return;
	const now = performance.now();
	while (recentStarts[0] !== undefined && now - recentStarts[0] >= RATE_WINDOW_MS) recentStarts.shift();
	if (recentStarts.length >= MAX_STARTS) {
		const wait = RATE_WINDOW_MS - (now - recentStarts[0]!);
		scheduled = setTimeout(() => {
			scheduled = undefined;
			drain();
		}, wait);
		return;
	}

	const request = pending.shift()!;
	active++;
	recentStarts.push(now);
	const { element, signal } = request;

	let timeout: ReturnType<typeof setTimeout> | undefined;
	const complete = (event?: Event) => {
		const result = event?.type === "load" ? "loaded" : event?.type === "abort" ? "skipped" : "failed";
		clearTimeout(timeout);
		element.removeEventListener("load", complete);
		element.removeEventListener("error", complete);
		signal.removeEventListener("abort", complete);
		if (result !== "loaded") element.removeAttribute("src");
		active--;
		request.resolve(result);
		drain();
	};
	timeout = setTimeout(complete, LOAD_TIMEOUT_MS);
	element.addEventListener("load", complete);
	element.addEventListener("error", complete);
	signal.addEventListener("abort", complete, { once: true });
	element.src = request.url;
	drain();
}

export function requestGalleryImage(
	element: HTMLImageElement,
	url: string,
	needed: () => boolean,
	signal: AbortSignal,
	priority = false
): Promise<Result> {
	return new Promise(resolve => {
		const request = { element, url, needed, signal, resolve };
		if (priority) pending.unshift(request);
		else pending.push(request);
		drain();
	});
}
