import { flushPromises, mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
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
	it("opens a single player on request and retains a fallback for the published performance", async () => {
		vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
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
