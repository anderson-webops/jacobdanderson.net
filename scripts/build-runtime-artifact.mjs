import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
	chmod,
	cp,
	lstat,
	mkdir,
	readdir,
	readFile,
	realpath,
	rm,
	writeFile
} from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { nodeIdentity, verifyReusableToolchain } from "./build-toolchain-cache.mjs";
import { toolchainMetadata } from "./build-toolchain-state.mjs";

const root = await realpath(process.cwd());
if (!process.env.npm_execpath) throw new Error("Run artifact:build through the selected locked npm profile.");
const npmExecPath = await realpath(process.env.npm_execpath);
const npmPrefix = path.resolve(path.dirname(npmExecPath), "../../..");
if (npmExecPath !== path.join(npmPrefix, "node_modules/npm/bin/npm-cli.js")) {
	throw new Error("Artifact builds require the locked profile's npm JavaScript entrypoint.");
}
const buildSdk = {
	schemaVersion: 1,
	repository: "anderson-webops/vitesse-nuxt-template",
	commit: "a4dd6f9fcce9bec4275c688d165b993cb7b5ef22",
	profile: "webops-locked-npm-v1",
	lockSha256: "87f602703478c129d228479cd4638f46e36057fd9299d214090057ca75d74bde",
	payloadTreeSha256: "266bb8045b5fd0c689010b9b1b1ec44a489147607836dc583243087e23fcc7b8",
	archiveSha256: "937f92496a66d6a89955961eb2c70a8e873e4b407b1d4c09e77a0ddec0fafe4d"
};
const artifactContract = JSON.parse(await readFile(path.join(root, "deploy/runtime-artifact.json"), "utf8"));
const runtimeContract = artifactContract.runtime;
if (
	runtimeContract?.node !== "26.13.1"
	|| runtimeContract.npmBuildOnly !== "12.2.2"
	|| runtimeContract.npmBuildProfile !== buildSdk.profile
	|| runtimeContract.npmBuildLockSha256 !== buildSdk.lockSha256
	|| runtimeContract.npmBuildPayloadSha256 !== buildSdk.payloadTreeSha256
) {
	throw new Error("Runtime artifact contract does not identify the reviewed Node/npm build profile.");
}

function verifyBuildSdk() {
	const receipt = verifyReusableToolchain(npmPrefix, nodeIdentity());
	if (
		process.version !== "v26.13.1"
		|| receipt.node !== "26.13.1"
		|| receipt.versions.npm !== "12.2.2"
		|| receipt.profile !== buildSdk.profile
		|| receipt.lockSha256 !== buildSdk.lockSha256
		|| receipt.payloadTreeSha256 !== buildSdk.payloadTreeSha256
		|| toolchainMetadata.archiveSha256 !== buildSdk.archiveSha256
	) {
		throw new Error("Artifact builds require the exact reviewed Node 26.13.1/npm 12.2.2 SDK.");
	}
}

verifyBuildSdk();
const artifactRoot = path.join(root, ".runtime-artifact");
const manifestName = ".runtime-manifest.json";
const requiredPaths = [
	"back-end/dist/server.js",
	"back-end/package-lock.json",
	"back-end/package.json",
	"front-end/dist/deployment.json",
	"front-end/dist/index.html"
];

function git(args) {
	const result = spawnSync("git", args, {
		cwd: root,
		encoding: "utf8",
		stdio: ["ignore", "pipe", "pipe"]
	});
	if (result.status !== 0) throw new Error(`git ${args.join(" ")} failed.`);
	return result.stdout.trim();
}

function gitOptional(args) {
	try {
		return git(args);
	}
	catch {
		return "";
	}
}

function runSelectedNpm(args, cwd) {
	const environment = { ...process.env };
	delete environment.npm_config_global_ignore_file;
	delete environment.NPM_CONFIG_GLOBAL_IGNORE_FILE;
	const result = spawnSync(process.execPath, [npmExecPath, ...args], {
		cwd,
		encoding: "utf8",
		env: environment,
		maxBuffer: 20 * 1024 * 1024
	});
	process.stdout.write(result.stdout || "");
	process.stderr.write(result.stderr || "");
	if (result.status !== 0) throw new Error(`npm ${args.join(" ")} failed with exit code ${result.status}.`);
}

async function assertFile(relativePath) {
	const metadata = await lstat(path.join(root, relativePath));
	if (!metadata.isFile()) throw new Error(`Required build output is not a file: ${relativePath}`);
}

async function normalizeTree(directory) {
	await chmod(directory, 0o755);
	for (const entry of await readdir(directory, { withFileTypes: true })) {
		const absolutePath = path.join(directory, entry.name);
		if (entry.isDirectory()) await normalizeTree(absolutePath);
		else if (entry.isFile()) await chmod(absolutePath, 0o644);
		else throw new Error(`Runtime artifacts cannot contain links or special files: ${absolutePath}`);
	}
}

async function removeSourceMaps(directory) {
	for (const entry of await readdir(directory, { withFileTypes: true })) {
		const absolutePath = path.join(directory, entry.name);
		if (entry.isDirectory()) await removeSourceMaps(absolutePath);
		else if (entry.isFile() && entry.name.endsWith(".map")) await rm(absolutePath);
	}
}

