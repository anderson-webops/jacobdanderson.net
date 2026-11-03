import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import { compatibleImport, patchLayoutsSource, upstreamImport } from "./patch-layouts-brace-expansion.mjs";

const repoRoot = resolve(import.meta.dirname, "..");
const lock = JSON.parse(readFileSync(resolve(repoRoot, "package-lock.json"), "utf8"));
const targets = [
	resolve(repoRoot, "node_modules/vite-plugin-vue-layouts-next/dist/index.mjs"),
	resolve(repoRoot, "front-end/node_modules/vite-plugin-vue-layouts-next/dist/index.mjs")
].filter(existsSync);

test("the layouts dependency uses audited brace-expansion", () => {
	assert.equal(lock.packages["front-end/node_modules/brace-expansion"].version, "5.0.12");
	assert.equal(lock.packages["front-end/node_modules/vite-plugin-vue-layouts-next/node_modules/brace-expansion"], undefined);
});

test("the installed layouts module has the compatible named import", () => {
	assert.ok(targets.length > 0);
	for (const target of targets) {
		const patched = readFileSync(target, "utf8");
		assert.ok(patched.includes(compatibleImport));
		assert.ok(!patched.includes(upstreamImport));
		assert.equal(patchLayoutsSource(patched), patched);
	}
});

test("the exact upstream source is patched once and source drift is rejected", () => {
	assert.ok(targets.length > 0);
	for (const target of targets) {
		const patched = readFileSync(target, "utf8");
		const upstream = patched.replace(compatibleImport, upstreamImport);
		assert.notEqual(upstream, patched);
		assert.equal(patchLayoutsSource(upstream), patched);
		assert.throws(() => patchLayoutsSource(`${upstream}\n`), /Unexpected vite-plugin-vue-layouts-next source/u);
	}
});
