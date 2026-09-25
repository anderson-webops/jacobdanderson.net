import { createHash } from "node:crypto";
import { constants as fsConstants } from "node:fs";
import {
	chmod,
	chown,
	copyFile,
	lchown,
	lstat,
	mkdir,
	mkdtemp,
	open,
	readFile,
	readlink,
	readdir,
	realpath,
	rename,
	rm,
	symlink,
	writeFile
} from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const LEGACY_COMMIT = "d807a52a7b41ae7774cc528c82ab218fbf423475";
const LEGACY_TAG = "v2.11.0";
const MANIFEST_NAME = ".legacy-runtime-manifest.json";
const MAX_FILES = 60_000;
const MAX_TOTAL_BYTES = 512 * 1024 * 1024;
const MAX_FILE_BYTES = 64 * 1024 * 1024;
const MAX_PATH_BYTES = 512;
const MAX_DEPTH = 48;
const REQUIRED_PATHS = [
	".jacobdanderson-release-prepared.json",
	"back-end/dist/server.js",
	"back-end/package.json",
	"front-end/dist/deployment.json",
	"front-end/dist/index.html",
	"node_modules",
	"package-lock.json",
	"package.json"
];
const COPY_PATHS = [
	".jacobdanderson-release-prepared.json",
	"back-end/dist",
	"back-end/package.json",
	"front-end/dist",
	"node_modules",
	"package-lock.json",
	"package.json"
];
const EXPECTED_SOURCE_HASHES = new Map([
	["back-end/package.json", "76cbe27ed9151092ab78a4adcc08bf61d8f32fe8e9065e699e0613e3b2b6b778"],
	["package-lock.json", "f3473f793b3e3e58eff7feda2788f646917a7bd2358b6b0fd61ace840ed79a47"],
	["package.json", "2c99c3d68cc185324bc9bd9a1e0b2f4f8ed4cfc0461729f570611ab47c481300"]
]);

function fail(message) {
	throw new Error(message);
}

function sha256(bytes) {
	return createHash("sha256").update(bytes).digest("hex");
}

async function hashFile(file) {
	return sha256(await readFile(file));
}

function inside(root, candidate) {
	return candidate === root || candidate.startsWith(`${root}${path.sep}`);
}

function assertRelativePath(relativePath) {
	if (
		!relativePath
		|| path.isAbsolute(relativePath)
		|| relativePath.includes("\0")
		|| relativePath.split(path.sep).includes("..")
		|| Buffer.byteLength(relativePath) > MAX_PATH_BYTES
		|| relativePath.split(path.sep).length > MAX_DEPTH
	) fail(`Legacy runtime contains an invalid path: ${relativePath}`);
}

async function readIdentity(root) {
	const deploymentPath = path.join(root, "front-end/dist/deployment.json");
	const preparedPath = path.join(root, ".jacobdanderson-release-prepared.json");
	const [deploymentBytes, preparedBytes] = await Promise.all([
		readFile(deploymentPath),
		readFile(preparedPath)
	]);
	if (!deploymentBytes.equals(preparedBytes)) {
		fail("Legacy prepared metadata differs from its public deployment identity.");
	}
	const deployment = JSON.parse(deploymentBytes.toString("utf8"));
	const expected = {
		commit: LEGACY_COMMIT,
		ok: true,
		ref: LEGACY_TAG,
		runtime: "vite-ssg",
		service: "front-end"
	};
	if (JSON.stringify(deployment) !== JSON.stringify(expected)) {
		fail("Legacy deployment identity is not the reviewed v2.11.0 release.");
	}
	return deployment;
}

async function assertExpectedSourceManifests(root) {
	for (const [relativePath, expected] of EXPECTED_SOURCE_HASHES) {
		if (await hashFile(path.join(root, relativePath)) !== expected) {
			fail(`Legacy source manifest differs from reviewed v2.11.0: ${relativePath}`);
		}
	}
}

