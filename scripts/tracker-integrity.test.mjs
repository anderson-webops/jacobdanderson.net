import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import { createHash } from "node:crypto";
import test from "node:test";
import { TRACKER_CONSUMER_ORIGIN, verifyTrackerBytes, verifyTrackerHeaders } from "./tracker-integrity.mjs";

test("tracker verification rejects changed, empty and oversized bytes", () => {
	const bytes = Buffer.from("fixture");
	const expected = `sha384-${createHash("sha384").update(bytes).digest("base64")}`;
	assert.equal(verifyTrackerBytes(bytes, expected), expected);
	for (const invalid of [Buffer.from("changed"), Buffer.alloc(0), Buffer.alloc(65_537)]) {
		assert.throws(() => verifyTrackerBytes(invalid, expected));
	}
});

test("tracker requires a successful script response with usable CORS", () => {
	const headers = new Headers({ "content-type": "application/javascript; charset=utf-8", "access-control-allow-origin": TRACKER_CONSUMER_ORIGIN });
	assert.equal(verifyTrackerHeaders(200, headers), TRACKER_CONSUMER_ORIGIN);
	assert.throws(() => verifyTrackerHeaders(403, headers));
	for (const [name, value] of [["content-type", "text/html"], ["access-control-allow-origin", "https://other.invalid"], ["access-control-allow-origin", ""]]) {
		const invalid = new Headers(headers);
		invalid.set(name, value);
		assert.throws(() => verifyTrackerHeaders(200, invalid));
	}
});
