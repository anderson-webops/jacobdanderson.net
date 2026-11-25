import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import http from "node:http";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer";

const require = createRequire(import.meta.url);
const axeSourcePath = require.resolve("axe-core/axe.min.js");
const scriptDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptDir, "..");
const frontendPackagePath = resolve(projectRoot, "front-end/package.json");
const frontendPackage = JSON.parse(readFileSync(frontendPackagePath, "utf8"));

const siteName = "Jacob D. Anderson";
const frontendKind = "vite";
const frontendPort = Number(process.env.A11Y_FRONTEND_PORT || 3349);
const apiPort = Number(process.env.A11Y_API_PORT || 3049);
const baseUrl = `http://127.0.0.1:${frontendPort}`;
const apiUrl = `http://127.0.0.1:${apiPort}/api`;
const routes = [
	"/",
	"/about",
	"/projects",
	"/other-projects",
	"/admin",
	"/experience",
	"/resume",
	"/classes",
	"/contact",
	"/extra",
	"/extra/photos",
	"/extra/drawings",
	"/page-not-found-check"
];
const colorSchemes = (process.env.A11Y_COLOR_SCHEMES || "light,dark")
	.split(",")
	.map(scheme => scheme.trim())
	.filter(Boolean);

const chromeCandidates = [
	process.env.PUPPETEER_EXECUTABLE_PATH,
	"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
	"/Applications/Chromium.app/Contents/MacOS/Chromium",
	"/usr/bin/google-chrome-stable",
	"/usr/bin/google-chrome",
	"/usr/bin/chromium-browser",
	"/usr/bin/chromium"
].filter(Boolean);

const chromePath = chromeCandidates.find(candidate => existsSync(candidate));
if (chromePath) process.env.PUPPETEER_EXECUTABLE_PATH = chromePath;

function writeServerLine(prefix, data) {
	const text = data.toString().trim();
	if (text) process.stderr.write(`[${prefix}] ${text}\n`);
}

function sendJson(res, body, status = 200) {
	res.writeHead(status, {
		"content-type": "application/json",
		"access-control-allow-origin": baseUrl,
		"access-control-allow-credentials": "true",
		"access-control-allow-headers": "authorization,content-type",
		"access-control-allow-methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS"
	});
	res.end(JSON.stringify(body));
}

function emptyCollection() {
	return {
		items: [],
		results: [],
		data: [],
		records: [],
		total: 0
	};
}

function responseFor(url) {
	const pathname = url.pathname.replace(/\/+/g, "/");
	if (pathname === "/api/gallery/photos" || pathname === "/api/gallery/drawings") {
		const photo = pathname.endsWith("/photos");
		const pageSize = photo ? 24 : 12;
		const secondPage = url.searchParams.has("before");
		const items = Array.from({ length: secondPage ? 4 : pageSize }, (_, index) => {
			const number = index + (secondPage ? pageSize : 0) + 1;
			return {
				id: number.toString(16).padStart(24, "0"),
				description: `Test ${photo ? "photo" : "drawing"} ${number}`,
				width: 4,
				height: 2,
				...(photo && !secondPage && index < 3 ? { favorite: true } : {})
			};
		});
		return { items, next: secondPage ? null : items.at(-1).id };
	}
	if (pathname.startsWith("/api/gallery/")) return { items: [], next: null };
	if (pathname.endsWith("/projects/visibility")) return { items: [] };
	if (pathname.endsWith("/pageview")) return { pageview: 0, startAt: Date.now() };
	if (pathname.includes("/session")) return { authenticated: false, user: null, admin: null };
	if (pathname.includes("/auth") || pathname.includes("/login")) return { authenticated: false, user: null, token: "" };
	if (pathname.includes("/me") || pathname.includes("/account")) return { user: null, authenticated: false };
	if (pathname.includes("/quotes")) return [];
	if (pathname.includes("/availability")) {
		const start = new Date(Date.now() + 24 * 60 * 60_000);
		start.setMinutes(0, 0, 0);
		const end = new Date(start.getTime() + 60 * 60_000);
		return [{ id: "a11y-slot", title: "Available", start: start.toISOString(), end: end.toISOString() }];
	}
	if (pathname.includes("/topics")) return { topics: [], claims: [], ...emptyCollection() };
	if (pathname.includes("/claims")) return { claims: [], ...emptyCollection() };
	if (pathname.includes("/search")) return { query: url.searchParams.get("q") || "", ...emptyCollection() };
	if (pathname.includes("/submissions") || pathname.includes("/board") || pathname.includes("/items")) return emptyCollection();
	if (pathname.includes("/service-directory")) return { services: [], categories: [], ...emptyCollection() };
	if (pathname.includes("/elections")) return { elections: [], ...emptyCollection() };
	if (pathname.includes("/jurisdictions") || pathname.includes("/locations") || pathname.includes("/districts")) return { jurisdictions: [], locations: [], districts: [], ...emptyCollection() };
	if (pathname.includes("/representatives") || pathname.includes("/candidate")) return { representatives: [], candidates: [], ...emptyCollection() };
	if (pathname.includes("/sources")) return { sources: [], ...emptyCollection() };
	if (pathname.includes("/products")) return [];
	if (pathname.includes("/contact") || pathname.includes("/cart") || pathname.includes("/orders")) return { ok: true };
	return { ok: true, ...emptyCollection() };
}