async function hashFile(absolutePath) {
	return createHash("sha256").update(await readFile(absolutePath)).digest("hex");
}

async function inventory(directory, prefix = "") {
	const files = [];
	for (const entry of await readdir(directory, { withFileTypes: true })) {
		const relativePath = path.posix.join(prefix, entry.name);
		if (relativePath === manifestName) continue;
		const absolutePath = path.join(directory, entry.name);
		const metadata = await lstat(absolutePath);
		if (metadata.isDirectory()) {
			files.push(...await inventory(absolutePath, relativePath));
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
			throw new Error(`Unsupported artifact entry type: ${relativePath}`);
		}
	}
	return files.sort((left, right) => left.path.localeCompare(right.path));
}

for (const relativePath of [
	"back-end/dist/server.js",
	"back-end/package-lock.json",
	"front-end/dist/deployment.json",
	"front-end/dist/index.html"
]) await assertFile(relativePath);

const galleryFiles = Object.values(artifactContract.gallerySites).flatMap(site => [
	site.document,
	site.adminDocument,
	path.posix.join(path.posix.dirname(site.document), "robots.txt"),
	path.posix.join(path.posix.dirname(site.document), "sitemap.xml")
]);
const musicDocument = artifactContract.musicSite.document;
const musicFiles = [musicDocument, ...["robots.txt", "sitemap.xml"].map(file => path.posix.join(path.posix.dirname(musicDocument), file)), "front-end/dist/extra/music/index.html"];
for (const relativePath of [...galleryFiles, ...musicFiles]) await assertFile(relativePath);

await rm(artifactRoot, { force: true, recursive: true });
await Promise.all([
	mkdir(path.join(artifactRoot, "back-end"), { recursive: true }),
	mkdir(path.join(artifactRoot, "front-end"), { recursive: true })
]);
await Promise.all([
	cp(path.join(root, "back-end/dist"), path.join(artifactRoot, "back-end/dist"), { recursive: true }),
	cp(path.join(root, "back-end/package-lock.json"), path.join(artifactRoot, "back-end/package-lock.json")),
	cp(path.join(root, "front-end/dist"), path.join(artifactRoot, "front-end/dist"), { recursive: true })
]);

const backendPackage = JSON.parse(await readFile(path.join(root, "back-end/package.json"), "utf8"));
backendPackage.allowScripts = {
	"esbuild@0.28.2": false,
	"fsevents@2.3.3": false,
	"mongodb": false
};
await writeFile(
	path.join(artifactRoot, "back-end/package.json"),
	`${JSON.stringify(backendPackage, null, "\t")}\n`
);

runSelectedNpm(
	["ci", "--omit=dev", "--include=optional", "--strict-allow-scripts", "--no-audit", "--no-fund"],
	path.join(artifactRoot, "back-end")
);
runSelectedNpm(["ls", "--omit=dev", "--all"], path.join(artifactRoot, "back-end"));
await rm(path.join(artifactRoot, "back-end/node_modules/.bin"), { force: true, recursive: true });
await removeSourceMaps(path.join(artifactRoot, "back-end/dist"));
await normalizeTree(artifactRoot);

for (const relativePath of [...requiredPaths, ...galleryFiles, ...musicFiles]) {
	const metadata = await lstat(path.join(artifactRoot, relativePath));
	if (!metadata.isFile()) throw new Error(`Runtime artifact is missing required file: ${relativePath}`);
}

const files = await inventory(artifactRoot);
const sourceCommit = git(["rev-parse", "HEAD"]);
const deployment = JSON.parse(await readFile(path.join(artifactRoot, "front-end/dist/deployment.json"), "utf8"));
const deploymentCommit = String(deployment.commit || "");
if (!/^[a-f0-9]{12,40}$/u.test(deploymentCommit) || !sourceCommit.startsWith(deploymentCommit)) {
	throw new Error("Frontend deployment metadata does not identify the artifact source commit.");
}
const sourceTimestamp = Number.parseInt(git(["show", "-s", "--format=%ct", "HEAD"]), 10);
verifyBuildSdk();
const manifest = {
	entrypoints: { api: "back-end/dist/server.js", webRoot: "front-end/dist" },
	externalState: ["MongoDB project visibility and audit records remain outside immutable releases."],
	files,
	generatedClients: [],
	nativeBindings: files
		.filter(entry => entry.path.endsWith(".node"))
		.map(entry => ({ hash: entry.hash, path: entry.path })),
	productionDependencies: Object.keys(backendPackage.dependencies || {}).sort(),
	requiredPaths,
	schemaVersion: 1,
	service: "jacobdanderson.net",
	source: {
		commit: sourceCommit,
		dirty: Boolean(git(["status", "--porcelain", "--untracked-files=normal"])),
		tag: process.env.SOURCE_TAG || gitOptional(["describe", "--tags", "--exact-match"]) || null,
		timestamp: new Date(sourceTimestamp * 1000).toISOString()
	},
	staticAssets: ["front-end/dist"],
	toolchain: {
		node: process.version,
		npm: "12.2.2",
		buildSdk
	},
	writablePaths: []
};

await writeFile(path.join(artifactRoot, manifestName), `${JSON.stringify(manifest, null, 2)}\n`, { mode: 0o644 });
process.stdout.write(`Built runtime artifact with ${files.length} hashed files at ${artifactRoot}.\n`);
