import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import { randomBytes } from "node:crypto";
import { it } from "node:test";
import { inflateSync } from "node:zlib";
import { createPreview, encodePixels } from "../src/models/galleryPng.js";

it("shrinks landscape and portrait previews without widening the aspect ratio", async () => {
	for (const [width, height] of [[1024, 712], [396, 1024]]) {
		const full = await encodePixels(width!, height!, randomBytes(width! * height! * 4));
		const preview = await createPreview(full);
		assert.equal(preview.readUInt32BE(16), width! / 2);
		assert.equal(preview.readUInt32BE(20), height! / 2);
		assert.ok(preview.byteLength < full.byteLength * 0.35);
	}
});

it("averages visible colors without darkening transparent drawing edges", async () => {
	const pixels = randomBytes(1024 * 2 * 4);
	const opaque = [200, 150, 100, 255];
	const transparent = [0, 0, 255, 0];
	pixels.set([...opaque, ...transparent], 0);
	pixels.set([...opaque, ...transparent], 1024 * 4);
	const preview = await createPreview(await encodePixels(1024, 2, pixels));
	const scanlines = inflateSync(preview.subarray(41, 41 + preview.readUInt32BE(33)));
	assert.deepEqual([...scanlines.subarray(0, 5)], [1, 200, 150, 100, 128]);
});

it("leaves small, invalid and unsupported sources unchanged", async () => {
	const small = await encodePixels(2, 4, Buffer.alloc(32));
	assert.equal(await createPreview(small), small);
	const invalid = Buffer.from("invalid PNG");
	assert.equal(await createPreview(invalid), invalid);
	const corrupted = await encodePixels(1024, 2, Buffer.alloc(8192));
	corrupted[41] = 0;
	assert.equal(await createPreview(corrupted), corrupted);
});