async function inventory(root, directory = root, prefix = "", entries = []) {
	for (const entry of await readdir(directory, { withFileTypes: true })) {
		const relativePath = path.posix.join(prefix, entry.name);
		if (relativePath === MANIFEST_NAME) continue;
		assertRelativePath(relativePath);
		const absolutePath = path.join(directory, entry.name);
		const metadata = await lstat(absolutePath);
		if (metadata.isDirectory()) {
			entries.push({ mode: metadata.mode & 0o777, path: relativePath, type: "directory" });
			await inventory(root, absolutePath, relativePath, entries);
		}
		else if (metadata.isFile()) {
			if (metadata.size > MAX_FILE_BYTES) fail(`Legacy runtime file exceeds its size bound: ${relativePath}`);
			entries.push({
				hash: await hashFile(absolutePath),
				mode: metadata.mode & 0o777,
				path: relativePath,
				size: metadata.size,
				type: "file"
			});
		}
		else if (metadata.isSymbolicLink()) {
			const target = await readlink(absolutePath);
			if (path.isAbsolute(target)) fail(`Legacy runtime contains an absolute symbolic link: ${relativePath}`);
			const resolved = await realpath(absolutePath);
			if (!inside(root, resolved)) fail(`Legacy runtime symbolic link escapes its release: ${relativePath}`);
			entries.push({ path: relativePath, target, type: "symlink" });
		}
		else {
			fail(`Legacy runtime contains an unsupported entry: ${relativePath}`);
		}
		if (entries.length > MAX_FILES) fail("Legacy runtime exceeds its file-count bound.");
	}
	return entries.sort((left, right) => (
		left.path < right.path ? -1 : left.path > right.path ? 1 : 0
	));
}

function entryContent(entry) {
	if (entry.type === "file") {
		return { hash: entry.hash, path: entry.path, size: entry.size, type: entry.type };
	}
	if (entry.type === "symlink") {
		return { path: entry.path, target: entry.target, type: entry.type };
	}
	return { path: entry.path, type: entry.type };
}

function assertSameContent(left, right, message) {
	if (
		JSON.stringify(left.map(entryContent))
		!== JSON.stringify(right.map(entryContent))
	) fail(message);
}

async function addInventoryEntry(root, relativePath, entries, paths) {
	assertRelativePath(relativePath);
	if (paths.has(relativePath)) fail(`Legacy runtime contains a duplicate path: ${relativePath}`);
	paths.add(relativePath);
	const absolutePath = path.join(root, relativePath);
	const metadata = await lstat(absolutePath);
	if (metadata.isDirectory()) {
		entries.push({ mode: metadata.mode & 0o777, path: relativePath, type: "directory" });
		for (const child of await readdir(absolutePath, { withFileTypes: true })) {
			await addInventoryEntry(root, path.posix.join(relativePath, child.name), entries, paths);
		}
	}
	else if (metadata.isFile()) {
		if (metadata.size > MAX_FILE_BYTES) fail(`Legacy runtime file exceeds its size bound: ${relativePath}`);
		entries.push({
			hash: await hashFile(absolutePath),
			mode: metadata.mode & 0o777,
			path: relativePath,
			size: metadata.size,
			type: "file"
		});
	}
	else if (metadata.isSymbolicLink()) {
		const target = await readlink(absolutePath);
		if (path.isAbsolute(target)) fail(`Legacy runtime contains an absolute symbolic link: ${relativePath}`);
		const resolved = await realpath(absolutePath);
		if (!inside(root, resolved)) fail(`Legacy runtime symbolic link escapes its release: ${relativePath}`);
		entries.push({ path: relativePath, target, type: "symlink" });
	}
	else {
		fail(`Legacy runtime contains an unsupported entry: ${relativePath}`);
	}
	if (entries.length > MAX_FILES) fail("Legacy runtime exceeds its file-count bound.");
}

async function addDirectoryInventoryEntry(root, relativePath, entries, paths) {
	assertRelativePath(relativePath);
	if (paths.has(relativePath)) fail(`Legacy runtime contains a duplicate path: ${relativePath}`);
	const metadata = await lstat(path.join(root, relativePath));
	if (!metadata.isDirectory() || metadata.isSymbolicLink()) {
		fail(`Legacy runtime parent must be a real directory: ${relativePath}`);
	}
	paths.add(relativePath);
	entries.push({ mode: metadata.mode & 0o777, path: relativePath, type: "directory" });
}

async function selectedInventory(root) {
	const entries = [];
	const paths = new Set();
	const ancestors = new Set();
	for (const relativePath of COPY_PATHS) {
		let parent = path.posix.dirname(relativePath);
		while (parent !== ".") {
			ancestors.add(parent);
			parent = path.posix.dirname(parent);
		}
	}
	for (const relativePath of [...ancestors].sort()) {
		if (COPY_PATHS.some(selected => relativePath === selected || relativePath.startsWith(`${selected}/`))) continue;
		await addDirectoryInventoryEntry(root, relativePath, entries, paths);
	}
	for (const relativePath of COPY_PATHS) {
		await addInventoryEntry(root, relativePath, entries, paths);
	}
	const result = entries.sort((left, right) => (
		left.path < right.path ? -1 : left.path > right.path ? 1 : 0
	));
	assertInventoryBounds(result);
	return result;
}

