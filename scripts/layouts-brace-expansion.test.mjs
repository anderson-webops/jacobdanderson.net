import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { findPackageJSON } from "node:module";
import { resolve } from "node:path";
import test from "node:test";
import { pathToFileURL } from "node:url";
import { compatibleImport, patchLayoutsSource, upstreamImport } from "./patch-layouts-brace-expansion.mjs";

const repoRoot = resolve(import.meta.dirname, "..");
const approved = JSON.parse(readFileSync(resolve(repoRoot, "package.json"), "utf8")).overrides["brace-expansion"];
const targets = [
	resolve(repoRoot, "node_modules/vite-plugin-vue-layouts-next/dist/index.mjs"),
	resolve(repoRoot, "front-end/node_modules/vite-plugin-vue-layouts-next/dist/index.mjs")
].filter(existsSync);

test("the layouts dependency uses audited brace-expansion", () => {
	assert.ok(targets.length > 0);
	for (const target of targets) {
		const filename = findPackageJSON("brace-expansion", pathToFileURL(target));
		assert.ok(filename, "The installed layouts module must resolve brace-expansion");
		const dependency = JSON.parse(readFileSync(filename, "utf8"));
		assert.equal(dependency.version, approved);
	}
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
