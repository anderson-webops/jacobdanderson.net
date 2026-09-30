import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { chmod, chown, mkdir, mkdtemp, rm, stat, symlink } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

assert.equal(process.platform, "linux", "The root-owned promotion contract is Linux-only.");
assert.equal(process.getuid(), 0, "Run the protected-ancestor regression as root.");

const promoter = path.join(process.cwd(), "deploy/systemd/promote-release.sh");
const workDirectory = await mkdtemp("/root/portfolio-promotion-");
const releaseRoot = path.join(workDirectory, "releases");
const legacyRoot = path.join(workDirectory, "legacy-releases");
const archive = "/etc/hosts";
const argumentsForPreflight = [archive, "a".repeat(40), "b".repeat(64), "c".repeat(40)];

function preflight(releasePath) {
	const result = spawnSync("bash", [promoter, ...argumentsForPreflight], {
		encoding: "utf8",
		env: {
			...process.env,
			RELEASE_ROOT: releasePath,
			LEGACY_RELEASE_ROOT: legacyRoot,
			CURRENT_LINK: path.join(workDirectory, "current"),
			DEPLOY_LOCK: path.join(workDirectory, "missing-lock")
		}
	});
	if (result.error) throw result.error;
	return { status: result.status, output: `${result.stdout || ""}${result.stderr || ""}` };
}

try {
	await mkdir(releaseRoot, { mode: 0o755 });
	await mkdir(legacyRoot, { mode: 0o755 });
	const protectedPath = preflight(releaseRoot);
	assert.notEqual(protectedPath.status, 0);
	assert.match(protectedPath.output, /deployment lock must be a root:root mode 0600 regular file/u);

	await chmod(workDirectory, 0o770);
	const writableParent = preflight(releaseRoot);
	assert.notEqual(writableParent.status, 0);
	assert.match(writableParent.output, /Release root has a non-root-owned or writable ancestor/u);
	await chmod(workDirectory, 0o700);

	await chown(workDirectory, 65534, 65534);
	const untrustedOwner = preflight(releaseRoot);
	assert.notEqual(untrustedOwner.status, 0);
	assert.match(untrustedOwner.output, /Release root has a non-root-owned or writable ancestor/u);
	await chown(workDirectory, 0, 0);

	const linkedRoot = path.join(workDirectory, "linked-releases");
	await symlink(releaseRoot, linkedRoot);
	const linkedPath = preflight(linkedRoot);
	assert.notEqual(linkedPath.status, 0);
	assert.match(linkedPath.output, /Release root must be an existing canonical absolute path/u);

	const publicTemporaryRoot = preflight("/tmp");
	assert.notEqual(publicTemporaryRoot.status, 0);
	assert.match(publicTemporaryRoot.output, /Release root has a non-root-owned or writable ancestor: \/tmp/u);

	await mkdir(path.join(workDirectory, "safe"), { mode: 0o700 });
	const newlineParent = path.join(workDirectory, "safe\n");
	const newlineRelease = path.join(newlineParent, "releases");
	await mkdir(newlineParent, { mode: 0o770 });
	await chmod(newlineParent, 0o770);
	assert.ok((await stat(newlineParent)).mode & 0o022);
	await mkdir(newlineRelease, { mode: 0o755 });
	const newlinePath = preflight(newlineRelease);
	assert.notEqual(newlinePath.status, 0);
	assert.match(newlinePath.output, /Release root has a non-root-owned or writable ancestor/u);
	process.stdout.write("Promotion rejects writable, unowned, and linked ancestors before root writes.\n");
}
finally {
	await chmod(workDirectory, 0o700);
	await chown(workDirectory, 0, 0);
	await rm(workDirectory, { force: true, recursive: true });
}
