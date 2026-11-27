import { flushPromises, mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import MusicEditor from "../src/components/MusicEditor.vue";
import MusicRoom from "../src/components/MusicRoom.vue";
import catalog from "../src/data/music.json";
import { loadMusicCatalog, musicTime, readMusicCatalog, widgetUrl } from "../src/utils/music";

const tracks = readMusicCatalog(catalog);
const local = tracks.find(track => track.section === "in-progress")!;
const published = tracks.find(track => track.soundcloudId && track.audio)!;

afterEach(() => {
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
});

describe("music library", () => {
	it("keeps the published order and the three distinct recording sources", () => {
		expect(new Set(tracks.map(track => track.section))).toEqual(new Set(["finished", "in-progress", "older"]));
		expect(tracks.filter(track => track.section === "finished")).toHaveLength(12);
		expect(tracks.find(track => track.title === "Project 441 2.5 Unfinished")?.section).toBe("finished");
		expect(tracks.find(track => track.title === "Void")?.section).toBe("in-progress");
		expect(tracks.find(track => track.title === "The Train Station")?.section).toBe("older");
		expect(musicTime(65)).toBe("1:05");
		const src = new URL(widgetUrl(published.soundcloudId!));
		expect(src.origin).toBe("https://w.soundcloud.com");
		expect(src.searchParams.get("url")).toBe(`https://api.soundcloud.com/tracks/${published.soundcloudId}`);
	});
	it.each([
		[local, local],
		[{ ...local, audio: "../file.mp3" }],
		[{ ...local, section: "unlisted" }],
		[{ ...local, audio: undefined }],
		[{ ...published, soundcloudId: 0 }],
		[{ ...published, permalink: "https://soundcloud.com/another-artist/song" }],
		[{ ...local, audio: "https://example.com/file-ab1234567890.mp3" }]
	])("rejects malformed catalog entries", (...invalid) => {
		expect(() => readMusicCatalog({ version: 1, tracks: invalid })).toThrow();
	});
	it("can update the library without a release and keeps the reviewed fallback on error", async () => {
		const fetch = vi
			.fn()
			.mockResolvedValueOnce({ ok: true, json: async () => ({ version: 1, tracks: [local] }) })
			.mockResolvedValueOnce({ ok: true, json: async () => ({ tracks: [] }) })
			.mockRejectedValueOnce(new Error("offline"));
		vi.stubGlobal("fetch", fetch);
		const signal = new AbortController().signal;
		expect(await loadMusicCatalog(tracks, signal)).toEqual([local]);
		expect(await loadMusicCatalog(tracks, signal)).toBe(tracks);
		expect(await loadMusicCatalog(tracks, signal)).toBe(tracks);
		expect(fetch).toHaveBeenCalledWith("/music-library/catalog.json", { credentials: "omit", signal });
	});
	it("edits sections and visibility, confirms removal, and submits an audio file", async () => {
		const adminFetch = vi.fn(async (_url: string, init?: RequestInit) =>
			init?.method === "POST"
				? new Response(null, { status: 204 })
				: Response.json({ version: 1, tracks: [local] })
		);
		const wrapper = mount(MusicEditor, { props: { adminFetch: adminFetch as typeof fetch } });
		await flushPromises();
		await wrapper.get(".song select").setValue("finished");
		await flushPromises();
		expect(
			adminFetch.mock.calls.some(
				([, init]) => init?.body === JSON.stringify({ action: "move", id: local.id, section: "finished" })
			)
		).toBe(true);
		await wrapper.get(".song button").trigger("click");
		await flushPromises();
		expect(
			adminFetch.mock.calls.some(
				([, init]) => init?.body === JSON.stringify({ action: "visibility", id: local.id, hidden: true })
			)
		).toBe(true);
		await wrapper.findAll(".song button")[1]!.trigger("click");
		expect(wrapper.text()).toContain("Cancel");
		await wrapper.findAll(".song button")[2]!.trigger("click");
		await flushPromises();
		expect(
			adminFetch.mock.calls.some(([, init]) => init?.body === JSON.stringify({ action: "remove", id: local.id }))
		).toBe(true);
		const song = new File(["sample"], "New Song.mp3", { type: "audio/mpeg" });
		Object.defineProperty(wrapper.get("input[type=file]").element, "files", { value: [song] });
		await wrapper.get("form").trigger("submit");
		await flushPromises();
		expect(adminFetch.mock.calls.some(([url, init]) => url.includes("title=New+Song") && init?.body === song)).toBe(
			true
		);
		wrapper.unmount();
	});
	it("opens a single player on request and retains a fallback for the published performance", async () => {
		vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => catalog }));
		vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
		vi.spyOn(HTMLMediaElement.prototype, "load").mockImplementation(() => {});
		const wrapper = mount(MusicRoom);
		await flushPromises();
		expect(wrapper.findAll("h2").map(heading => heading.text())).toEqual(["Finished", "In Progress", "Older"]);
		expect(wrapper.find("audio, iframe").exists()).toBe(false);
		await wrapper.get(`button[aria-label="Play ${published.title}"]`).trigger("click");
		expect(wrapper.get("iframe").attributes("src")).toBe(widgetUrl(published.soundcloudId!));
		expect(wrapper.get(".sources a").attributes("href")).toBe(published.permalink);
		await wrapper.get(".sources button").trigger("click");
		expect(wrapper.get("audio").attributes("src")).toBe(`/music-library/audio/${published.audio}`);
		expect(wrapper.find("iframe").exists()).toBe(false);
		await wrapper.get("audio").trigger("error");
		expect(wrapper.get("[role=alert]").text()).toMatch(/couldn’t be loaded/);
		await wrapper.get(`button[aria-label="Play ${local.title}"]`).trigger("click");
		expect(wrapper.findAll("audio, iframe")).toHaveLength(1);
		expect(wrapper.find("[role=alert]").exists()).toBe(false);
		await wrapper.get(`button[aria-label="Close player for ${local.title}"]`).trigger("click");
		expect(wrapper.find("audio, iframe").exists()).toBe(false);
		wrapper.unmount();
	});
});
