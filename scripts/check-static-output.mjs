import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const distDir = fileURLToPath(new URL("../front-end/dist/", import.meta.url));

const requiredFiles = [
	"index.html",
	"about/index.html",
	"experience/index.html",
	"projects/index.html",
	"other-projects/index.html",
	"admin/index.html",
	"classes/index.html",
	"contact/index.html",
	"resume/index.html",
	"deployment.json",
	"sitemap.xml",
	"site.webmanifest",
	"robots.txt"
];

const forbiddenFiles = [
	"about.html",
	"experience.html",
	"projects.html",
	"other-projects.html",
	"admin.html",
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

function readOutput(file) {
	return readFileSync(join(distDir, file), "utf8");
}

function requireMatch(file, pattern, description) {
	if (pattern.test(readOutput(file))) return;
	console.error(`Static output check failed for front-end/dist/${file}: ${description}.`);
	process.exit(1);
}

requireMatch("other-projects/index.html", /<title>Other Projects \| Jacob Anderson<\/title>/, "route title missing");
requireMatch(
	"other-projects/index.html",
	/<meta[^>]*(?:name="robots"[^>]*content="noindex,follow"|content="noindex,follow"[^>]*name="robots")[^>]*>/,
	"noindex metadata missing"
);
requireMatch("admin/index.html", /<title>Project Visibility \| Jacob Anderson<\/title>/, "route title missing");
requireMatch(
	"admin/index.html",
	/<meta[^>]*(?:name="robots"[^>]*content="noindex,nofollow"|content="noindex,nofollow"[^>]*name="robots")[^>]*>/,
	"noindex metadata missing"
);
for (const file of requiredFiles.filter(name => name.endsWith("index.html"))) {
	const scriptTags = readOutput(file).match(/<script[^>]*>/gu) ?? [];
	const externalScripts = scriptTags.filter(tag => /\ssrc="https?:\/\/[^"]+"/u.test(tag));
	const adminPage = file === "admin/index.html";
	const analyticsScript = externalScripts[0] ?? "";
	const invalid = externalScripts.length !== (adminPage ? 0 : 1)
		|| (!adminPage && (!analyticsScript.includes(" src=\"https://analytics.jacobdanderson.net/script.js\"")
			|| !/\sintegrity="sha384-[A-Za-z0-9+/]{64}"/u.test(analyticsScript)
			|| !/\scrossorigin="anonymous"/u.test(analyticsScript)));
	if (invalid) {
		console.error(`Static output check failed for front-end/dist/${file}: external scripts must be absent from admin or exactly one integrity-pinned analytics tracker on public pages.`);
		process.exit(1);
	}
}

const sitemap = readOutput("sitemap.xml");
if (sitemap.includes("/admin") || sitemap.includes("/other-projects")) {
	console.error("Static output check failed for front-end/dist/sitemap.xml: unlisted routes must be excluded.");
	process.exit(1);
}
requireMatch("robots.txt", /Disallow: \/admin/, "admin crawler rule missing");
requireMatch("robots.txt", /Disallow: \/api/, "API crawler rule missing");

console.log("Static output shape and metadata ok.");
