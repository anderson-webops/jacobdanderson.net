import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { validateUpstreamReview } from "./verify-upstream.mjs";

const review = JSON.parse(readFileSync(new URL("../docs/upstream-vitesse.json", import.meta.url), "utf8"));

test("every reviewed upstream path has a bounded explicit disposition", () => {
	assert.equal(validateUpstreamReview(review), review);
	assert.equal(review.entries.length, 92);
});
test("review rejects unknown decisions, duplicates and missing evidence", () => {
	for (const mutate of [
		(copy) => { copy.entries[0].decision = "ignored"; },
		(copy) => { copy.entries.push(copy.entries[0]); },
		(copy) => { copy.entries[0].reason = ""; },
		(copy) => { copy.entries[0].targets = []; },
		(copy) => { copy.upstreamCommit = "main"; }
	]) {
		const copy = structuredClone(review);
		mutate(copy);
		assert.throws(() => validateUpstreamReview(copy));
	}
});
test("review refuses absolute or escaping source/target paths", () => {
	for (const target of ["../other-site/file", "/private/file", "src/../../outside", "src/./file"]) {
		const copy = structuredClone(review);
		copy.entries[0].targets = [target];
		assert.throws(() => validateUpstreamReview(copy));
	}
});
