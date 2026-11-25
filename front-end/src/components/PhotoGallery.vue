<script setup lang="ts">
import type { GalleryItem } from "~/utils/gallery";
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import { fetchGalleryPage } from "~/utils/gallery";

const items = ref<GalleryItem[]>([]);
const page = ref(0);
const cursors = ref<(string | null)[]>([null]);
const next = ref<string | null>(null);
const loading = ref(true);
const failed = ref(false);
const retryPage = ref(0);
const gallery = ref<HTMLElement>();
const viewer = ref<HTMLDialogElement>();
const activeIndex = ref(-1);
let trigger: HTMLElement | undefined;
let scrollLock: string | undefined;
let touchStart: { x: number; y: number } | undefined;

const hero = computed(() => items.value.find(photo => photo.favorite) ?? items.value[0]);
const side = computed(() => items.value.filter(photo => photo !== hero.value && !photo.favorite).slice(0, 2));
const favorites = computed(() => items.value.filter(photo => photo !== hero.value && photo.favorite));
const rest = computed(() =>
	items.value.filter(photo => photo !== hero.value && !photo.favorite && !side.value.includes(photo))
);
const photos = computed(() => (hero.value ? [hero.value, ...side.value, ...favorites.value, ...rest.value] : []));
const active = computed(() => photos.value[activeIndex.value]);
const source = (photo: GalleryItem) => `/api/gallery/photos/${photo.id}`;

async function load(target: number) {
	const before = cursors.value[target];
	if (before === undefined) return;
	loading.value = true;
	failed.value = false;
	retryPage.value = target;
	try {
		const result = await fetchGalleryPage("photos", before);
		const changed = page.value !== target;
		items.value = result.items;
		next.value = result.next;
		page.value = target;
		if (changed) {
			await nextTick();
			gallery.value?.focus({ preventScroll: true });
			gallery.value?.scrollIntoView({ block: "start" });
		}
	} catch {
		failed.value = true;
	} finally {
		loading.value = false;
	}
}
function nextPage() {
	if (!next.value || loading.value) return;
	cursors.value[page.value + 1] = next.value;
	void load(page.value + 1);
}

async function open(photo: GalleryItem, event: MouseEvent) {
	trigger = event.currentTarget as HTMLElement;
	activeIndex.value = photos.value.indexOf(photo);
	await nextTick();
	if (!viewer.value || viewer.value.open) return;
	viewer.value.showModal();
	scrollLock = document.body.style.overflow;
	document.body.style.overflow = "hidden";
}
function unlockScroll() {
	if (scrollLock === undefined) return;
	document.body.style.overflow = scrollLock;
	scrollLock = undefined;
}
function onClose() {
	unlockScroll();
	activeIndex.value = -1;
	trigger?.focus({ preventScroll: true });
	trigger = undefined;
}
function move(offset: number) {
	const count = photos.value.length;
	if (count > 1) activeIndex.value = (activeIndex.value + offset + count) % count;
}
function onKey(event: KeyboardEvent) {
	if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
	event.preventDefault();
	move(event.key === "ArrowLeft" ? -1 : 1);
}
function startSwipe(event: TouchEvent) {
	const touch = event.touches[0];
	touchStart = event.touches.length === 1 && touch ? { x: touch.clientX, y: touch.clientY } : undefined;
}
function endSwipe(event: TouchEvent) {
	const touch = event.changedTouches[0];
	if (touch && touchStart) {
		const horizontal = touch.clientX - touchStart.x;
		if (Math.abs(horizontal) > 60 && Math.abs(horizontal) > Math.abs(touch.clientY - touchStart.y))
			move(horizontal < 0 ? 1 : -1);
	}
	touchStart = undefined;
}

onMounted(() => void load(0));
onBeforeUnmount(unlockScroll);
</script>