let galleryTraffic;
const fixtureImage = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAQAAAACCAYAAAB/qH1jAAAAEklEQVR4nGOwyJ3zHxkzoAsAACghEgEihFfdAAAAAElFTkSuQmCC", "base64");

function createMockApiServer() {
	return http.createServer((req, res) => {
		const url = new URL(req.url || "/", `http://127.0.0.1:${apiPort}`);
		if (/^\/api\/gallery\/(?:photos|drawings)\/[0-9a-f]{24}$/.test(url.pathname)) {
			const traffic = galleryTraffic;
			if (!traffic) {
				res.writeHead(200, { "Content-Type": "image/png" });
				res.end(fixtureImage);
				return;
			}
			const requests = (traffic.attempts.get(url.pathname) ?? 0) + 1;
			traffic.attempts.set(url.pathname, requests);
			traffic.starts.push(Date.now());
			traffic.active++;
			traffic.peak = Math.max(traffic.active, traffic.peak);
			const delay = setTimeout(() => {
				const fail = url.pathname.endsWith("/000000000000000000000001") && requests === 1;
				res.writeHead(fail ? 503 : 200, { "Content-Type": "image/png", "Cache-Control": "no-store" });
				res.end(fail ? "" : fixtureImage);
			}, 700);
			res.once("close", () => {
				clearTimeout(delay);
				traffic.active--;
			});
			return;
		}
		if (url.pathname.startsWith("/api/admin/")) {
			const authorized = req.headers.authorization === `Basic ${btoa("fixture:gallery-test")}`;
			if (!authorized) return sendJson(res, {}, 403);
			if (url.pathname === "/api/admin/access") return sendJson(res, {}, 204);
			if (req.method === "POST" && /^\/api\/admin\/gallery\/(?:photos|drawings)$/.test(url.pathname)) {
				let bytes = 0;
				req.on("data", (chunk) => {
					bytes += chunk.length;
				});
				req.on("end", () => sendJson(res, {}, bytes === 4 && req.headers["x-image-description"] === "Blue%20pixel" ? 201 : 400));
				return;
			}
		}
		if (req.method === "OPTIONS") {
			sendJson(res, {}, 204);
			return;
		}
		sendJson(res, responseFor(url));
	});
}

async function listen(server, port) {
	await new Promise((resolveListen, reject) => {
		server.once("error", reject);
		server.listen(port, "127.0.0.1", resolveListen);
	});
}

async function waitForHttp(url, timeoutMs = 45_000) {
	const start = Date.now();
	let lastError;
	while (Date.now() - start < timeoutMs) {
		try {
			const response = await fetch(url);
			if (response.ok) return;
			lastError = new Error(`${url} returned ${response.status}`);
		}
		catch (error) {
			lastError = error;
		}
		await new Promise(resolveWait => setTimeout(resolveWait, 400));
	}
	throw lastError || new Error(`Timed out waiting for ${url}`);
}

