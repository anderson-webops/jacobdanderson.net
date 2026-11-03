import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync, statSync } from "node:fs";
import { dirname, isAbsolute, normalize, resolve } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const decisions = new Set(["integrated", "already-integrated", "site-specific", "not-applicable", "retired"]);

export function validateUpstreamReview(review) {
	assert.equal(review.schemaVersion, 1);
	assert.equal(review.repository, "https://github.com/antfu/vitesse");
	for (const key of ["upstreamCommit", "mergeBase", "siteBaseline"]) assert.match(review[key], /^[a-f0-9]{40}$/u);
	assert.ok(Array.isArray(review.entries) && review.entries.length > 0, "Missing upstream path review");
	const seen = new Set();
	for (const entry of review.entries) {
		assert.match(entry.status, /^[AMD]$/u);
		assert.ok(typeof entry.path === "string" && entry.path.length > 0);
		assert.ok(!seen.has(entry.path), `Duplicate upstream path ${entry.path}`);
		seen.add(entry.path);
		assert.ok(decisions.has(entry.decision), `Unreviewed upstream path ${entry.path}`);
		assert.ok(typeof entry.reason === "string" && entry.reason.trim().length > 0);
		assert.ok(Array.isArray(entry.targets) && entry.targets.length > 0);
		for (const target of [entry.path, ...entry.targets]) {
			assert.ok(typeof target === "string" && target.length > 0 && !isAbsolute(target));
			assert.equal(normalize(target), target);
			assert.ok(!target.split("/").includes(".."), "Review path escapes the repository");
		}
	}
	return review;
}

export function verifyUpstreamReview(review) {
	validateUpstreamReview(review);
	const git = args => execFileSync("git", args, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
	git(["merge-base", "--is-ancestor", review.upstreamCommit, "HEAD"]);
	git(["merge-base", "--is-ancestor", review.siteBaseline, "HEAD"]);
	const actual = git(["diff", "--name-status", "--no-renames", review.mergeBase, review.upstreamCommit])
		.split("\n")
		.map((line) => {
			const [status, path] = line.split("\t");
			return { status, path };
		});
	assert.deepEqual(review.entries.map(({ status, path }) => ({ status, path })), actual, "Upstream path review is incomplete or stale");
	for (const entry of review.entries) {
		for (const target of entry.targets) assert.ok(statSync(resolve(root, target)), `Missing reviewed target ${target}`);
	}
	assert.deepEqual(readFileSync(resolve(root, "front-end/LICENSE")), execFileSync("git", ["show", `${review.upstreamCommit}:LICENSE`], { cwd: root }));
	assert.equal(git(["ls-files", "--", "src", "public", "locales", "cypress", "test", "index.html", "vite.config.ts", "uno.config.ts", "pnpm-lock.yaml", "pnpm-workspace.yaml", "Dockerfile"]), "", "Starter-only root files were restored");
	console.log(`Verified upstream ancestry and ${actual.length} exact reviewed paths.`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
	verifyUpstreamReview(JSON.parse(readFileSync(resolve(root, "docs/upstream-vitesse.json"), "utf8")));
}