function assertInventoryBounds(entries) {
	const totalBytes = entries
		.filter(entry => entry.type === "file")
		.reduce((total, entry) => total + entry.size, 0);
	if (totalBytes > MAX_TOTAL_BYTES) fail("Legacy runtime exceeds its expanded-byte bound.");
}

async function normalize(root, directory = root) {
	await chmod(directory, 0o755);
	for (const entry of await readdir(directory, { withFileTypes: true })) {
		const absolutePath = path.join(directory, entry.name);
		if (entry.isDirectory()) await normalize(root, absolutePath);
		else if (entry.isFile()) await chmod(absolutePath, 0o644);
		else if (!entry.isSymbolicLink()) fail(`Cannot normalize unsupported legacy entry: ${absolutePath}`);
	}
}

async function assertProtectedDirectory(directory, label) {
	if (typeof process.getuid !== "function" || process.getuid() !== 0) return;
	const metadata = await lstat(directory);
	if (
		!metadata.isDirectory()
		|| metadata.isSymbolicLink()
		|| metadata.uid !== 0
		|| metadata.gid !== 0
		|| (metadata.mode & 0o022) !== 0
	) fail(`${label} must be a root-owned, protected directory.`);
}

async function assertProtectedSource(root, entries) {
	if (typeof process.getuid !== "function" || process.getuid() !== 0) {
		if (process.env.ALLOW_ROOTLESS_LEGACY_CAPTURE !== "true") {
			fail("Legacy rollback verification requires root privileges.");
		}
		return;
	}
	const rootMetadata = await lstat(root);
	if (
		rootMetadata.uid !== 0
		|| rootMetadata.gid !== 0
		|| (rootMetadata.mode & 0o222) !== 0
	) fail("Active legacy runtime root is not immutable and root-owned.");
	for (const entry of entries) {
		const metadata = await lstat(path.join(root, entry.path));
		if (
			metadata.uid !== 0
			|| metadata.gid !== 0
			|| (entry.type !== "symlink" && (metadata.mode & 0o222) !== 0)
		) fail(`Active legacy runtime entry is not immutable and root-owned: ${entry.path}`);
	}
}

async function hardenSource(root, entries) {
	if (typeof process.getuid !== "function" || process.getuid() !== 0) {
		if (process.env.ALLOW_ROOTLESS_LEGACY_CAPTURE !== "true") {
			fail("Legacy rollback capture requires root privileges.");
		}
		return;
	}
	const nonDirectories = entries.filter(entry => entry.type !== "directory");
	const directories = entries
		.filter(entry => entry.type === "directory")
		.sort((left, right) => right.path.split("/").length - left.path.split("/").length);
	for (const entry of nonDirectories) {
		const absolutePath = path.join(root, entry.path);
		if (entry.type === "symlink") {
			const metadata = await lstat(absolutePath);
			if (!metadata.isSymbolicLink() || await readlink(absolutePath) !== entry.target) {
				fail(`Legacy runtime symbolic link changed while its source was being made immutable: ${entry.path}`);
			}
			await lchown(absolutePath, 0, 0);
			continue;
		}
		const handle = await open(absolutePath, fsConstants.O_RDONLY | fsConstants.O_NOFOLLOW);
		try {
			const metadata = await handle.stat();
			if (!metadata.isFile() || metadata.size !== entry.size) {
				fail(`Legacy runtime file changed while its source was being made immutable: ${entry.path}`);
			}
			await handle.chown(0, 0);
			await handle.chmod((entry.mode & 0o111) === 0 ? 0o444 : 0o555);
		}
		finally {
			await handle.close();
		}
	}
	for (const entry of directories) {
		const absolutePath = path.join(root, entry.path);
		const handle = await open(
			absolutePath,
			fsConstants.O_RDONLY | fsConstants.O_DIRECTORY | fsConstants.O_NOFOLLOW
		);
		try {
			if (!(await handle.stat()).isDirectory()) {
				fail(`Legacy runtime directory changed while its source was being made immutable: ${entry.path}`);
			}
			await handle.chown(0, 0);
			await handle.chmod(0o555);
		}
		finally {
			await handle.close();
		}
	}
	const rootHandle = await open(
		root,
		fsConstants.O_RDONLY | fsConstants.O_DIRECTORY | fsConstants.O_NOFOLLOW
	);
	try {
		await rootHandle.chown(0, 0);
		await rootHandle.chmod(0o555);
	}
	finally {
		await rootHandle.close();
	}
}