function startFrontend() {
	const isNuxt = frontendKind === "nuxt" || Object.values(frontendPackage.scripts || {}).some(script => String(script).includes("nuxt"));
	const args = isNuxt
		? ["exec", "-w", "front-end", "--", "nuxt", "dev", "--host", "127.0.0.1", "--port", String(frontendPort)]
		: ["exec", "-w", "front-end", "--", "vite", "--host", "127.0.0.1", "--port", String(frontendPort), "--strictPort"];

	const child = spawn("npm", args, {
		cwd: projectRoot,
		detached: process.platform !== "win32",
		env: {
			...process.env,
			BROWSER: "none",
			DISABLE_ANALYTICS: "true",
			NUXT_TELEMETRY_DISABLED: "1",
			NUXT_PUBLIC_APP_URL: baseUrl,
			NUXT_PUBLIC_SITE_URL: baseUrl,
			NUXT_PUBLIC_API_BASE: apiUrl,
			NUXT_PUBLIC_API_BASE_URL: apiUrl,
			PUBLIC_API_BASE: apiUrl,
			INTERNAL_API_BASE: apiUrl,
			API_INTERNAL_BASE: apiUrl,
			ADMIN_API_BASE: apiUrl,
			NUXT_ADMIN_API_BASE: apiUrl,
			ADMIN_API_KEY: "a11y-smoke",
			NUXT_ADMIN_API_KEY: "a11y-smoke",
			ADMIN_SESSION_SECRET: "a11y-smoke-session-secret",
			NUXT_ADMIN_SESSION_SECRET: "a11y-smoke-session-secret",
			NUXT_SESSION_SIGNING_SECRET: "a11y-smoke-session-secret",
			SESSION_SIGNING_SECRET: "a11y-smoke-session-secret",
			NUXT_PUBLIC_BACKEND_MODE: "mock",
			NUXT_PUBLIC_BILLING_MODE: "mock",
			NUXT_PUBLIC_ENABLE_DEMO_ACCESS: "true",
			NUXT_PUBLIC_FEATURE_INVESTMENT_MODULE: "true",
			NUXT_PUBLIC_PORTAL_URL: baseUrl,
			VITE_API_BASE_URL: apiUrl,
			VITE_API_URL: apiUrl,
			VITE_API_PROXY_TARGET: `http://127.0.0.1:${apiPort}`,
			VITE_SSG_API_BASE_URL: apiUrl,
			VITE_PUBLIC_SITE_ORIGIN: baseUrl,
			VITE_SHOW_AD_SLOTS: "false"
		},
		stdio: ["ignore", "pipe", "pipe"]
	});
	child.stdout.on("data", data => writeServerLine(isNuxt ? "nuxt" : "vite", data));
	child.stderr.on("data", data => writeServerLine(isNuxt ? "nuxt" : "vite", data));
	return child;
}

function closeServer(server) {
	return new Promise((resolveClose) => {
		let resolved = false;
		const finish = () => {
			if (resolved) return;
			resolved = true;
			resolveClose();
		};
		const timeout = setTimeout(() => {
			server.closeAllConnections?.();
			finish();
		}, 5_000);
		timeout.unref();

		server.close(() => {
			clearTimeout(timeout);
			finish();
		});
		server.closeIdleConnections?.();
	});
}

function stopChildProcess(child) {
	return new Promise((resolveStop) => {
		if (child.exitCode !== null || child.signalCode !== null) {
			resolveStop();
			return;
		}

		let resolved = false;
		const finish = () => {
			if (resolved) return;
			resolved = true;
			resolveStop();
		};
		const kill = (signal) => {
			try {
				if (process.platform === "win32") child.kill(signal);
				else process.kill(-child.pid, signal);
			}
			catch (error) {
				if (error?.code !== "ESRCH") console.warn(`Unable to stop a11y frontend process: ${error.message}`);
			}
		};
		const timeout = setTimeout(() => {
			kill("SIGKILL");
			finish();
		}, 5_000);
		timeout.unref();

		child.once("exit", () => {
			clearTimeout(timeout);
			finish();
		});

		kill("SIGTERM");
	});
}

