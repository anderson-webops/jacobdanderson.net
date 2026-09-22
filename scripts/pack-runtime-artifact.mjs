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
process.stdout.write(`Packed ${archiveName} with SHA-256 ${digest}.\n`);
