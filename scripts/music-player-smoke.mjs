import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import { readFile } from "node:fs/promises";
import process from "node:process";
import { MUSIC_HOST, MUSIC_ORIGIN, MUSIC_ROUTE } from "../front-end/src/config/musicSite.ts";

const catalog = JSON.parse(await readFile(new URL("../front-end/src/data/music.json", import.meta.url), "utf8"));
const local = catalog.tracks.find(track => track.section === "in-progress");
const published = catalog.tracks.find(track => track.section === "finished" && !track.audio);
const silentFrame = Buffer.from("//NExAAAAANIAAAAAExBTUU0LjBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTQu", "base64");
const sample = process.env.MUSIC_SMOKE_MP3 ? await readFile(process.env.MUSIC_SMOKE_MP3) : Buffer.concat(Array.from({ length: 250 }).fill(silentFrame));

export function serveMusicFixture(request, response, pathname) {
	if (pathname === "/music-library/catalog.json") {
		response.writeHead(200, { "content-type": "application/json" }).end(JSON.stringify(catalog));
		return true;
	}
	if (pathname !== `/music-library/audio/${local.audio}`) return false;
	const range = /^bytes=(\d+)-(\d*)$/u.exec(request.headers.range ?? "");
	const start = range ? Number(range[1]) : 0;
	const end = range?.[2] ? Math.min(Number(range[2]), sample.length - 1) : sample.length - 1;
	if (start > end) {
		response.writeHead(416, { "content-range": `bytes */${sample.length}` }).end();
		return true;
	}
	response.writeHead(range ? 206 : 200, {
		"accept-ranges": "bytes",
		"content-type": "audio/mpeg",
		"content-length": end - start + 1,
		...(range ? { "content-range": `bytes ${start}-${end}/${sample.length}` } : {})
	}).end(sample.subarray(start, end + 1));
	return true;
}

export async function checkMusic(page, origin, port, output) {
	const activity = { audio: 0, widgets: 0 };
	const intercept = async (request) => {
		const url = new URL(request.url());
		if (url.origin === "https://w.soundcloud.com") {
			activity.widgets++;
			await request.respond({ status: 200, contentType: "text/html", body: "<title>SoundCloud fixture</title>" }, 10);
		}
		else if (url.pathname === `/music-library/audio/${local.audio}`) {
			activity.audio++;
		}
	};
	page.on("request", intercept);
	try {
		for (const standalone of [false, true]) {
			await page.setViewport({ width: standalone ? 390 : 1280, height: standalone ? 844 : 900, isMobile: standalone, hasTouch: standalone });
			const start = { ...activity };
			if (standalone) {
				await page.goto(`http://${MUSIC_HOST}:${port}/`, { waitUntil: "networkidle0" });
			}
			else {
				await page.goto(`${origin}/extra`, { waitUntil: "networkidle0" });
				await Promise.all([page.waitForNavigation({ waitUntil: "networkidle0" }), page.click(`a[href="${MUSIC_ROUTE}"]`)]);
			}
			assert.equal(await page.$eval("link[rel=canonical]", node => node.href), standalone ? `${MUSIC_ORIGIN}/` : `https://jacobdanderson.net${MUSIC_ROUTE}`);
			assert.deepEqual(await page.$$eval(".library h2", nodes => nodes.map(node => node.textContent)), ["Finished", "In Progress", "Older"]);
			assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
			assert.deepEqual(activity, start);
			assert.equal(await page.$("iframe, audio"), null);
			await page.screenshot({ path: `${output}/music-${standalone ? "mobile" : "desktop"}.png` });
			const row = `button[aria-label="Play ${local.title}"]`;
			await page.focus(row);
			await page.keyboard.press("Enter");
			await page.waitForFunction(() => document.querySelector("audio")?.currentTime > 0.05);
			const controls = await page.$eval("audio", (audio) => {
				audio.pause();
				audio.currentTime = 1.5;
				return audio.controls && audio.paused && audio.duration > 2;
			});
			assert.ok(controls);
			await page.waitForFunction(() => document.querySelector("audio")?.currentTime >= 1.4);
			await page.click(`button[aria-label="Play ${published.title}"]`);
			await page.waitForSelector(".sources a");
			assert.equal(await page.$("iframe, audio"), null);
			assert.equal(await page.$eval(".sources a", anchor => anchor.href), published.permalink);
			await page.click(`button[aria-label="Close player for ${published.title}"]`);
			assert.equal(await page.$("audio, iframe"), null);
			assert.ok(activity.audio > start.audio && activity.widgets === 0);
		}
		return activity;
	}
	finally {
		page.off("request", intercept);
	}
}