async function analyzePage(browser, route, scheme) {
	const url = `${baseUrl}${route}`;
	const page = await browser.newPage();
	page.setDefaultTimeout(30_000);
	await page.setViewport({ width: 1280, height: 1000, deviceScaleFactor: 1 });
	if (scheme === "dark" || scheme === "light") {
		await page.emulateMediaFeatures([{ name: "prefers-color-scheme", value: scheme }]);
	}
	await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30_000 });
	await page.waitForNetworkIdle({ idleTime: 500, timeout: 8_000 }).catch(() => {});
	await page.addScriptTag({ path: axeSourcePath });
	const result = await page.evaluate(async () => {
		return await globalThis.axe.run(document, {
			resultTypes: ["violations"],
			runOnly: {
				type: "tag",
				values: ["wcag2a", "wcag2aa"]
			}
		});
	});
	await page.close();
	return {
		url,
		scheme,
		violations: result.violations.filter(violation => violation.id !== "frame-tested")
	};
}

async function checkGalleryPublishing(browser) {
	const page = await browser.newPage();
	try {
		await page.setViewport({ width: 390, height: 844 });
		await page.goto(`${baseUrl}/admin`, { waitUntil: "networkidle0" });
		await page.type("[name=username]", "fixture");
		await page.type("[name=password]", "incorrect");
		await page.click("form button");
		await page.waitForSelector("[role=alert]");
		assert.equal(await page.$("input[type=file]"), null);
		await page.type("[name=password]", "gallery-test");
		await page.click("form button");
		for (const gallery of ["photos", "drawings"]) {
			if (gallery === "drawings") await page.locator("::-p-text(Drawings)").click();
			await page.waitForSelector("input[type=file]");
			await page.evaluate(async () => {
				const canvas = document.createElement("canvas");
				canvas.width = canvas.height = 1;
				const context = canvas.getContext("2d");
				context.fillStyle = "blue";
				context.fillRect(0, 0, 1, 1);
				const png = await new Promise(resolveBlob => canvas.toBlob(resolveBlob));
				const transfer = new DataTransfer();
				transfer.items.add(new File([png], "example.png", { type: "image/png" }));
				const input = document.querySelector("input[type=file]");
				input.files = transfer.files;
				input.dispatchEvent(new Event("change", { bubbles: true }));
			});
			await page.waitForSelector("input[maxlength='200']");
			await page.type("input[maxlength='200']", "Blue pixel");
			await page.addScriptTag({ path: axeSourcePath });
			const violations = await page.evaluate(async () => (await globalThis.axe.run(document, {
				runOnly: { type: "tag", values: ["wcag2a", "wcag2aa"] }
			})).violations.map(issue => issue.id));
			assert.deepEqual(violations, []);
			const request = page.waitForResponse(response => new URL(response.url()).pathname === `/api/admin/gallery/${gallery}` && response.status() === 201);
			await page.click("form button");
			await request;
			await page.waitForFunction(() => document.querySelector("form [role=status]")?.textContent.includes("published"));
		}
		await page.locator("::-p-text(Sign out)").click();
		await page.waitForSelector("[name=password]");
		assert.equal(await page.$("input[type=file]"), null);
		console.log("Gallery sign-in, both uploads, accessibility and sign-out passed.");
	}
	finally { await page.close(); }
}

