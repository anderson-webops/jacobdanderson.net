import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { GALLERY_DOCUMENTS, GALLERY_SITES, galleryDocumentPath, galleryOrigin } from "../front-end/src/config/gallerySites.ts";
import { MUSIC_DOCUMENT, MUSIC_HOST, MUSIC_ORIGIN, MUSIC_ROUTE } from "../front-end/src/config/musicSite.ts";
import { externalScriptsMatchPolicy } from "./static-script-policy.mjs";

const distDir = fileURLToPath(new URL("../front-end/dist/", import.meta.url));

const galleryFiles = GALLERY_SITES.flatMap(site =>
	["index.html", "admin/index.html", "robots.txt", "sitemap.xml"].map(file => `${galleryDocumentPath(site).slice(1)}/${file}`)
);
const musicFiles = ["index.html", "robots.txt", "sitemap.xml"].map(file => `${MUSIC_DOCUMENT.slice(1)}/${file}`);
const requiredFiles = [
	...musicFiles,
	"extra/music/index.html",
	"images/music-sleeve.svg",
	...galleryFiles,
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
	const localScriptsOnly = file === "admin/index.html" || galleryFiles.includes(file) || musicFiles.includes(file);
	if (!externalScriptsMatchPolicy(readOutput(file), localScriptsOnly)) {
		console.error(`Static output check failed for front-end/dist/${file}: external scripts must be absent from admin and standalone galleries, or exactly one integrity-pinned analytics tracker on other public pages.`);
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
if (sitemap.includes("/admin") || sitemap.includes("/other-projects") || sitemap.includes(GALLERY_DOCUMENTS)) {
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

const contract = JSON.parse(readFileSync(new URL("../deploy/runtime-artifact.json", import.meta.url), "utf8"));
const robots = readOutput("robots.txt");
if (Object.keys(contract.gallerySites ?? {}).length !== GALLERY_SITES.length) {
	throw new Error("Gallery site contract does not enumerate each built host.");
}
for (const site of GALLERY_SITES) {
	const document = galleryDocumentPath(site).slice(1);
	const origin = galleryOrigin(site);
	const html = readOutput(`${document}/index.html`);
	const mapping = contract.gallerySites[site.hostname];
	if (mapping?.collection !== site.gallery || mapping.document !== `front-end/dist/${document}/index.html`
		|| mapping.adminDocument !== `front-end/dist/${document}/admin/index.html` || mapping.mediaPath !== `/api/gallery/${site.gallery}`) {
		throw new Error(`Gallery host mapping drift for ${site.hostname}.`);
	}
	const adminHtml = readOutput(`${document}/admin/index.html`);
	if (!adminHtml.includes(`rel="canonical" href="${origin}/admin"`) || !adminHtml.includes("noindex,nofollow")
		|| !adminHtml.includes("Admin sign-in") || adminHtml.includes("aria-label=\"Primary\"")) {
		throw new Error(`Invalid private gallery document for ${site.hostname}.`);
	}
	if (!html.includes(`<title>${site.title}</title>`) || !html.includes(`rel="canonical" href="${origin}/"`)
		|| !html.includes("href=\"https://jacobdanderson.net/extra\"") || html.includes("aria-label=\"Primary\"")) {
		throw new Error(`Invalid standalone gallery document for ${site.hostname}.`);
	}
	if (readOutput(`${document}/robots.txt`) !== robots.replace("https://jacobdanderson.net/sitemap.xml", `${origin}/sitemap.xml`)
		|| !readOutput(`${document}/sitemap.xml`).includes(`<loc>${origin}/</loc>`)) {
		throw new Error(`Invalid gallery robots or sitemap for ${site.hostname}.`);
	}
}
for (const [file, canonical] of [[musicFiles[0], `${MUSIC_ORIGIN}/`], ["extra/music/index.html", `https://jacobdanderson.net${MUSIC_ROUTE}`]]) {
	const html = readOutput(file);
	if (!html.includes(`rel="canonical" href="${canonical}"`) || !["finished", "in-progress", "older"].every(id => html.includes(`id="${id}"`))
		|| /<(?:audio|iframe)\b/u.test(html)) {
		throw new Error(`Invalid music document: ${file}`);
	}
}
if (contract.musicSite?.hostname !== MUSIC_HOST || contract.musicSite.document !== `front-end/dist/${musicFiles[0]}`
	|| readOutput(musicFiles[1]) !== robots.replace("https://jacobdanderson.net/sitemap.xml", `${MUSIC_ORIGIN}/sitemap.xml`)
	|| !readOutput(musicFiles[2]).includes(`<loc>${MUSIC_ORIGIN}/</loc>`)) {
	throw new Error("Invalid music host mapping");
}
console.log("Static output shape and metadata ok.");
