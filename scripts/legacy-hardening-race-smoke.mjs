import assert from "node:assert/strict";
import {
	chmod,
	link,
	lstat,
	mkdir,
	mkdtemp,
	readFile,
	readlink,
	rename,
	rm,
	symlink,
	writeFile
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { hardenSourceEntries } from "../deploy/systemd/legacy-runtime-artifact.mjs";

const workDirectory = await mkdtemp(path.join(os.tmpdir(), "portfolio-legacy-hardening-"));
const ownerUid = process.getuid();
const ownerGid = process.getgid();

function entries(extra = []) {
	return [
		{ mode: 0o755, path: "node_modules", type: "directory" },
		{ mode: 0o755, path: "node_modules/runtime-package", type: "directory" },
		...extra
	];
}

async function metadata(file) {
	const stats = await lstat(file);
	return { gid: stats.gid, mode: stats.mode & 0o777, uid: stats.uid };
}

try {
	const source = path.join(workDirectory, "source");
	const packageDirectory = path.join(source, "node_modules/runtime-package");
	const outside = path.join(workDirectory, "outside");
	await mkdir(packageDirectory, { recursive: true });
	await mkdir(outside);
	await writeFile(path.join(packageDirectory, "index.js"), "safe\n", { mode: 0o600 });
	const outsideFile = path.join(outside, "index.js");
	await writeFile(outsideFile, "host\n", { mode: 0o600 });
	const outsideBefore = await metadata(outsideFile);
	await rename(packageDirectory, path.join(workDirectory, "detached-package"));
	await symlink(outside, packageDirectory);
	await assert.rejects(hardenSourceEntries(source, entries(), ownerUid, ownerGid));
	assert.deepEqual(await metadata(outsideFile), outsideBefore);
	assert.equal(await readFile(outsideFile, "utf8"), "host\n");

	const validSource = path.join(workDirectory, "valid-source");
	const validPackage = path.join(validSource, "node_modules/runtime-package");
	const validBin = path.join(validSource, "node_modules/.bin");
	await mkdir(validPackage, { recursive: true });
	await mkdir(validBin);
	await writeFile(path.join(validPackage, "index.js"), "valid\n", { mode: 0o600 });
	await symlink("../runtime-package/index.js", path.join(validBin, "runtime-package"));
	await hardenSourceEntries(validSource, entries([
		{ mode: 0o755, path: "node_modules/.bin", type: "directory" },
	]), ownerUid, ownerGid);
	for (const directory of [validSource, path.join(validSource, "node_modules"), validPackage, validBin]) {
		assert.equal((await metadata(directory)).mode, 0o555);
	}
	assert.equal((await metadata(path.join(validPackage, "index.js"))).mode, 0o600);
	assert.equal(await readlink(path.join(validBin, "runtime-package")), "../runtime-package/index.js");

	const linkedSource = path.join(workDirectory, "linked-source");
	const linkedPackage = path.join(linkedSource, "node_modules/runtime-package");
	await mkdir(linkedPackage, { recursive: true });
	const linkedOutside = path.join(workDirectory, "linked-outside.js");
	await writeFile(linkedOutside, "link\n", { mode: 0o600 });
	const linkedBefore = await metadata(linkedOutside);
	await link(linkedOutside, path.join(linkedPackage, "index.js"));
	await hardenSourceEntries(linkedSource, entries(), ownerUid, ownerGid);
	assert.deepEqual(await metadata(linkedOutside), linkedBefore);
	assert.equal(await readFile(linkedOutside, "utf8"), "link\n");
	process.stdout.write("Legacy hardening rejects ancestor swaps without modifying regular files or hardlink aliases.\n");
}
finally {
	for (const directory of [
		"source",
		"source/node_modules",
		"valid-source",
		"valid-source/node_modules",
		"valid-source/node_modules/runtime-package",
		"valid-source/node_modules/.bin",
		"linked-source",
		"linked-source/node_modules",
		"linked-source/node_modules/runtime-package"
	]) {
		await chmod(path.join(workDirectory, directory), 0o700).catch(() => undefined);
	}
	await rm(workDirectory, { force: true, recursive: true });
}