async function checkScrollingGallery(browser, gallery, width) {
	const page = await browser.newPage();
	const traffic = { active: 0, peak: 0, attempts: new Map(), starts: [] };
	galleryTraffic = traffic;
	try {
		const photos = gallery === "photos";
		const label = photos ? "photo" : "drawing";
		const firstBatch = photos ? 24 : 12;
		await page.setViewport({ width, height: 960 });
		await page.goto(`${baseUrl}/extra/${gallery}`, { waitUntil: "domcontentloaded" });
		await page.waitForFunction(() => document.querySelector(".lead img")?.naturalWidth === 4);
		assert.equal((await page.$$(".photo-tile")).length, firstBatch);
		assert.ok(traffic.attempts.size < firstBatch, "Offscreen media requested before scrolling");
		assert.equal(traffic.attempts.get(`/api/gallery/${gallery}/000000000000000000000001`), 2);
		const dimensions = await page.evaluate(() => {
			const bounds = selector => document.querySelector(selector)?.getBoundingClientRect();
			const regular = document.querySelector(".photo-grid:not(.favorites)");
			return { width: bounds(".photo-gallery").width, lead: bounds(".lead").width, favorite: bounds(".favorites .photo-tile")?.width ?? 0, regular: bounds(".photo-grid:not(.favorites) .photo-tile").width, columns: getComputedStyle(regular).gridTemplateColumns.split(" ").length, fit: getComputedStyle(document.querySelector(".lead img")).objectFit };
		});
		assert.ok(dimensions.width >= width - 48 && dimensions.lead > dimensions.regular);
		assert.equal(dimensions.columns, width > 760 ? 3 : 2);
		assert.equal(dimensions.fit, photos ? "cover" : "contain");
		if (photos && width > 760) assert.ok(dimensions.lead > dimensions.favorite && dimensions.favorite > dimensions.regular);
		await page.click(".lead");
		await page.waitForSelector("dialog[open]");
		assert.equal(await page.$eval("dialog img", image => image.alt), `Test ${label} 1`);
		await page.keyboard.press("ArrowRight");
		await page.waitForFunction(expected => document.querySelector("dialog img")?.alt === expected, {}, `Test ${label} ${photos ? 4 : 2}`);
		assert.equal(await page.$eval("dialog", dialog => dialog.clientWidth), width);
		await page.keyboard.press("Escape");
		await page.waitForFunction(() => !document.querySelector("dialog").open && document.activeElement.matches(".lead"));

		await page.$eval(".gallery-sentinel", element => element.scrollIntoView());
		await page.waitForFunction(count => document.querySelectorAll(".photo-tile").length === count, {}, firstBatch + 4);
		assert.equal(await page.$eval(".lead img", image => image.alt), `Test ${label} 1`);
		assert.equal(await page.$(".pagination"), null);
		await page.$$eval(".photo-tile", tiles => tiles.at(-1).scrollIntoView());
		await page.waitForFunction(() => Array.from(document.querySelectorAll(".photo-tile img")).at(-1)?.naturalWidth === 4);
		assert.ok(traffic.peak <= 4, `Too many simultaneous image requests: ${traffic.peak}`);
		assert.ok(traffic.starts.every((start, index) => index < 7 || start - traffic.starts[index - 7] >= 1000), "Image request starts exceeded the paced rate");
		console.log(`${gallery} continuous scroll at ${width}px, viewer, and 503 recovery passed (peak ${traffic.peak} image requests).`);
	}
	finally {
		galleryTraffic = undefined;
		await page.close();
	}
}

async function checkReadingLayout(browser, route) {
	const page = await browser.newPage();
	try {
		for (const width of [320, 390, 768, 1280]) {
			await page.setViewport({ width, height: 900, deviceScaleFactor: 1 });
			await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle0" });
			const metrics = await page.evaluate(() => ({
				width: document.documentElement.clientWidth,
				scrollWidth: document.documentElement.scrollWidth,
				headings: document.querySelectorAll("main h1").length,
				// Count rendered text, excluding hidden navigation and script content.
				// eslint-disable-next-line unicorn/prefer-dom-node-text-content
				words: document.querySelector("main").innerText.trim().split(/\s+/).length,
				height: document.querySelector("main").getBoundingClientRect().height
			}));
			assert.equal(metrics.headings, 1, `${route} must have one main heading`);
			assert.ok(metrics.scrollWidth <= metrics.width + 1, `${route} overflows at ${width}px`);
			console.log(`reading layout ok: ${route} at ${width}px (${metrics.words} words; ${Math.round(metrics.height)}px main)`);

			if (width === 320) {
				await page.addStyleTag({ content: `
					* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; }
					p { margin-bottom: 2em !important; }
				` });
				const spacing = await page.evaluate(() => ({
					overflows: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
					offenders: [...document.querySelectorAll("main h1, main a, main button, main .price")]
						.filter(element => element.getBoundingClientRect().right > document.documentElement.clientWidth + 1)
						.map(element => element.textContent.trim())
				}));
				assert.equal(spacing.overflows, false, `${route} overflows with reader text spacing: ${spacing.offenders.join(", ")}`);
			}
		}
		// A 1280px browser at 200% zoom presents a 640 CSS-pixel layout viewport.
		await page.setViewport({ width: 640, height: 450, deviceScaleFactor: 2 });
		await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle0" });
		assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1), `${route} fails 200% reflow`);
	}
	finally {
		await page.close();
	}
}

