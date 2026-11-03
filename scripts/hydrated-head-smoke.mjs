import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { mkdir, mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import http from "node:http";
import { extname, resolve, sep } from "node:path";
import process from "node:process";
import puppeteer from "puppeteer";
import { TRACKER_INTEGRITY, TRACKER_URL } from "../front-end/src/config/analytics.ts";
import { fetchPinnedTracker } from "./tracker-integrity.mjs";

const root = resolve(process.env.HEAD_SMOKE_STATIC_ROOT || "front-end/dist");
const output = resolve(process.env.HEAD_SMOKE_OUTPUT_DIRECTORY || ".ai-work/runs/hydrated-head");
const provider = await fetchPinnedTracker();
await mkdir(output, { recursive: true });
const profile = await mkdtemp(`${output}/profile-`);
const report = { passed: false, tracker: provider.receipt, pages: [], externalRequestsSent: 0, mockedCollectorRequests: 0, privateCollectorRequests: 0 };
const server = http.createServer(async (request, response) => {
	try {
		const pathname = decodeURIComponent(new URL(request.url, "http://fixture.invalid").pathname);
		if (pathname === "/integrity-fixture") {
			response.writeHead(200, { "content-type": "text/html" });
			response.end("<!doctype html><html><head><title>Integrity fixture</title></head><body></body></html>");
			return;
		}
		const normalized = /^\/admin\/?$/iu.test(pathname) ? "/admin/" : pathname;
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
const origin = `http://127.0.0.1:${server.address().port}`;
let browser;
try {
	const executable = [process.env.PUPPETEER_EXECUTABLE_PATH, "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/usr/bin/google-chrome", "/usr/bin/chromium"].find(filepath => filepath && existsSync(filepath));
	browser = await puppeteer.launch({ executablePath: executable, userDataDir: profile, headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage"] });
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
		else if (url.origin === origin) {
			void request.continue();
		}
		else {
			void request.abort();
		}
	});
	const errors = [];
	page.on("pageerror", error => errors.push(error.message));
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
