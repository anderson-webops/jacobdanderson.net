import assert from "node:assert/strict";
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

function createMockApiServer() {
	return http.createServer((req, res) => {
		const url = new URL(req.url || "/", `http://127.0.0.1:${apiPort}`);
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
	await closeServer(apiServer);
}