async function checkKeyboard(browser, route) {
	const page = await browser.newPage();
	try {
		await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle0" });
		const count = await page.evaluate(() => [...document.querySelectorAll("a[href], button, input, select, textarea, [tabindex]")]
			.filter(element => element.tabIndex >= 0 && !element.disabled && element.getClientRects().length && getComputedStyle(element).visibility !== "hidden")
			.length);
		const reached = new Set();
		for (let index = 0; index < count; index++) {
			await page.keyboard.press("Tab");
			const focus = await page.evaluate(() => {
				const element = document.activeElement;
				return {
					index: [...document.querySelectorAll("a[href], button, input, select, textarea, [tabindex]")].indexOf(element),
					outline: getComputedStyle(element).outlineStyle,
					label: element.getAttribute("aria-label") || element.textContent.trim()
				};
			});
			assert.ok(focus.index >= 0, `${route} loses keyboard focus`);
			assert.notEqual(focus.outline, "none", `${route} has no visible focus on ${focus.label}`);
			reached.add(focus.index);
		}
		assert.equal(reached.size, count, `${route} has unreachable or repeated keyboard controls`);
		console.log(`keyboard ok: ${route} (${count} controls)`);
	}
	finally {
		await page.close();
	}
}

async function checkResumePrint(browser) {
	const page = await browser.newPage();
	try {
		await page.goto(`${baseUrl}/resume`, { waitUntil: "networkidle0" });
		await page.emulateMediaType("print");
		const printState = await page.evaluate(() => ({
			hidden: [".site-header", ".footer", ".skip-link", ".resume-actions"]
				.every(selector => getComputedStyle(document.querySelector(selector)).display === "none"),
			role: document.querySelector(".current-role h3").textContent,
			width: document.documentElement.scrollWidth,
			viewport: document.documentElement.clientWidth
		}));
		assert.equal(printState.hidden, true, "Printed résumé includes navigation or action controls");
		assert.equal(printState.role, "Patent Technical Specialist");
		assert.ok(printState.width <= printState.viewport + 1, "Printed résumé overflows horizontally");
		if (process.env.A11Y_PRINT_OUTPUT) {
			await page.pdf({ path: process.env.A11Y_PRINT_OUTPUT, preferCSSPageSize: true, printBackground: true });
		}
		console.log("résumé print styles ok");
	}
	finally {
		await page.close();
	}
}

const apiServer = createMockApiServer();
const frontendProcess = startFrontend();
let browser;

try {
	await listen(apiServer, apiPort);
	await waitForHttp(baseUrl);

	browser = await puppeteer.launch({
		executablePath: chromePath,
		headless: "new",
		args: ["--no-sandbox", "--disable-dev-shm-usage"]
	});
	await checkResumePrint(browser);
	await checkGalleryPublishing(browser);
	await checkScrollingGallery(browser, "photos", 1440);
	await checkScrollingGallery(browser, "drawings", 390);

	const failures = [];
	for (const route of routes) {
		for (const scheme of colorSchemes) {
			const result = await analyzePage(browser, route, scheme);
			if (result.violations.length) {
				failures.push(result);
				continue;
			}
			console.log(`a11y ok: ${result.url} [${scheme}]`);
		}
		await checkReadingLayout(browser, route);
		await checkKeyboard(browser, route);
	}

	if (failures.length) {
		for (const failure of failures) {
			console.error(`\nAccessibility issues for ${siteName} at ${failure.url} [${failure.scheme}]`);
			for (const violation of failure.violations) {
				console.error(`- [${violation.impact ?? "unknown"}] ${violation.id}: ${violation.help}`);
				console.error(`  ${violation.helpUrl}`);
				for (const node of violation.nodes) {
					console.error(`  ${node.target.join(", ")}`);
				}
			}
		}
		process.exitCode = 1;
	}
}
finally {
	if (browser) await browser.close();
	await stopChildProcess(frontendProcess);
	// A detached development sidecar can retain these pipes after Vite exits.
	frontendProcess.stdout?.destroy();
	frontendProcess.stderr?.destroy();
	await closeServer(apiServer);
}
