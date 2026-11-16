import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const artifactRoot = path.join(root, ".runtime-artifact");
const archiveName = "jacobdanderson.net-runtime.tar.gz";
const archivePath = path.join(root, archiveName);
const checksumPath = `${archivePath}.sha256`;
const verifierEnvironment = {
	...process.env,
	RUNTIME_ARTIFACT_REQUIRE_CLEAN: process.env.RUNTIME_ARTIFACT_REQUIRE_CLEAN || "false"
};
const verification = spawnSync(
	process.execPath,
	[path.join(root, "scripts/verify-runtime-artifact.mjs"), artifactRoot],
	{ encoding: "utf8", env: verifierEnvironment }
);
process.stdout.write(verification.stdout || "");
process.stderr.write(verification.stderr || "");
if (verification.status !== 0) throw new Error("Refusing to pack an invalid runtime artifact.");

await Promise.all([
	rm(archivePath, { force: true }),
	rm(checksumPath, { force: true })
]);
const packed = spawnSync("tar", ["-C", artifactRoot, "-czf", archivePath, "."], {
	encoding: "utf8",
	env: {
		...process.env,
		COPYFILE_DISABLE: "1",
		COPY_EXTENDED_ATTRIBUTES_DISABLE: "1"
	}
});
if (packed.error) throw packed.error;
if (packed.status !== 0) throw new Error(`tar failed: ${packed.stderr || packed.stdout}`);

const digest = createHash("sha256").update(await readFile(archivePath)).digest("hex");
await writeFile(checksumPath, `${digest}  ${archiveName}\n`, { mode: 0o644 });
const manifestName = "jacobdanderson.net-runtime-manifest.json";
const contractName = "jacobdanderson.net-runtime-contract.json";
const manifestBytes = await readFile(path.join(artifactRoot, ".runtime-manifest.json"));
const contractBytes = await readFile(path.join(root, "deploy/runtime-artifact.json"));
const manifest = JSON.parse(manifestBytes);
const contract = JSON.parse(contractBytes);
if (
	contract.service !== manifest.service
	|| `v${contract.runtime.node}` !== manifest.toolchain.node
	|| contract.runtime.npmBuildOnly !== manifest.toolchain.npm
	|| contract.runtime.npmBuildProfile !== manifest.toolchain.buildSdk.profile
	|| contract.runtime.npmBuildLockSha256 !== manifest.toolchain.buildSdk.lockSha256
	|| contract.runtime.npmBuildPayloadSha256 !== manifest.toolchain.buildSdk.payloadTreeSha256
) {
	throw new Error("Release source contract differs from the verified runtime build identity.");
}
await Promise.all([
	writeFile(path.join(root, manifestName), manifestBytes, { mode: 0o644 }),
	writeFile(path.join(root, contractName), contractBytes, { mode: 0o644 })
]);
const provenance = {
	schemaVersion: 1,
	service: manifest.service,
	source: manifest.source,
	buildSdk: manifest.toolchain.buildSdk,
	builder: {
		provider: process.env.GITHUB_ACTIONS === "true" ? "github-actions" : "local-validation",
		repository: process.env.GITHUB_REPOSITORY || null,
		workflowRunId: process.env.GITHUB_RUN_ID || null,
		workflowRef: process.env.GITHUB_WORKFLOW_REF || null,
		platform: process.platform,
		architecture: process.arch
	},
	artifacts: [
		{ name: archiveName, sha256: digest },
		{ name: manifestName, sha256: createHash("sha256").update(manifestBytes).digest("hex") },
		{ name: contractName, sha256: createHash("sha256").update(contractBytes).digest("hex") }
	]
};
await writeFile(path.join(root, "jacobdanderson.net-provenance.json"), `${JSON.stringify(provenance, null, 2)}\n`, { mode: 0o644 });
process.stdout.write(`Packed ${archiveName} with SHA-256 ${digest}.\n`);
