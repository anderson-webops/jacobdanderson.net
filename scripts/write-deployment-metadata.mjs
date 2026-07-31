import { execFileSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

function gitValue(args) {
	try {
		return execFileSync("git", args, {
			encoding: "utf8",
			stdio: ["ignore", "pipe", "ignore"]
		}).trim();
	}
	catch {
		return "";
	}
}

function safeMetadataValue(value) {
	return String(value || "")
		.trim()
		.replace(/[^\w./+@:-]/g, "")
		.slice(0, 160);
}

const commit = safeMetadataValue(
	process.env.SOURCE_COMMIT
	|| process.env.COMMIT_REF
	|| process.env.GITHUB_SHA
	|| process.env.VITE_SOURCE_COMMIT
	|| gitValue(["rev-parse", "HEAD"])
);
const ref = safeMetadataValue(
	process.env.SOURCE_TAG
	|| process.env.RELEASE_VERSION
	|| process.env.GITHUB_REF_NAME
	|| process.env.BRANCH
	|| gitValue(["describe", "--tags", "--exact-match"])
);
const destination = path.resolve("front-end/dist/deployment.json");

await mkdir(path.dirname(destination), { recursive: true });
await writeFile(
	destination,
	`${JSON.stringify(
		{
			commit,
			ok: true,
			ref,
			runtime: "vite-ssg",
			service: "front-end"
		},
		null,
		2
	)}\n`,
	"utf8"
);

process.stdout.write(`Wrote ${path.relative(process.cwd(), destination)}.\n`);
