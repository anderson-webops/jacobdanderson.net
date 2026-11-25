import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { externalScriptsMatchPolicy } from "./static-script-policy.mjs";

const distDir = fileURLToPath(new URL("../front-end/dist/", import.meta.url));

const requiredFiles = [
	"index.html",
	"about/index.html",
	"experience/index.html",
	"projects/index.html",
	"extra/index.html",
	"extra/photos/index.html",
	"extra/drawings/index.html",
	"images/gallery-photos.svg",
	"images/gallery-drawings.svg",
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
requireMatch("admin/index.html", /<title>Site Admin \| Jacob Anderson<\/title>/, "route title missing");
requireMatch(
	"admin/index.html",
	/<meta[^>]*(?:name="robots"[^>]*content="noindex,nofollow"|content="noindex,nofollow"[^>]*name="robots")[^>]*>/,
	"noindex metadata missing"
);
for (const file of requiredFiles.filter(name => name.endsWith("index.html"))) {
	const adminPage = file === "admin/index.html";
	if (!externalScriptsMatchPolicy(readOutput(file), adminPage)) {
		console.error(`Static output check failed for front-end/dist/${file}: external scripts must be absent from admin or exactly one integrity-pinned analytics tracker on public pages.`);
		process.exit(1);
	}
}

const sitemap = readOutput("sitemap.xml");
const sitemapTargets = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/gu)].map(match => new URL(match[1]));
if (!sitemapTargets.length || sitemapTargets.some(target =>
	target.origin !== "https://jacobdanderson.net" || target.username || target.password || target.search || target.hash
)) {
	console.error("Static output check failed for front-end/dist/sitemap.xml: canonical site URLs are required.");
	process.exit(1);
}
if (sitemap.includes("/admin") || sitemap.includes("/other-projects")) {
	console.error("Static output check failed for front-end/dist/sitemap.xml: unlisted routes must be excluded.");
	process.exit(1);
}
const restrictedBots = ["GPTBot", "ClaudeBot", "Google-Extended"];
const searchableBots = [
	"Googlebot",
	"Bingbot",
	"OAI-SearchBot",
	"Claude-SearchBot",
	"PerplexityBot",
	"Perplexity-User",
	"Claude-User",
	"*"
];
const expectedRobots = [
	...restrictedBots.flatMap(bot => [`User-agent: ${bot}`, "Disallow: /"]),
	...searchableBots.flatMap(bot => [`User-agent: ${bot}`, "Allow: /", "Disallow: /admin", "Disallow: /api"]),
	"",
	"Sitemap: https://jacobdanderson.net/sitemap.xml"
].join("\n");
if (readOutput("robots.txt").trim() !== expectedRobots) {
	console.error("Static output check failed for front-end/dist/robots.txt: reviewed crawler policy changed.");
	process.exit(1);
}

console.log("Static output shape and metadata ok.");
