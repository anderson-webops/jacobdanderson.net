import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import { existsSync } from "node:fs";
import { mkdir, mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import http from "node:http";
import { extname, resolve, sep } from "node:path";
import process from "node:process";
import puppeteer from "puppeteer";
import { TRACKER_INTEGRITY, TRACKER_URL } from "../front-end/src/config/analytics.ts";
import { GALLERY_SITES, galleryDocumentPath, galleryOrigin } from "../front-end/src/config/gallerySites.ts";
import { fetchPinnedTracker } from "./tracker-integrity.mjs";

const root = resolve(process.env.HEAD_SMOKE_STATIC_ROOT || "front-end/dist");
const output = resolve(process.env.HEAD_SMOKE_OUTPUT_DIRECTORY || ".ai-work/runs/hydrated-head");
const provider = await fetchPinnedTracker();
await mkdir(output, { recursive: true });
const profile = await mkdtemp(`${output}/profile-`);
const report = { passed: false, tracker: provider.receipt, pages: [], gallerySites: [], externalRequestsSent: 0, mockedCollectorRequests: 0, privateCollectorRequests: 0 };
const fixtureImageId = "0123456789abcdef01234567";
const fixtureImage = Buffer.from("89504e470d0a1a0a0000000d49484452000000040000000208060000007fa87d630000001249444154789c63b0c89df31f1933a00b000028211201228457dd0000000049454e44ae426082", "hex");
const server = http.createServer(async (request, response) => {
	try {
		const url = new URL(request.url, `http://${request.headers.host}`);
		const pathname = decodeURIComponent(url.pathname);
		const site = GALLERY_SITES.find(gallery => gallery.hostname === url.hostname);
		if (site && pathname === `/api/gallery/${site.gallery}`) {
			response.writeHead(200, { "content-type": "application/json" });
			response.end(JSON.stringify({ items: [{ id: fixtureImageId, description: `Fixture ${site.gallery}`, width: 4, height: 2 }], next: null }));
			return;
		}
		if (site && pathname === `/api/gallery/${site.gallery}/${fixtureImageId}`) {
			response.writeHead(200, { "content-type": "image/png" });
			response.end(fixtureImage);
			return;
		}
		if (pathname === "/integrity-fixture") {
			response.writeHead(200, { "content-type": "text/html" });
			response.end("<!doctype html><html><head><title>Integrity fixture</title></head><body></body></html>");
			return;
		}
		const normalized = site && pathname === "/"
			? galleryDocumentPath(site)
			: /^\/admin\/?$/iu.test(pathname) ? "/admin/" : pathname;
		let filepath = resolve(root, `.${normalized}`);
		assert.ok(filepath === root || filepath.startsWith(root + sep), "Fixture path escapes static root");
		if ((await stat(filepath)).isDirectory()) filepath = resolve(filepath, "index.html");
		const mime = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml" };
		response.writeHead(200, { "content-type": mime[extname(filepath)] || "application/octet-stream" });
		response.end(await readFile(filepath));
	}
	catch {
		response.writeHead(404);
		response.end();
	}
});
await new Promise(resolveListen => server.listen(0, "127.0.0.1", resolveListen));
const port = server.address().port;
const origin = `http://127.0.0.1:${port}`;
const galleryFixtureOrigins = new Set(GALLERY_SITES.map(site => `http://${site.hostname}:${port}`));
let browser;
try {
	const executable = [process.env.PUPPETEER_EXECUTABLE_PATH, "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/usr/bin/google-chrome", "/usr/bin/chromium"].find(filepath => filepath && existsSync(filepath));
	const localGalleryMappings = GALLERY_SITES.map(site => `MAP ${site.hostname} 127.0.0.1`).join(", ");
	browser = await puppeteer.launch({
		executablePath: executable,
		userDataDir: profile,
		headless: true,
		args: ["--no-sandbox", "--disable-dev-shm-usage", "--no-proxy-server", `--host-resolver-rules=${localGalleryMappings}`]
	});
	const page = await browser.newPage();
	page.setDefaultTimeout(10_000);
	await page.setViewport({ width: 1440, height: 1000 });
	await page.setRequestInterception(true);
	page.on("request", (request) => {
		const url = new URL(request.url());
		const cors = { "access-control-allow-origin": origin, "access-control-allow-headers": "content-type", "access-control-allow-methods": "GET,POST,OPTIONS" };
		if (request.url() === TRACKER_URL) {
			void request.respond({ status: 200, contentType: "application/javascript", headers: cors, body: provider.body });
		}
		else if (url.origin === new URL(TRACKER_URL).origin) {
			report.mockedCollectorRequests++;
			const payload = JSON.parse(request.postData() || "{}").payload;
			if ([payload?.url, payload?.referrer].some(value => typeof value === "string" && /^\/(?:admin|api)(?:\/|$)/iu.test(new URL(value, origin).pathname))) report.privateCollectorRequests++;
			void request.respond({ status: 200, contentType: "application/json", headers: cors, body: JSON.stringify({ ok: true, cache: "synthetic-fixture" }) });
		}
		else if (url.origin === origin && url.pathname.startsWith("/api/")) {
			void request.respond({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, items: [], results: [], data: [], total: 0, pageview: 0, startAt: 0 }) });
		}
		else if (url.origin === origin || galleryFixtureOrigins.has(url.origin)) {
			void request.continue();
		}
		else {
			void request.abort();
		}
	});
	const errors = [];
	page.on("pageerror", error => errors.push({ url: page.url(), stack: error.stack || error.message }));
	async function observe(label, admin) {
		await new Promise(resolveSettled => setTimeout(resolveSettled, 400));
		const snapshot = await page.evaluate(url => ({
			path: location.pathname,
			titles: document.querySelectorAll("title").length,
			descriptions: document.querySelectorAll("meta[name=\"description\"]").length,
			canonical: document.querySelector("link[rel=\"canonical\"]")?.getAttribute("href"),
			scripts: [...document.querySelectorAll("script[src]")].filter(script => script.src === url).map(script => ({ integrity: script.integrity, crossorigin: script.crossOrigin, key: script.dataset.hid })),
			providerAvailable: typeof window.umami?.track === "function",
			localStylesLoaded: [...document.querySelectorAll("link[rel=\"stylesheet\"]")].filter(link => new URL(link.href).origin === location.origin).every(link => Boolean(link.sheet?.cssRules.length))
		}), TRACKER_URL);
		report.pages.push({ label, admin, ...snapshot });
	}
	await page.goto(`${origin}/`, { waitUntil: "networkidle0" });
	await observe("initial hydration", false);
	for (const route of ["/projects", "/contact", "/projects"]) {
		await page.$eval(`a[href="${route}"]`, element => element.click());
		await page.waitForFunction(pathname => location.pathname.replace(/\/$/u, "") === pathname && document.querySelector("link[rel=\"canonical\"]")?.getAttribute("href")?.replace(/\/$/u, "") === `https://jacobdanderson.net${pathname}`, {}, route);
		await observe(`navigation ${route}`, false);
	}
	await page.evaluate(() => {
		const state = { ...history.state, position: (history.state?.position ?? 0) + 1, current: "/admin" };
		history.pushState(state, "", "/admin");
		window.dispatchEvent(new PopStateEvent("popstate", { state }));
	});
	await page.waitForFunction(() => document.querySelector("meta[name=\"robots\"]")?.getAttribute("content") === "noindex,nofollow");
	await observe("public to private navigation", true);
	for (const route of ["/projects", "/contact"]) {
		const before = report.mockedCollectorRequests;
		await page.$eval(`a[href="${route}"]`, element => element.click());
		await page.waitForFunction(pathname => location.pathname.replace(/\/$/u, "") === pathname, {}, route);
		await observe(`return to public ${route}`, false);
		assert.equal(report.mockedCollectorRequests - before, 1, "A public navigation sent duplicate pageviews");
	}
	for (const route of ["/admin", "/admin/", "/ADMIN", "/ADMIN/"]) {
		await page.goto(`${origin}${route}`, { waitUntil: "networkidle0" });
		await observe(`fresh ${route}`, true);
	}
	assert.equal(report.privateCollectorRequests, 0, "Private navigation leaked to the analytics collector");
	assert.ok(report.mockedCollectorRequests > 0, "Approved public analytics did not send to the synthetic collector");
	for (const snapshot of report.pages) {
		assert.equal(snapshot.titles, 1, `${snapshot.label}: duplicate title`);
		assert.equal(snapshot.descriptions, 1, `${snapshot.label}: duplicate description`);
		assert.equal(snapshot.scripts.length, snapshot.admin ? 0 : 1, `${snapshot.label}: incorrect tracker count`);
		assert.ok(snapshot.localStylesLoaded, `${snapshot.label}: complete stylesheet did not load`);
		if (!snapshot.admin) {
			assert.equal(snapshot.scripts[0].integrity, TRACKER_INTEGRITY);
			assert.equal(snapshot.scripts[0].crossorigin, "anonymous");
			assert.ok(snapshot.providerAvailable, `${snapshot.label}: approved tracker did not execute`);
		}
	}
	const collectorCount = report.mockedCollectorRequests;
	for (const site of GALLERY_SITES) {
		const mediaPath = `/api/gallery/${site.gallery}/${fixtureImageId}`;
		await page.goto(`http://${site.hostname}:${port}/`, { waitUntil: "networkidle0" });
		await page.waitForFunction((path) => {
			const image = document.querySelector(".photo-tile img");
			return image?.complete && image.naturalWidth > 0 && new URL(image.src).pathname === path;
		}, {}, mediaPath);
		const snapshot = await page.evaluate(trackerUrl => ({
			path: location.pathname,
			heading: document.querySelector("h1")?.textContent,
			canonical: document.querySelector("link[rel=\"canonical\"]")?.getAttribute("href"),
			tracker: Boolean(document.querySelector(`script[src="${trackerUrl}"]`)),
			switchback: document.querySelector(".gallery-intro a")?.getAttribute("href"),
			portfolioNav: Boolean(document.querySelector("nav[aria-label=\"Primary\"]")),
			stylesheet: [...document.querySelectorAll("link[rel=\"stylesheet\"]")].some(link => link.sheet?.cssRules.length > 0)
		}), TRACKER_URL);
		assert.deepEqual(snapshot, {
			path: "/",
			heading: site.title.split(" | ")[0],
			canonical: `${galleryOrigin(site)}/`,
			tracker: false,
			switchback: "https://jacobdanderson.net/extra",
			portfolioNav: false,
			stylesheet: true
		});
		await page.click(".lead");
		await page.waitForSelector("dialog[open]");
		assert.equal(await page.$eval("dialog[open]", dialog => dialog.getAttribute("aria-label")), site.gallery === "photos" ? "Photo viewer" : "Drawing viewer");
		report.gallerySites.push({ hostname: site.hostname, ...snapshot });
	}
	assert.equal(report.mockedCollectorRequests, collectorCount, "Standalone galleries must not load analytics.");
	await page.goto(`${origin}/integrity-fixture`, { waitUntil: "networkidle0" });
	report.wrongIntegrityRejected = await page.evaluate(async url => new Promise((resolveProbe, rejectProbe) => {
		const script = document.createElement("script");
		const timer = setTimeout(() => rejectProbe(new Error("Integrity probe did not finish")), 5_000);
		script.src = url;
		script.integrity = `sha384-${"A".repeat(64)}`;
		script.crossOrigin = "anonymous";
		script.onload = () => {
			clearTimeout(timer);
			resolveProbe(false);
		};
		script.onerror = () => {
			clearTimeout(timer);
			resolveProbe(true);
		};
		document.head.append(script);
	}), TRACKER_URL);
	assert.equal(report.wrongIntegrityRejected, true, "Browser accepted an incorrect integrity value");
	assert.deepEqual(errors, []);
	report.passed = true;
	console.log(JSON.stringify(report));
}
finally {
	await browser?.close();
	server.closeAllConnections();
	await new Promise(resolveClose => server.close(resolveClose));
	await writeFile(`${output}/hydrated-head.json`, `${JSON.stringify(report, null, 2)}\n`);
	await rm(profile, { recursive: true });
}
