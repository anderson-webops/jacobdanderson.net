import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { chmod, copyFile, lstat, mkdir, mkdtemp, readdir, readFile, realpath, rm, symlink, truncate, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const extractor = path.join(root, "deploy/systemd/extract-runtime-artifact.py");
const legacyTool = path.join(root, "deploy/systemd/legacy-runtime-artifact.mjs");
const promoter = path.join(root, "deploy/systemd/promote-release.sh");
const workDirectory = await mkdtemp(path.join(os.tmpdir(), "jacobdanderson-promotion-"));

function run(command, args, options = {}) {
	const result = spawnSync(command, args, { encoding: "utf8", ...options });
	if (result.error) throw result.error;
	return { ...result, output: `${result.stdout || ""}${result.stderr || ""}` };
}

try {
	const source = path.join(workDirectory, "source");
	const destination = path.join(workDirectory, "destination");
	const archive = path.join(workDirectory, "runtime.tar.gz");
	await mkdir(path.join(source, "front-end", "dist"), { recursive: true, mode: 0o700 });
	await mkdir(destination);
	await writeFile(path.join(source, "front-end", "dist", "index.html"), "ok\n", { mode: 0o600 });
	const packed = run("tar", ["-C", source, "-czf", archive, "."]);
	assert.equal(packed.status, 0, packed.output);
	const extracted = run("python3", [extractor, archive, destination]);
	assert.equal(extracted.status, 0, extracted.output);
	const directoryMode = (await lstat(path.join(destination, "front-end", "dist"))).mode & 0o777;
	const fileMode = (await lstat(path.join(destination, "front-end", "dist", "index.html"))).mode & 0o777;
	assert.equal(directoryMode, 0o755, "Extracted directories must be traversable by Nginx.");
	assert.equal(fileMode, 0o644, "Extracted static files must be readable by Nginx.");
	assert.equal(await readFile(path.join(destination, "front-end", "dist", "index.html"), "utf8"), "ok\n");

	const replacementSource = path.join(workDirectory, "replacement-source");
	const replacementArchive = path.join(workDirectory, "replacement.tar.gz");
	const protectedArchive = path.join(workDirectory, "protected.tar.gz");
	const protectedDestination = path.join(workDirectory, "protected-destination");
	await mkdir(replacementSource);
	await mkdir(protectedDestination);
	await writeFile(path.join(replacementSource, "payload.txt"), "replacement\n");
	const replacementPacked = run("tar", ["-C", replacementSource, "-czf", replacementArchive, "."]);
	assert.equal(replacementPacked.status, 0, replacementPacked.output);
	await copyFile(archive, protectedArchive);
	await copyFile(replacementArchive, archive);
	const protectedExtracted = run("python3", [extractor, protectedArchive, protectedDestination]);
	assert.equal(protectedExtracted.status, 0, protectedExtracted.output);
	assert.equal(
		await readFile(path.join(protectedDestination, "front-end", "dist", "index.html"), "utf8"),
		"ok\n",
		"Extraction must consume the protected copy rather than a replaced caller pathname."
	);
	assert.equal(
		await readFile(path.join(replacementSource, "payload.txt"), "utf8"),
		"replacement\n"
	);

	const symlinkSource = path.join(workDirectory, "symlink-source");
	const symlinkDestination = path.join(workDirectory, "symlink-destination");
	const symlinkArchive = path.join(workDirectory, "symlink.tar.gz");
	await mkdir(symlinkSource);
	await mkdir(symlinkDestination);
	await writeFile(path.join(symlinkSource, "target"), "target\n");
	await symlink("target", path.join(symlinkSource, "link"));
	const symlinkPacked = run("tar", ["-C", symlinkSource, "-czf", symlinkArchive, "."]);
	assert.equal(symlinkPacked.status, 0, symlinkPacked.output);
	const rejectedSymlink = run("python3", [extractor, symlinkArchive, symlinkDestination]);
	assert.notEqual(rejectedSymlink.status, 0);
	assert.match(rejectedSymlink.output, /link or special file/u);

	const deepSource = path.join(workDirectory, "deep-source");
	const deepDestination = path.join(workDirectory, "deep-destination");
	const deepArchive = path.join(workDirectory, "deep.tar.gz");
	const deepPath = path.join(deepSource, ...Array.from({ length: 65 }, (_, index) => `level-${index}`));
	await mkdir(deepPath, { recursive: true });
	await mkdir(deepDestination);
	await writeFile(path.join(deepPath, "payload"), "too deep\n");
	const deepPacked = run("tar", ["-C", deepSource, "-czf", deepArchive, "."]);
	assert.equal(deepPacked.status, 0, deepPacked.output);
	const rejectedDeepPath = run("python3", [extractor, deepArchive, deepDestination]);
	assert.notEqual(rejectedDeepPath.status, 0);
	assert.match(rejectedDeepPath.output, /bounded length or depth/u);
	assert.deepEqual(await readdir(deepDestination), [], "Extractor must validate the full archive before writing files.");

	const nonemptyDestination = path.join(workDirectory, "nonempty");
	await mkdir(nonemptyDestination);
	await writeFile(path.join(nonemptyDestination, "preserve"), "preserve\n");
	const rejectedNonempty = run("python3", [extractor, archive, nonemptyDestination]);
	assert.notEqual(rejectedNonempty.status, 0);
	assert.match(rejectedNonempty.output, /must be empty/u);
	assert.equal(await readFile(path.join(nonemptyDestination, "preserve"), "utf8"), "preserve\n");

	const legacySource = path.join(workDirectory, "legacy-source");
	const legacyRoot = path.join(workDirectory, "legacy-releases");
	await Promise.all([
		mkdir(path.join(legacySource, "back-end", "dist"), { recursive: true }),
		mkdir(path.join(legacySource, "front-end", "dist"), { recursive: true }),
		mkdir(path.join(legacySource, "node_modules", "runtime-package"), { recursive: true }),
		mkdir(path.join(legacySource, "node_modules", ".bin"), { recursive: true }),
		mkdir(legacyRoot)
	]);
	for (const relativePath of ["package.json", "package-lock.json", "back-end/package.json"]) {
		const sourceFile = run("git", ["show", `v2.11.0:${relativePath}`], { cwd: root });
		assert.equal(sourceFile.status, 0, sourceFile.output);
		await writeFile(path.join(legacySource, relativePath), sourceFile.stdout);
	}
	const legacyIdentity = `${JSON.stringify({
		commit: "d807a52a7b41ae7774cc528c82ab218fbf423475",
		ok: true,
		ref: "v2.11.0",
		runtime: "vite-ssg",
		service: "front-end"
	}, null, 2)}\n`;
	await Promise.all([
		writeFile(path.join(legacySource, ".jacobdanderson-release-prepared.json"), legacyIdentity),
		writeFile(path.join(legacySource, "back-end", "dist", "server.js"), "console.log('legacy');\n"),
		writeFile(path.join(legacySource, "front-end", "dist", "deployment.json"), legacyIdentity),
		writeFile(path.join(legacySource, "front-end", "dist", "index.html"), "legacy\n"),
		writeFile(path.join(legacySource, "node_modules", "runtime-package", "index.js"), "export {};\n")
	]);
	await symlink(
		"../runtime-package/index.js",
		path.join(legacySource, "node_modules", ".bin", "runtime-package")
	);
	const legacyEnvironment = { ...process.env, ALLOW_ROOTLESS_LEGACY_CAPTURE: "true" };
	const oversizedLegacyFile = path.join(legacySource, "node_modules", "runtime-package", "oversized.bin");
	await writeFile(oversizedLegacyFile, "");
	await truncate(oversizedLegacyFile, 64 * 1024 * 1024 + 1);
	const rejectedOversizedLegacy = run(
		process.execPath,
		[
			legacyTool,
			"capture",
			legacySource,
			legacyRoot,
			"d807a52a7b41ae7774cc528c82ab218fbf423475"
		],
		{ env: legacyEnvironment }
	);
	assert.notEqual(rejectedOversizedLegacy.status, 0);
	assert.match(rejectedOversizedLegacy.output, /exceeds its size bound/u);
	assert.deepEqual(
		await readdir(legacyRoot),
		[],
		"Legacy capture must enforce resource bounds before creating a staging tree."
	);
	await rm(oversizedLegacyFile);
	const capturedLegacy = run(
		process.execPath,
		[
			legacyTool,
			"capture",
			legacySource,
			legacyRoot,
			"d807a52a7b41ae7774cc528c82ab218fbf423475"
		],
		{ env: legacyEnvironment }
	);
	assert.equal(capturedLegacy.status, 0, capturedLegacy.output);
	const sealedLegacy = JSON.parse(capturedLegacy.stdout);
	assert.match(sealedLegacy.manifestSha256, /^[a-f0-9]{64}$/u);
	assert.ok(sealedLegacy.path.startsWith(`${await realpath(legacyRoot)}${path.sep}`));
	const comparedLegacy = run(
		process.execPath,
		[
			legacyTool,
			"compare-source",
			legacySource,
			sealedLegacy.path,
			"d807a52a7b41ae7774cc528c82ab218fbf423475"
		],
		{ env: legacyEnvironment }
	);
	assert.equal(comparedLegacy.status, 0, comparedLegacy.output);
	const legacyServerPath = path.join(legacySource, "back-end", "dist", "server.js");
	await writeFile(legacyServerPath, "console.log('changed');\n");
	const rejectedChangedSource = run(
		process.execPath,
		[
			legacyTool,
			"compare-source",
			legacySource,
			sealedLegacy.path,
			"d807a52a7b41ae7774cc528c82ab218fbf423475"
		],
		{ env: legacyEnvironment }
	);
	assert.notEqual(rejectedChangedSource.status, 0);
	assert.match(rejectedChangedSource.output, /differs from its sealed rollback tree/u);
	await writeFile(legacyServerPath, "console.log('legacy');\n");
	const verifiedLegacy = run(
		process.execPath,
		[
			legacyTool,
			"verify",
			sealedLegacy.path,
			"d807a52a7b41ae7774cc528c82ab218fbf423475"
		],
		{ env: legacyEnvironment }
	);
	assert.equal(verifiedLegacy.status, 0, verifiedLegacy.output);
	await writeFile(path.join(sealedLegacy.path, "front-end", "dist", "index.html"), "tampered\n");
	const rejectedLegacyMutation = run(
		process.execPath,
		[
			legacyTool,
			"verify",
			sealedLegacy.path,
			"d807a52a7b41ae7774cc528c82ab218fbf423475"
		],
		{ env: legacyEnvironment }
	);
	assert.notEqual(rejectedLegacyMutation.status, 0);
	assert.match(rejectedLegacyMutation.output, /differs from its sealed manifest/u);

	const promoterSource = await readFile(promoter, "utf8");
	const protectedCopy = promoterSource.indexOf(
		"install -o root -g root -m 0600 -- \"$archive\" \"$protected_archive\""
	);
	const protectedDigest = promoterSource.indexOf("sha256sum -- \"$protected_archive\"");
	const protectedExtraction = promoterSource.indexOf(
		"\"$installed_extractor\" \"$protected_archive\" \"$staging\""
	);
	assert.ok(protectedCopy >= 0, "Promotion must create a root-only stable archive copy.");
	assert.ok(protectedDigest > protectedCopy, "Promotion must hash the protected archive copy.");
	assert.ok(protectedExtraction > protectedDigest, "Promotion must extract only the hashed protected copy.");
	assert.match(promoterSource, /assert_trusted_tree "\$candidate" "Existing release"/u);
	assert.match(promoterSource, /assert_trusted_tree "\$previous_target" "Current rollback target"/u);
	assert.match(promoterSource, /assert_trusted_tree "\$candidate" "Selected candidate"/u);
	assert.match(promoterSource, /expected_current="\$\{4,,\}"/u);
	assert.match(promoterSource, /verify_legacy_tree "\$sealed_legacy"/u);
	assert.match(promoterSource, /compare-source/u);
	assert.match(promoterSource, /separately sealed v2\.11\.0 rollback tree/u);
	assert.match(promoterSource, /flock -n 9/u);
	assert.match(promoterSource, /A valid current release symlink is required for guarded promotion/u);
	const currentRecheck = promoterSource.indexOf("assert_current_unchanged");
	const candidateActivation = promoterSource.indexOf("activate_target \"$candidate\"");
	assert.ok(currentRecheck >= 0 && currentRecheck < candidateActivation, "Current identity must be rechecked before activation.");

	await chmod(destination, 0o755);
	process.stdout.write("Promotion archive, sealed legacy transition, and trusted-release contract passed.\n");
}
finally {
	await rm(workDirectory, { force: true, recursive: true });
}
