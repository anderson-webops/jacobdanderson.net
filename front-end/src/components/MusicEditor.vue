<script setup lang="ts">
import type { MusicTrack } from "~/utils/music";
import { musicSections, readMusicCatalog } from "~/utils/music";

const props = defineProps<{ adminFetch: typeof fetch }>();
const tracks = ref<(MusicTrack & { hidden?: boolean })[]>([]);
const busy = ref(false);
const error = ref("");
const file = ref<HTMLInputElement>();
const removal = ref("");
const title = ref("");
const section = ref("in-progress");
async function reload() {
	const res = await props.adminFetch("/api/admin/music");
	if (!res.ok) throw new Error();
	tracks.value = readMusicCatalog(await res.json());
}
onMounted(() =>
	reload().catch(() => {
		error.value = "Couldn’t load the music library.";
	})
);
async function save(body: BodyInit, type: string, query = "") {
	if (busy.value) return;
	busy.value = true;
	error.value = "";
	try {
		const res = await props.adminFetch(`/api/admin/music${query}`, {
			method: "POST",
			headers: { "Content-Type": type },
			body
		});
		if (!res.ok) throw new Error();
		await reload();
		if (query && file.value) {
			file.value.value = "";
			title.value = "";
		}
	} catch {
		error.value = "Couldn’t save the change. Refresh and try again.";
	} finally {
		busy.value = false;
	}
}
function edit(action: string, id: string, value = {}) {
	removal.value = "";
	void save(JSON.stringify({ action, id, ...value }), "application/json");
}
async function upload() {
	const song = file.value?.files?.[0];
	if (!song) return;
	if (song.size > 48 * 1024 * 1024) {
		error.value = "Choose an MP3 under 48 MB.";
		return;
	}
	await save(
		song,
		"audio/mpeg",
		`?${new URLSearchParams({
			title: title.value.trim() || song.name.replace(/\.mp3$/i, ""),
			section: section.value
		})}`
	);
}
</script>

<template>
	<div>
		<form @submit.prevent="upload">
			<label>MP3 <input ref="file" type="file" accept=".mp3,audio/mpeg" required /></label>
			<label>Title <input v-model="title" maxlength="180" /></label>
			<label
				>Section
				<select v-model="section">
					<option v-for="group in musicSections" :key="group.id" :value="group.id">{{ group.label }}</option>
				</select></label
			>
			<button :disabled="busy">Add song</button>
		</form>
		<p v-if="error" role="alert">{{ error }}</p>
		<section v-for="group in musicSections" :key="group.id">
			<h2>{{ group.label }}</h2>
			<div v-for="song in tracks.filter(item => item.section === group.id)" :key="song.id" class="song">
				<strong>{{ song.title }}</strong>
				<select
					:aria-label="`Section for ${song.title}`"
					:value="song.section"
					:disabled="busy"
					@change="edit('move', song.id, { section: ($event.target as HTMLSelectElement).value })"
				>
					<option v-for="destination in musicSections" :key="destination.id" :value="destination.id">
						{{ destination.label }}
					</option>
				</select>
				<button
					:disabled="busy"
					:aria-label="(song.hidden ? 'Show ' : 'Hide ') + song.title"
					@click="edit('visibility', song.id, { hidden: !song.hidden })"
				>
					<GalleryIcon :name="song.hidden ? 'eye-off' : 'eye'" />
				</button>
				<button :disabled="busy" :aria-label="`Remove ${song.title}`" @click="removal = song.id">
					<GalleryIcon name="trash" />
				</button>
				<div v-if="removal === song.id">
					Remove “{{ song.title }}”? <button :disabled="busy" @click="edit('remove', song.id)">Remove</button>
					<button @click="removal = ''">Cancel</button>
				</div>
			</div>
		</section>
	</div>
</template>

<style scoped>
form,
.song {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 0.75rem;
	padding: 0.65rem 0;
}
strong {
	flex: 1 1 12rem;
}
section {
	margin-top: 2rem;
}
button,
select {
	min-height: 44px;
	padding: 0.4rem;
}
</style>
