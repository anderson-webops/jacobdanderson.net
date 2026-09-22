import { createHash } from "node:crypto";
import { lstat, readdir, readFile, realpath } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const manifestName = ".runtime-manifest.json";
const independentRequiredPaths = [
	"back-end/dist/server.js",
	"back-end/package-lock.json",
	"back-end/package.json",
	"front-end/dist/deployment.json",
	"front-end/dist/index.html"
];
const requestedRoot = path.resolve(process.argv[2] || ".runtime-artifact");
const requestedMetadata = await lstat(requestedRoot);
if (!requestedMetadata.isDirectory() || requestedMetadata.isSymbolicLink()) {
	throw new Error("Runtime artifact root must be a real directory, not a link.");
}
const artifactRoot = await realpath(requestedRoot);

async function hashFile(absolutePath) {
	return createHash("sha256").update(await readFile(absolutePath)).digest("hex");
}

async function inventory(directory, prefix = "", directories = []) {
	const files = [];
	for (const entry of await readdir(directory, { withFileTypes: true })) {
		const relativePath = path.posix.join(prefix, entry.name);
		if (relativePath === manifestName) continue;
		const absolutePath = path.join(directory, entry.name);
		const metadata = await lstat(absolutePath);
		if ((metadata.mode & 0o022) !== 0) throw new Error(`Artifact path is group/world writable: ${relativePath}`);
		if (metadata.isDirectory()) {
			directories.push(relativePath);
			files.push(...await inventory(absolutePath, relativePath, directories));
		}
		else if (metadata.isFile()) {
			files.push({
				hash: await hashFile(absolutePath),
				mode: metadata.mode & 0o777,
				path: relativePath,
				size: metadata.size,
				type: "file"
			});
		}
		else {
			throw new Error(`Runtime artifact contains a link or special file: ${relativePath}`);
		}
	}
	return files.sort((left, right) => left.path.localeCompare(right.path));
}

function impliedDirectories(files) {
	const directories = new Set();
	for (const entry of files) {
		let directory = path.posix.dirname(entry.path);
		while (directory !== ".") {
			directories.add(directory);
			directory = path.posix.dirname(directory);
		}
	}
	return [...directories].sort();
}

const manifest = JSON.parse(await readFile(path.join(artifactRoot, manifestName), "utf8"));
if (manifest.schemaVersion !== 1 || manifest.service !== "jacobdanderson.net") {
	throw new Error("Runtime artifact manifest has an unsupported identity or schema version.");
}
if (!/^[a-f0-9]{40}$/u.test(manifest.source?.commit || "")) {
	throw new Error("Runtime artifact manifest is missing a full source commit.");
}
if (process.env.RUNTIME_ARTIFACT_REQUIRE_CLEAN === "true" && manifest.source?.dirty !== false) {
	throw new Error("Production runtime artifacts must come from a clean source checkout.");
}
const expectedCommit = process.env.RUNTIME_ARTIFACT_EXPECT_COMMIT;
if (expectedCommit && !manifest.source.commit.startsWith(expectedCommit)) {
	throw new Error(`Runtime artifact source ${manifest.source.commit} does not match ${expectedCommit}.`);
}
if (manifest.toolchain?.node !== "v24.18.1" || manifest.toolchain?.npm !== "12.0.2") {
	throw new Error("Runtime artifact was not built with the pinned Node 24.18.1 and npm 12.0.2 toolchain.");
}
if (JSON.stringify(manifest.requiredPaths) !== JSON.stringify(independentRequiredPaths)) {
	throw new Error("Runtime artifact required-path contract does not match the independent verifier.");
}
if (!Array.isArray(manifest.writablePaths) || manifest.writablePaths.length !== 0) {
	throw new Error("Immutable runtime artifacts must not declare writable release paths.");
}

for (const relativePath of independentRequiredPaths) {
	const metadata = await lstat(path.join(artifactRoot, relativePath));
	if (!metadata.isFile() || metadata.isSymbolicLink()) {
		throw new Error(`Runtime artifact is missing required file: ${relativePath}`);
	}
}
for (const forbiddenPath of [".env", "back-end/.env", "front-end/.env", ".git"]) {
	try {
		await lstat(path.join(artifactRoot, forbiddenPath));
		throw new Error(`Runtime artifact contains forbidden private/source path: ${forbiddenPath}`);
	}
	catch (error) {
		if (error instanceof Error && "code" in error && error.code === "ENOENT") continue;
		throw error;
	}
}

const actualDirectories = [];
const actualFiles = await inventory(artifactRoot, "", actualDirectories);
actualDirectories.sort();
if (JSON.stringify(actualDirectories) !== JSON.stringify(impliedDirectories(manifest.files || []))) {
	throw new Error("Runtime artifact directory inventory mismatch.");
}
if (JSON.stringify(actualFiles) !== JSON.stringify(manifest.files)) {
	const expected = new Map((manifest.files || []).map(entry => [entry.path, entry]));
	const actual = new Map(actualFiles.map(entry => [entry.path, entry]));
	const firstMismatch = [...new Set([...expected.keys(), ...actual.keys()])]
		.sort()
		.find(file => JSON.stringify(expected.get(file)) !== JSON.stringify(actual.get(file)));
	throw new Error(`Runtime artifact inventory or hash mismatch${firstMismatch ? ` at ${firstMismatch}` : ""}.`);
}

const backendPackage = JSON.parse(await readFile(path.join(artifactRoot, "back-end/package.json"), "utf8"));
const backendLock = JSON.parse(await readFile(path.join(artifactRoot, "back-end/package-lock.json"), "utf8"));
const dependencies = Object.keys(backendPackage.dependencies || {}).sort();
if (JSON.stringify(dependencies) !== JSON.stringify(manifest.productionDependencies)) {
	throw new Error("Runtime artifact production-dependency manifest is incomplete.");
}
if (
	backendPackage.allowScripts?.["esbuild@0.28.2"] !== false
	|| backendPackage.allowScripts?.mongodb !== false
	|| backendLock.packages?.[""]?.name !== backendPackage.name
) {
	throw new Error("Runtime artifact backend install policy or standalone lock identity is invalid.");
}
const nativeBindings = actualFiles
	.filter(entry => entry.path.endsWith(".node"))
	.map(entry => ({ hash: entry.hash, path: entry.path }));
if (JSON.stringify(nativeBindings) !== JSON.stringify(manifest.nativeBindings)) {
	throw new Error("Runtime artifact native-binding inventory is incomplete.");
}

const deployment = JSON.parse(await readFile(path.join(artifactRoot, "front-end/dist/deployment.json"), "utf8"));
const deploymentCommit = String(deployment.commit || "");
if (
	deployment.ok !== true
	|| deployment.service !== "front-end"
	|| deployment.runtime !== "vite-ssg"
	|| !/^[a-f0-9]{12,40}$/u.test(deploymentCommit)
	|| !manifest.source.commit.startsWith(deploymentCommit)
) {
	throw new Error("Runtime artifact frontend identity does not match its source manifest.");
}
if ("nodeEnv" in deployment) throw new Error("Public deployment metadata exposes process environment details.");

process.stdout.write(`Verified runtime artifact with ${actualFiles.length} hashed files.\n`);
