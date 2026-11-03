import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { TRACKER_INTEGRITY, TRACKER_URL } from "../front-end/src/config/analytics.ts";

export const TRACKER_CONSUMER_ORIGIN = "https://jacobdanderson.net";

export function verifyTrackerBytes(bytes, expected = TRACKER_INTEGRITY) {
	assert.ok(bytes.length > 0 && bytes.length <= 65_536, "Tracker size is outside the reviewed bound");
	const integrity = `sha384-${createHash("sha384").update(bytes).digest("base64")}`;
	assert.equal(integrity, expected, "Pinned tracker integrity mismatch");
	return integrity;
}

export function verifyTrackerHeaders(status, headers) {
	assert.equal(status, 200, "Tracker request did not succeed");
	assert.match(headers.get("content-type") ?? "", /^(?:application|text)\/javascript(?:;|$)/iu);
	const origin = headers.get("access-control-allow-origin");
	assert.ok(origin === TRACKER_CONSUMER_ORIGIN || origin === "*", "Tracker CORS does not allow this site");
	return origin;
}

export async function fetchPinnedTracker() {
	const response = await fetch(TRACKER_URL, {
		redirect: "error",
		headers: { Origin: TRACKER_CONSUMER_ORIGIN },
		signal: AbortSignal.timeout(20_000)
	});
	const corsOrigin = verifyTrackerHeaders(response.status, response.headers);
	const chunks = [];
	let size = 0;
	for await (const chunk of response.body) {
		size += chunk.length;
		assert.ok(size <= 65_536, "Tracker response exceeded the reviewed bound");
		chunks.push(Buffer.from(chunk));
	}
	const body = Buffer.concat(chunks);
	const integrity = verifyTrackerBytes(body);
	return {
		body,
		receipt: { passed: true, url: TRACKER_URL, integrity, bytes: size, corsOrigin }
	};
}

if (import.meta.url.startsWith("file:") && process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
	console.log(JSON.stringify((await fetchPinnedTracker()).receipt));
}