<template>
	<section ref="gallery" class="photo-gallery" :aria-label="`Photos, page ${page + 1}`" tabindex="-1">
		<div v-if="hero" class="opening-grid" :class="{ 'hero-only': !side.length }">
			<button
				class="photo-tile lead"
				type="button"
				:aria-label="`Enlarge: ${hero.description}`"
				@click="open(hero, $event)"
			>
				<img
					:src="source(hero)"
					:alt="hero.description"
					:width="hero.width"
					:height="hero.height"
					fetchpriority="high"
				/>
			</button>
			<div v-if="side.length" class="side-photos">
				<button
					v-for="photo in side"
					:key="photo.id"
					class="photo-tile"
					type="button"
					:aria-label="`Enlarge: ${photo.description}`"
					@click="open(photo, $event)"
				>
					<img :src="source(photo)" :alt="photo.description" :width="photo.width" :height="photo.height" />
				</button>
			</div>
		</div>
		<ul v-if="favorites.length" aria-label="Favorites" class="photo-grid favorites">
			<li v-for="photo in favorites" :key="photo.id">
				<button
					class="photo-tile"
					type="button"
					:aria-label="`Enlarge: ${photo.description}`"
					@click="open(photo, $event)"
				>
					<img
						:src="source(photo)"
						:alt="photo.description"
						:width="photo.width"
						:height="photo.height"
						loading="lazy"
					/>
				</button>
			</li>
		</ul>
		<ul v-if="rest.length" aria-label="More photos" class="photo-grid">
			<li v-for="photo in rest" :key="photo.id">
				<button
					class="photo-tile"
					type="button"
					:aria-label="`Enlarge: ${photo.description}`"
					@click="open(photo, $event)"
				>
					<img
						:src="source(photo)"
						:alt="photo.description"
						:width="photo.width"
						:height="photo.height"
						loading="lazy"
					/>
				</button>
			</li>
		</ul>
		<div v-if="failed" class="gallery-message" role="alert">
			Couldn’t load photos. <button class="section-link" type="button" @click="load(retryPage)">Try again</button>
		</div>
		<p v-else-if="loading" class="gallery-message" role="status">Loading photos…</p>
		<p v-else-if="!items.length" class="gallery-message">No photos yet.</p>
		<nav v-if="page || next" class="pagination" aria-label="Photo pages">
			<button type="button" :disabled="loading || page === 0" @click="load(page - 1)">Previous</button>
			<span>Page {{ page + 1 }}</span>
			<button type="button" :disabled="loading || !next" @click="nextPage">Next</button>
		</nav>

		<dialog ref="viewer" class="photo-viewer" aria-label="Photo viewer" @close="onClose" @keydown="onKey">
			<div v-if="active" class="viewer-content">
				<div class="viewer-toolbar">
					<span aria-live="polite">{{ activeIndex + 1 }} / {{ photos.length }}</span>
					<span class="visually-hidden" aria-live="polite">{{ active.description }}</span>
					<button type="button" autofocus @click="viewer?.close()">Close</button>
				</div>
				<div
					class="viewer-image"
					@touchstart.passive="startSwipe"
					@touchend.passive="endSwipe"
					@touchcancel="touchStart = undefined"
				>
					<img
						:key="active.id"
						:src="source(active)"
						:alt="active.description"
						:width="active.width"
						:height="active.height"
					/>
				</div>
				<div v-if="photos.length > 1" class="viewer-navigation">
					<button type="button" @click="move(-1)">Previous photo</button>
					<button type="button" @click="move(1)">Next photo</button>
				</div>
			</div>
		</dialog>
	</section>
</template>

<style scoped>
.photo-gallery {
	--gallery-gap: 12px;
	--gallery-row: clamp(230px, 29vw, 520px);
	scroll-margin-top: 6rem;
}

.opening-grid {
	display: grid;
	grid-template-columns: minmax(0, 2.1fr) minmax(0, 1fr);
	gap: var(--gallery-gap);
	height: clamp(480px, 75svh, 900px);
}

.opening-grid.hero-only {
	grid-template-columns: minmax(0, 1fr);
}

.side-photos {
	display: grid;
	min-height: 0;
	grid-auto-rows: minmax(0, 1fr);
	gap: var(--gallery-gap);
}

.photo-grid {
	display: grid;
	grid-template-columns: repeat(3, minmax(0, 1fr));
	grid-auto-rows: var(--gallery-row);
	gap: var(--gallery-gap);
	margin-top: var(--gallery-gap);
}

.photo-grid.favorites {
	grid-template-columns: repeat(2, minmax(0, 1fr));
	grid-auto-rows: clamp(270px, 42vw, 710px);
}

.photo-tile {
	display: block;
	width: 100%;
	height: 100%;
	min-height: 0;
	overflow: hidden;
	border-radius: 5px;
	background: var(--color-surface-accent);
	cursor: zoom-in;
}

.photo-tile img {
	display: block;
	width: 100%;
	height: 100%;
	object-fit: cover;
}

.photo-tile:focus-visible {
	outline-offset: -4px;
}

.gallery-message {
	padding: 1rem 0;
}

.pagination,
.viewer-toolbar,
.viewer-navigation {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 0.75rem;
	flex-wrap: wrap;
}

.pagination {
	margin-top: 1rem;
}

.pagination button,
.photo-viewer button {
	padding: 0.55rem 0.85rem;
	min-height: 44px;
	border-radius: 6px;
	border: 1px solid currentColor;
}

.pagination button:disabled {
	opacity: 0.6;
}

.photo-viewer {
	width: 100%;
	max-width: none;
	height: 100dvh;
	max-height: none;
	margin: 0;
	padding: 0;
	border: 0;
	color: #f7f7f7;
	background: #101216;
}

.photo-viewer::backdrop {
	background: #101216;
}

.viewer-content {
	display: grid;
	grid-template-rows: auto minmax(0, 1fr) auto;
	height: 100%;
	gap: 0.75rem;
	padding: 1rem clamp(0.75rem, 3vw, 3rem);
}

.viewer-toolbar {
	justify-content: space-between;
}

.viewer-image {
	min-width: 0;
	min-height: 0;
	touch-action: pan-y pinch-zoom;
}

.viewer-image img {
	display: block;
	width: 100%;
	height: 100%;
	object-fit: contain;
}

@media (max-width: 760px) {
	.photo-gallery {
		--gallery-gap: 8px;
		--gallery-row: 46vw;
	}

	.opening-grid {
		grid-template-columns: minmax(0, 1fr);
		height: auto;
	}

	.lead {
		height: clamp(320px, 65svh, 740px);
	}

	.side-photos,
	.photo-grid {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}

	.side-photos {
		height: max(150px, 32vw);
	}

	.side-photos > :only-child {
		grid-column: 1 / -1;
	}

	.photo-grid.favorites {
		grid-template-columns: minmax(0, 1fr);
		grid-auto-rows: 78vw;
	}
}
</style>
