<script setup lang="ts">
import type { Gallery, GalleryItem } from "~/utils/gallery";
import { nextTick, onMounted, ref } from "vue";
import { fetchGalleryPage } from "~/utils/gallery";
import GalleryImage from "./GalleryImage.vue";

const props = defineProps<{ gallery: Gallery; adminFetch?: typeof fetch }>();
const items = ref<GalleryItem[]>([]);
const next = ref<string | null>(null);
const loading = ref(false);
const failed = ref(false);
const saving = ref(false);
const saveStatus = ref("");
const saveFailed = ref(false);
const status = ref<HTMLElement>();

async function load() {
	if (loading.value) return;
	loading.value = true;
	failed.value = false;
	try {
		const payload = await fetchGalleryPage(props.gallery, next.value);
		items.value.push(...payload.items);
		next.value = payload.next;
	} catch {
		failed.value = true;
	} finally {
		loading.value = false;
	}
}

async function reload() {
	saveFailed.value = false;
	items.value = [];
	next.value = null;
	await load();
}

async function toggleFavorite(item: GalleryItem) {
	if (saving.value || !props.adminFetch) return;
	saving.value = true;
	saveFailed.value = false;
	saveStatus.value = "";
	try {
		const response = await props.adminFetch(`/api/admin/gallery/photos/${item.id}/favorite`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ favorite: !item.favorite })
		});
		if (response.status !== 204) throw new Error();
		saveStatus.value = item.favorite ? "Removed from favorites." : "Added to favorites.";
		await reload();
		await nextTick();
		status.value?.focus();
	} catch {
		saveFailed.value = true;
	} finally {
		saving.value = false;
	}
}

onMounted(load);
</script>

<template>
	<div class="gallery" :aria-busy="loading">
		<p v-if="saveStatus" ref="status" role="status" tabindex="-1">{{ saveStatus }}</p>
		<div v-if="saveFailed" role="alert">
			Couldn’t confirm the favorite change. <button type="button" @click="reload">Reload gallery</button>
		</div>
		<ul v-if="items.length">
			<li v-for="item in items" :key="item.id">
				<GalleryImage
					:url="`/api/gallery/${gallery}/${item.id}`"
					:alt="item.description"
					:width="item.width"
					:height="item.height"
				/>
				<button
					v-if="adminFetch && gallery === 'photos'"
					type="button"
					:aria-label="`Favorite: ${item.description}`"
					:aria-pressed="Boolean(item.favorite)"
					:disabled="loading || saving || saveFailed"
					@click="toggleFavorite(item)"
				>
					{{ item.favorite ? "★ Favorited" : "☆ Favorite" }}
				</button>
			</li>
		</ul>
		<p v-if="failed" role="alert">
			Couldn’t load the {{ gallery }}. <button type="button" @click="load">Try again</button>
		</p>
		<p v-else-if="loading" role="status">Loading {{ gallery }}…</p>
		<p v-else-if="!items.length">No {{ gallery }} yet.</p>
		<button v-else-if="next" type="button" @click="load">More {{ gallery }}</button>
	</div>
</template>

<style scoped>
.gallery {
	margin-top: 1.25rem;
}
.gallery ul {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(min(16rem, 100%), 1fr));
	gap: 1rem;
}
.gallery img {
	display: block;
	width: 100%;
	height: auto;
	border-radius: 0.6rem;
}
.gallery button {
	color: var(--color-highlight);
	text-decoration: underline;
	padding: 0.5rem;
}
</style>