async function copySelected(source, destination, entries) {
	for (const entry of entries.filter(item => item.type === "directory")) {
		await mkdir(path.join(destination, entry.path), { mode: 0o755, recursive: true });
	}
	for (const entry of entries.filter(item => item.type !== "directory")) {
		const sourcePath = path.join(source, entry.path);
		const destinationPath = path.join(destination, entry.path);
		await mkdir(path.dirname(destinationPath), { mode: 0o755, recursive: true });
		if (entry.type === "symlink") {
			if (await readlink(sourcePath) !== entry.target) {
				fail(`Legacy runtime symbolic link changed during capture: ${entry.path}`);
			}
			await symlink(entry.target, destinationPath);
		}
		else {
			const sourceMetadata = await lstat(sourcePath);
			if (!sourceMetadata.isFile() || sourceMetadata.isSymbolicLink() || sourceMetadata.size !== entry.size) {
				fail(`Legacy runtime file changed during capture: ${entry.path}`);
			}
			await copyFile(sourcePath, destinationPath, fsConstants.COPYFILE_EXCL);
			if (await hashFile(destinationPath) !== entry.hash) {
				fail(`Legacy runtime file changed while it was copied: ${entry.path}`);
			}
		}
	}
}

async function makeRootOwned(directory) {
	if (typeof process.getuid !== "function" || process.getuid() !== 0) {
		if (process.env.ALLOW_ROOTLESS_LEGACY_CAPTURE !== "true") {
			fail("Legacy rollback capture requires root privileges.");
		}
		return;
	}
	for (const entry of await readdir(directory, { withFileTypes: true })) {
		const absolutePath = path.join(directory, entry.name);
		if (entry.isDirectory()) await makeRootOwned(absolutePath);
		else if (entry.isSymbolicLink()) await lchown(absolutePath, 0, 0);
		else await chown(absolutePath, 0, 0);
	}
	await chown(directory, 0, 0);
}

async function assertRequiredPaths(root) {
	for (const relativePath of REQUIRED_PATHS) {
		const metadata = await lstat(path.join(root, relativePath));
		if (relativePath === "node_modules") {
			if (!metadata.isDirectory() || metadata.isSymbolicLink()) fail("Legacy node_modules must be a real directory.");
		}
		else if (!metadata.isFile() || metadata.isSymbolicLink()) {
			fail(`Legacy runtime is missing a required regular file: ${relativePath}`);
		}
	}
}

async function verify(rootArgument, expectedCommit) {
	if (expectedCommit !== LEGACY_COMMIT) fail("Legacy verification is bounded to the reviewed v2.11.0 commit.");
	const root = await realpath(rootArgument);
	const metadata = await lstat(root);
	if (!metadata.isDirectory() || metadata.isSymbolicLink()) fail("Legacy runtime root must be a real directory.");
	await assertRequiredPaths(root);
	await readIdentity(root);
	await assertExpectedSourceManifests(root);
	const manifest = JSON.parse(await readFile(path.join(root, MANIFEST_NAME), "utf8"));
	if (
		manifest.schemaVersion !== 1
		|| manifest.service !== "jacobdanderson.net"
		|| manifest.purpose !== "legacy-rollback"
		|| manifest.source?.commit !== LEGACY_COMMIT
		|| manifest.source?.tag !== LEGACY_TAG
		|| JSON.stringify(manifest.requiredPaths) !== JSON.stringify(REQUIRED_PATHS)
	) fail("Legacy runtime manifest has an unsupported identity or contract.");
	const entries = await inventory(root);
	assertInventoryBounds(entries);
	if (JSON.stringify(entries) !== JSON.stringify(manifest.entries)) {
		fail("Legacy runtime inventory, mode, link, size, or hash differs from its sealed manifest.");
	}
	if (typeof process.getuid === "function" && process.getuid() === 0) {
		for (const entry of entries) {
			const entryMetadata = await lstat(path.join(root, entry.path));
			if (
				entryMetadata.uid !== 0
				|| entryMetadata.gid !== 0
				|| (entry.type !== "symlink" && (entryMetadata.mode & 0o022) !== 0)
			) {
				fail(`Legacy runtime entry is not root-owned and protected: ${entry.path}`);
			}
		}
	}
	return { commit: LEGACY_COMMIT, entries: entries.length, verified: true };
}

