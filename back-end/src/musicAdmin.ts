import type { Express, RequestHandler } from "express";
import { Buffer } from "node:buffer";
import { createHash, randomUUID } from "node:crypto";
import { chmod, readFile, rename, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import express from "express";
import { z } from "zod";

const section = z.enum(["finished", "in-progress", "older"]);
const track = z
	.object({
		id: z.string().regex(/^[a-z0-9-]+$/),
		title: z.string().trim().min(1).max(180),
		section,
		seconds: z.number().int().positive(),
		hidden: z.boolean().optional(),
		audio: z
			.string()
			.regex(/^[a-z0-9-]+-[a-f0-9]{12}\.mp3$/)
			.optional(),
		soundcloudId: z.number().int().positive().optional(),
		permalink: z
			.string()
			.regex(/^https:\/\/soundcloud\.com\/jacoba1100254352\/[a-z0-9_-]+$/)
			.optional()
	})
	.refine(item => Boolean(item.audio || item.soundcloudId) && Boolean(item.soundcloudId) === Boolean(item.permalink));
const catalog = z.object({ version: z.literal(1), tracks: z.array(track).max(1000) });
const change = z.discriminatedUnion("action", [
	z.object({ action: z.literal("move"), id: z.string(), section }),
	z.object({ action: z.literal("visibility"), id: z.string(), hidden: z.boolean() }),
	z.object({ action: z.literal("reorder"), id: z.string(), targetId: z.string(), placement: z.enum(["before", "after"]) }),
	z.object({ action: z.literal("remove"), id: z.string() })
]);

export function readMp3(bytes: Buffer) {
	let offset = 0;
	if (bytes.subarray(0, 3).toString() === "ID3") {
		if (bytes.length < 10 || bytes.subarray(6, 10).some(value => value > 127)) return;
		offset = 10 + bytes.subarray(6, 10).reduce((size, part) => size * 128 + part, 0);
		if (bytes[3] === 4 && bytes[5]! & 16) offset += 10;
	}
	const start = offset;
	let end = bytes.length;
	if (end >= 128 && bytes.subarray(end - 128, end - 125).toString() === "TAG") end -= 128;
	let seconds = 0;
	let frames = 0;
	const rates = [44100, 48000, 32000];
	const high = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320];
	const low = [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160];
	while (offset + 4 <= end) {
		const header = bytes.readUInt32BE(offset);
		const version = (header >>> 19) & 3;
		const base = rates[(header >>> 10) & 3];
		const bitrate = (version === 3 ? high : low)[(header >>> 12) & 15];
		if (header >>> 21 !== 2047 || ((header >>> 17) & 3) !== 1 || version === 1 || !base || !bitrate) return;
		const sampleRate = base / (version === 3 ? 1 : version === 2 ? 2 : 4);
		offset += Math.floor(((version === 3 ? 144000 : 72000) * bitrate) / sampleRate) + ((header >>> 9) & 1);
		seconds += (version === 3 ? 1152 : 576) / sampleRate;
		frames++;
	}
	if (offset === end && frames >= 2)
		return { audio: bytes.subarray(start, end), seconds: Math.max(1, Math.round(seconds)) };
}

export function installMusicAdmin(
	app: Express,
	requireAdmin: RequestHandler,
	directory = process.env.MUSIC_LIBRARY_DIR
) {
	if (directory && !path.isAbsolute(directory)) return;
	const root = directory || "/srv/jacobdanderson.net/media/music-library";
	const state = path.join(root, ".managed.json");
	let busy = false;
	let writing = false;
	async function read() {
		let bytes;
		try {
			bytes = await readFile(state, "utf8");
		}
		catch (error) {
			if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
			bytes = await readFile(path.join(root, "catalog.json"), "utf8");
		}
		return catalog.parse(JSON.parse(bytes));
	}
	app.get("/api/music/catalog", async (_request, response) => {
		response.set("Cache-Control", "no-store");
		try {
			const data = await read();
			return response.json({ version: 1, tracks: data.tracks.filter(item => !item.hidden) });
		}
		catch {
			return response.sendStatus(503);
		}
	});
	if (!directory) return;
	const musicHost: RequestHandler = (request, response, next) => {
		response.set("Cache-Control", "no-store");
		if (request.get("host") !== "music.jacobdanderson.net") {
			response.sendStatus(404);
			return;
		}
		if (request.method !== "GET" && request.get("origin") !== "https://music.jacobdanderson.net") {
			response.sendStatus(403);
			return;
		}
		next();
	};
	app.get("/api/admin/music", requireAdmin, musicHost, async (_request, response) => {
		try {
			return response.json(await read());
		}
		catch {
			return response.sendStatus(503);
		}
	});
	const lock: RequestHandler = (_req, res, next) => {
		if (busy) {
			res.sendStatus(409);
			return;
		}
		busy = true;
		res.once("close", () => {
			busy = false;
		});
		next();
	};
	app.post(
		"/api/admin/music",
		requireAdmin,
		musicHost,
		lock,
		express.json({ limit: "2kb" }),
		express.raw({ type: "audio/mpeg", limit: "48mb", inflate: false }),
		async (req, res) => {
			if (writing) return res.sendStatus(409);
			writing = true;
			try {
				const data = await read();
				let action, id;
				if (req.is("audio/mpeg")) {
					const fields = z.object({ title: z.string().trim().min(1).max(180), section }).safeParse(req.query);
					if (
						!fields.success
						|| !Buffer.isBuffer(req.body)
						|| req.body.length < 4
						|| data.tracks.length >= 1000
					) {
						return res.sendStatus(400);
					}
					const parsedAudio = readMp3(req.body);
					if (!parsedAudio) return res.sendStatus(415);
					const bytes = parsedAudio.audio;
					id = randomUUID();
					const audio = `${id}-${createHash("sha256").update(bytes).digest("hex").slice(0, 12)}.mp3`;
					await writeFile(path.join(root, "audio", audio), bytes, { flag: "wx", mode: 0o644 });
					await chmod(path.join(root, "audio", audio), 0o644);
					data.tracks.push({ ...fields.data, id, audio, seconds: parsedAudio.seconds });
					action = "add";
				}
				else {
					const parsed = change.safeParse(req.body);
					if (!parsed.success) return res.sendStatus(400);
					const edit = parsed.data;
					const index = data.tracks.findIndex(item => item.id === edit.id);
					if (index < 0) return res.sendStatus(404);
					id = edit.id;
					action = edit.action;
					if (edit.action === "move") {
						data.tracks[index]!.section = edit.section;
					}
					else if (edit.action === "visibility") {
						data.tracks[index]!.hidden = edit.hidden;
					}
					else if (edit.action === "reorder") {
						const source = data.tracks[index]!;
						const target = data.tracks.find(item => item.id === edit.targetId);
						if (!target || target === source || target.section !== source.section) return res.sendStatus(409);
						data.tracks.splice(index, 1);
						data.tracks.splice(data.tracks.indexOf(target) + Number(edit.placement === "after"), 0, source);
					}
					else {
						data.tracks.splice(index, 1);
					}
				}
				const tmp = `${state}.${randomUUID()}`;
				try {
					await writeFile(tmp, JSON.stringify(data), { flag: "wx", mode: 0o600 });
					await rename(tmp, state);
				}
				finally {
					await unlink(tmp).catch(() => undefined);
				}
				console.info(JSON.stringify({ event: "music.edit", action, id, ...res.locals.projectAdminAudit }));
				return res.sendStatus(204);
			}
			catch {
				return res.sendStatus(503);
			}
			finally {
				writing = false;
			}
		}
	);
}
