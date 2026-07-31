import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const lock = JSON.parse(await readFile(path.join(process.cwd(), "package-lock.json"), "utf8"));
const packages = lock.packages || {};
const linuxNativePattern = /(?:^|[/@-])linux-(?:arm64|x64)(?:-(?:gnu|musl))?$/;
const required = new Set();

for (const metadata of Object.values(packages)) {
	for (const [dependency, version] of Object.entries(metadata.optionalDependencies || {})) {
		if (linuxNativePattern.test(dependency)) required.add(`${dependency}@${version}`);
	}
}

if (!required.size) throw new Error("No Linux native optional dependencies were found in package-lock.json.");

const missing = [...required].filter((entry) => {
	const separator = entry.lastIndexOf("@");
	const dependency = entry.slice(0, separator);
	const expectedVersion = entry.slice(separator + 1);
	return !Object.entries(packages).some(
		([packagePath, metadata]) =>
			(packagePath === `node_modules/${dependency}` || packagePath.endsWith(`/node_modules/${dependency}`))
			&& metadata.version === expectedVersion
	);
});

if (missing.length) {
	throw new Error(`Missing deploy-target native packages from package-lock.json: ${missing.join(", ")}`);
}

process.stdout.write(`Verified ${required.size} Linux native lockfile entries.\n`);