async function compareSource(sourceArgument, sealedArgument, expectedCommit) {
	if (expectedCommit !== LEGACY_COMMIT) fail("Legacy comparison is bounded to the reviewed v2.11.0 commit.");
	const source = await realpath(sourceArgument);
	const sealed = await realpath(sealedArgument);
	await verify(sealed, expectedCommit);
	await assertProtectedDirectory(path.dirname(source), "Legacy source parent");
	await assertRequiredPaths(source);
	await readIdentity(source);
	await assertExpectedSourceManifests(source);
	const sourceEntries = await selectedInventory(source);
	await assertProtectedSource(source, sourceEntries);
	const sealedEntries = await inventory(sealed);
	assertSameContent(
		sourceEntries,
		sealedEntries,
		"Active legacy runtime differs from its sealed rollback tree."
	);
	return { commit: LEGACY_COMMIT, matches: true };
}

async function capture(sourceArgument, destinationRootArgument, expectedCommit) {
	if (expectedCommit !== LEGACY_COMMIT) fail("Legacy capture is bounded to the reviewed v2.11.0 commit.");
	const source = await realpath(sourceArgument);
	const destinationRoot = await realpath(destinationRootArgument);
	if (source === destinationRoot || inside(source, destinationRoot) || inside(destinationRoot, source)) {
		fail("Legacy capture source and destination roots must be separate.");
	}
	await assertProtectedDirectory(path.dirname(source), "Legacy source parent");
	await assertProtectedDirectory(destinationRoot, "Legacy destination root");
	await assertRequiredPaths(source);
	await readIdentity(source);
	await assertExpectedSourceManifests(source);
	const mutableInventory = await selectedInventory(source);
	await hardenSource(source, mutableInventory);
	const sourceInventory = await selectedInventory(source);
	assertSameContent(
		mutableInventory,
		sourceInventory,
		"Legacy runtime content changed while its source was being made immutable."
	);
	const stage = await mkdtemp(path.join(destinationRoot, ".legacy-stage-"));
	try {
		await copySelected(source, stage, sourceInventory);
		await normalize(stage);
		const entries = await inventory(stage);
		assertInventoryBounds(entries);
		assertSameContent(
			sourceInventory,
			entries,
			"Sealed legacy runtime content differs from its immutable source."
		);
		assertSameContent(
			sourceInventory,
			await selectedInventory(source),
			"Legacy runtime source changed during capture."
		);
		const manifest = {
			entries,
			purpose: "legacy-rollback",
			requiredPaths: REQUIRED_PATHS,
			schemaVersion: 1,
			service: "jacobdanderson.net",
			source: { commit: LEGACY_COMMIT, tag: LEGACY_TAG }
		};
		const manifestBytes = Buffer.from(`${JSON.stringify(manifest, null, 2)}\n`);
		await writeFile(path.join(stage, MANIFEST_NAME), manifestBytes, { flag: "wx", mode: 0o644 });
		await makeRootOwned(stage);
		const destination = path.join(
			destinationRoot,
			`legacy-${LEGACY_COMMIT.slice(0, 12)}-${sha256(manifestBytes).slice(0, 16)}`
		);
		try {
			await rename(stage, destination);
		}
		catch (error) {
			if (!(
				error instanceof Error
				&& "code" in error
				&& (error.code === "EEXIST" || error.code === "ENOTEMPTY")
			)) throw error;
			await verify(destination, expectedCommit);
			await rm(stage, { force: true, recursive: true });
		}
		await verify(destination, expectedCommit);
		return {
			commit: LEGACY_COMMIT,
			manifestSha256: sha256(manifestBytes),
			path: destination
		};
	}
	catch (error) {
		await rm(stage, { force: true, recursive: true }).catch(() => undefined);
		throw error;
	}
}

const [operation, root, argument, expectedCommit] = process.argv.slice(2);
if (operation === "verify" && root && argument && !expectedCommit) {
	process.stdout.write(`${JSON.stringify(await verify(root, argument))}\n`);
}
else if (operation === "capture" && root && argument && expectedCommit) {
	process.stdout.write(`${JSON.stringify(await capture(root, argument, expectedCommit))}\n`);
}
else if (operation === "compare-source" && root && argument && expectedCommit) {
	process.stdout.write(`${JSON.stringify(await compareSource(root, argument, expectedCommit))}\n`);
}
else {
	process.stderr.write(
		"Usage: legacy-runtime-artifact.mjs verify <sealed-tree> <expected-commit>\n"
		+ "   or: legacy-runtime-artifact.mjs compare-source <active-v2.11-tree> <sealed-tree> <expected-commit>\n"
		+ "   or: legacy-runtime-artifact.mjs capture <active-v2.11-tree> <legacy-root> <expected-commit>\n"
	);
	process.exitCode = 2;
}
