type Result = "loaded" | "failed" | "skipped";

interface Request {
	element: HTMLImageElement;
	url: string;
	needed: () => boolean;
	signal: AbortSignal;
	resolve: (result: Result) => void;
}

const MAX_ACTIVE = 4;
const START_INTERVAL_MS = 150;
const LOAD_TIMEOUT_MS = 15_000;
const pending: Request[] = [];
let active = 0;
let nextStart = 0;
let scheduled: ReturnType<typeof setTimeout> | undefined;

function drain() {
	if (scheduled || active >= MAX_ACTIVE) return;
	while (pending[0] && (pending[0].signal.aborted || !pending[0].needed())) {
		pending.shift()!.resolve("skipped");
	}
	if (!pending.length) return;
	const wait = nextStart - performance.now();
	if (wait > 0) {
		scheduled = setTimeout(() => {
			scheduled = undefined;
			drain();
		}, wait);
		return;
	}

	const request = pending.shift()!;
	active++;
	nextStart = performance.now() + START_INTERVAL_MS;
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
	signal: AbortSignal
): Promise<Result> {
	return new Promise(resolve => {
		pending.push({ element, url, needed, signal, resolve });
		drain();
	});
}
