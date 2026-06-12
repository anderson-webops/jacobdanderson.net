import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const distDir = fileURLToPath(new URL("../front-end/dist/", import.meta.url));

const requiredFiles = [
	"index.html",
	"about/index.html",
	"experience/index.html",
	"projects/index.html",
	"classes/index.html",
	"contact/index.html",
	"resume/index.html",
	"site.webmanifest",
	"robots.txt"
];

const forbiddenFiles = [
	"about.html",
	"experience.html",
	"projects.html",
	"classes.html",
	"contact.html",
	"resume.html",
	"hi/index.html",
	"hi.html"
];

const missing = requiredFiles.filter(file => !existsSync(join(distDir, file)));
const unexpected = forbiddenFiles.filter(file => existsSync(join(distDir, file)));

if (missing.length || unexpected.length) {
	if (missing.length) {
		console.error("Missing expected static output:");
		for (const file of missing) console.error(`- front-end/dist/${file}`);
	}

	if (unexpected.length) {
		console.error("Unexpected static output:");
		for (const file of unexpected) console.error(`- front-end/dist/${file}`);
	}

	process.exit(1);
}

console.log("Static output shape ok.");
