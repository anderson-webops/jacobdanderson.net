export const musicSections = [
	{ id: "finished", label: "Finished" },
	{ id: "in-progress", label: "In Progress" },
	{ id: "older", label: "Older" }
] as const;

export interface MusicTrack {
	id: string;
	title: string;
	section: (typeof musicSections)[number]["id"];
	seconds: number;
	audio?: string;
	soundcloudId?: number;
	permalink?: string;
}

export const soundcloudProfile = "https://soundcloud.com/jacoba1100254352";

export function readMusicCatalog(value: unknown): MusicTrack[] {
	if (
		!value ||
		typeof value !== "object" ||
		!("version" in value) ||
		value.version !== 1 ||
		!("tracks" in value) ||
		!Array.isArray(value.tracks) ||
		value.tracks.length > 1000
	) {
		throw new Error("Invalid music catalog");
	}
	const ids = new Set<string>();
	return value.tracks.map((track: unknown) => {
		if (!track || typeof track !== "object") throw new Error("Invalid track");
		const item = track as MusicTrack;
		if (
			typeof item.id !== "string" ||
			!/^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(item.id) ||
			ids.has(item.id) ||
			typeof item.title !== "string" ||
			!item.title.trim() ||
			item.title.length > 180 ||
			!musicSections.some(section => section.id === item.section) ||
			!Number.isSafeInteger(item.seconds) ||
			item.seconds <= 0 ||
			(item.audio !== undefined &&
				(typeof item.audio !== "string" ||
					!/^[a-z0-9]+(?:-[a-z0-9]+)*-[a-f0-9]{12}\.mp3$/u.test(item.audio))) ||
			(item.soundcloudId !== undefined || item.permalink !== undefined
				? !Number.isSafeInteger(item.soundcloudId) ||
					Number(item.soundcloudId) <= 0 ||
					typeof item.permalink !== "string" ||
					!/^https:\/\/soundcloud\.com\/jacoba1100254352\/[a-z0-9_-]+$/u.test(item.permalink)
				: !item.audio || item.soundcloudId !== undefined || item.permalink !== undefined)
		) {
			throw new Error("Invalid track");
		}
		ids.add(item.id);
		return item;
	});
}

export async function loadMusicCatalog(fallback: MusicTrack[], signal: AbortSignal) {
	try {
		const response = await fetch("/music-library/catalog.json", { signal, credentials: "omit" });
		if (response.ok) return readMusicCatalog(await response.json());
	} catch {
		return fallback;
	}
	return fallback;
}

export function musicTime(seconds: number) {
	return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

export function widgetUrl(id: number) {
	const url = new URL("https://w.soundcloud.com/player/");
	url.search = new URLSearchParams({
		url: `https://api.soundcloud.com/tracks/${id}`,
		color: "#775038",
		auto_play: "true",
		show_artwork: "false",
		show_comments: "false",
		show_reposts: "false",
		show_user: "false"
	}).toString();
	return url.href;
}
