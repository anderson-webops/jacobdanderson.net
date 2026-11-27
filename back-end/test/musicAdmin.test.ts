import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { request as httpRequest } from "node:http";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";
import express from "express";
import { installMusicAdmin } from "../src/musicAdmin.js";

test("music edits persist across reads and filter both public sections and removals", async () => {
	const root = await mkdtemp(path.join(tmpdir(), "music-editor-"));
	await mkdir(path.join(root, "audio"));
	await writeFile(path.join(root, "catalog.json"), "{\"version\":1,\"tracks\":[]}");
	const app = express();
	installMusicAdmin(
		app,
		(_req, res, next) => {
			res.locals.projectAdminAudit = { actor: "fixture", requestId: "fixture" };
			next();
		},
		root
	);
	const server = app.listen(0, "127.0.0.1");
	try {
		await new Promise<void>(resolve => server.once("listening", resolve));
		const address = server.address();
		assert.ok(address && typeof address !== "string");
		const base = `http://127.0.0.1:${address.port}`;
		const headers = { host: "music.jacobdanderson.net", origin: "https://music.jacobdanderson.net" };
		const request = (url: string, init: RequestInit = {}) => new Promise<{ status: number; body: string }>((resolve, reject) => {
			const req = httpRequest(base + url, { method: init.method, headers: init.headers as Record<string, string> }, (res) => {
				const parts: Buffer[] = [];
				res.on("data", part => parts.push(part));
				res.on("end", () => resolve({ status: res.statusCode!, body: Buffer.concat(parts).toString() }));
			});
			req.on("error", reject);
			req.end(init.body);
		});
		const edit = (data: object) =>
			request("/api/admin/music", {
				method: "POST",
				headers: { ...headers, "content-type": "application/json" },
				body: JSON.stringify(data)
			});
		const pub = async () => JSON.parse((await request("/api/music/catalog")).body).tracks;
		const mp3 = Buffer.alloc(96 * 4);
		for (let offset = 0; offset < mp3.length; offset += 96) mp3.writeUInt32BE(0xFFF344C4, offset);
		const add = (bytes: Buffer, origin = headers.origin) =>
			request("/api/admin/music?title=Demo&section=older", {
				method: "POST",
				headers: { ...headers, origin, "content-type": "audio/mpeg" },
				body: new Uint8Array(bytes)
			});
		assert.equal((await add(mp3, "https://example.invalid")).status, 403);
		assert.equal((await add(Buffer.from("not audio"))).status, 415);
		assert.equal((await add(mp3)).status, 204);
		const [{ id }] = await pub();
		assert.equal((await add(mp3)).status, 204);
		const second = (await pub())[1].id;
		assert.equal((await edit({ action: "reorder", id: second, targetId: id, placement: "before" })).status, 204);
		assert.deepEqual((await pub()).map((item: { id: string }) => item.id), [second, id]);
		assert.equal((await edit({ action: "remove", id: second })).status, 204);
		assert.equal((await edit({ action: "move", id, section: "finished" })).status, 204);
		assert.equal((await pub())[0].section, "finished");
		assert.equal((await edit({ action: "visibility", id, hidden: true })).status, 204);
		assert.deepEqual(await pub(), []);
		assert.equal((await edit({ action: "visibility", id, hidden: false })).status, 204);
		assert.equal((await pub()).length, 1);
		assert.equal((await edit({ action: "remove", id })).status, 204);
		assert.deepEqual(await pub(), []);
	}
	finally {
		server.close();
		await rm(root, { recursive: true, force: true });
	}
});
