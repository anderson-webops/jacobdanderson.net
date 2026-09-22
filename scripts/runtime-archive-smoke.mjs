import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { chmod, copyFile, mkdir, mkdtemp, readFile, rename, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const archivePath = path.resolve(
	process.env.RUNTIME_ARCHIVE_PATH || path.join(root, "jacobdanderson.net-runtime.tar.gz")
);
const checksumPath = `${archivePath}.sha256`;
const extractor = path.join(root, "deploy/systemd/extract-runtime-artifact.py");
const smokeScript = path.join(root, "scripts/runtime-artifact-smoke.mjs");
const workDirectory = await mkdtemp(path.join(os.tmpdir(), "jacobdanderson-archive-acceptance-"));
const publishDirectory = await mkdtemp(path.join(path.dirname(archivePath), ".runtime-accepted-"));

function run(command, args, options = {}) {
	const result = spawnSync(command, args, {
		encoding: "utf8",
		maxBuffer: 20 * 1024 * 1024,
		...options
	});
	process.stdout.write(result.stdout || "");
	process.stderr.write(result.stderr || "");
	if (result.error) throw result.error;
	if (result.status !== 0) {
		throw new Error(`${path.basename(command)} ${args.join(" ")} failed with exit code ${result.status}.`);
	}
}

try {
	const protectedArchive = path.join(workDirectory, "runtime.tar.gz");
	await copyFile(archivePath, protectedArchive);
	await chmod(protectedArchive, 0o600);
	const archive = await readFile(protectedArchive);
	const checksum = await readFile(checksumPath, "utf8");
	const expectedChecksum = checksum.match(/^([a-f0-9]{64}) {2}([^\r\n]+)\r?\n?$/u);
	if (!expectedChecksum || expectedChecksum[2] !== path.basename(archivePath)) {
		throw new Error("Runtime archive checksum file has an invalid name or format.");
	}
	const actualChecksum = createHash("sha256").update(archive).digest("hex");
	if (actualChecksum !== expectedChecksum[1]) {
		throw new Error("Runtime archive does not match its SHA-256 checksum.");
	}

	const artifactRoot = path.join(workDirectory, "artifact");
	await mkdir(artifactRoot, { mode: 0o700 });
	run("python3", ["-B", extractor, protectedArchive, artifactRoot], { cwd: workDirectory });
	run(process.execPath, [smokeScript], {
		cwd: root,
		env: {
			...process.env,
			RUNTIME_ARTIFACT_ROOT: artifactRoot
		}
	});
	const acceptedArchive = path.join(publishDirectory, path.basename(archivePath));
	const acceptedChecksum = `${acceptedArchive}.sha256`;
	await copyFile(protectedArchive, acceptedArchive);
	await chmod(acceptedArchive, 0o644);
	await writeFile(
		acceptedChecksum,
		`${actualChecksum}  ${path.basename(archivePath)}\n`,
		{ mode: 0o644 }
	);
	await rename(acceptedArchive, archivePath);
	await rename(acceptedChecksum, checksumPath);
	process.stdout.write(`Final runtime archive passed checksum, extraction, and isolated acceptance: ${path.basename(archivePath)}.\n`);
}
finally {
	await Promise.all([
		rm(workDirectory, { force: true, recursive: true }),
		rm(publishDirectory, { force: true, recursive: true })
	]);
}
