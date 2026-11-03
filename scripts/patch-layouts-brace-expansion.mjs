import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

export const upstreamSha256 = "0ce2bb6f196b1a307f2e20944fdd40a3078ff65f6129b48457465be227118cf2";
export const upstreamImport = "import expand from \"brace-expansion\";";
export const compatibleImport = "import { expand } from \"brace-expansion\";";

export function patchLayoutsSource(source) {
	const original = source.includes(compatibleImport)
		? source.replace(compatibleImport, upstreamImport)
		: source;
	const digest = createHash("sha256").update(original).digest("hex");
	if (digest !== upstreamSha256 || original.split(upstreamImport).length !== 2) {
		throw new Error("Unexpected vite-plugin-vue-layouts-next source; review its brace-expansion import before installation.");
	}
	return source.includes(compatibleImport) ? source : source.replace(upstreamImport, compatibleImport);
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
	const repoRoot = resolve(import.meta.dirname, "..");
	const targets = [
		resolve(repoRoot, "node_modules/vite-plugin-vue-layouts-next/dist/index.mjs"),
		resolve(repoRoot, "front-end/node_modules/vite-plugin-vue-layouts-next/dist/index.mjs")
	];
	for (const target of targets) {
		if (!existsSync(target)) continue;
		const source = readFileSync(target, "utf8");
		const patched = patchLayoutsSource(source);
		if (patched !== source) writeFileSync(target, patched);
		console.log(`[patch-layouts-brace-expansion] verified ${target}`);
	}
}
