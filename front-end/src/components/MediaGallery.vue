<script setup lang="ts">
import type { Gallery, GalleryItem } from "~/utils/gallery";
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { fetchGalleryPage } from "~/utils/gallery";
import { drawingOpening, galleryRowWidths } from "~/utils/galleryLayout";
import GalleryImage from "./GalleryImage.vue";

const props = defineProps<{ gallery: Gallery }>();
const items = ref<GalleryItem[]>([]);
const firstBatch = ref<GalleryItem[]>([]);
const cursor = ref<string | null>(null);
const loading = ref(true);
const failed = ref(false);
const viewer = ref<HTMLDialogElement>();
const wall = ref<HTMLElement>();
const wallWidth = ref(0);
const viewportHeight = ref(0);
const sentinel = ref<HTMLElement>();
const activeId = ref<string>();
const lifetime = new AbortController();
const seenIds = new Set<string>();
const seenCursors = new Set<string>();
let observer: IntersectionObserver | undefined;
let resizeObserver: ResizeObserver | undefined;
let pending: Promise<boolean> | undefined;
let started = false;
let trigger: HTMLElement | undefined;
let scrollLock: string | undefined;
let touchStart: { x: number; y: number } | undefined;

const hero = computed(() => firstBatch.value.find(photo => photo.favorite) ?? firstBatch.value[0]);
const side = computed(() => {
	const candidates = firstBatch.value.filter(photo => photo !== hero.value);
	return [...candidates.filter(photo => !photo.favorite), ...candidates.filter(photo => photo.favorite)].slice(0, 2);
});
const favorites = computed(() =>
	items.value.filter(photo => photo !== hero.value && photo.favorite && !side.value.includes(photo))
);
const rest = computed(() =>
	items.value.filter(photo => photo !== hero.value && !photo.favorite && !side.value.includes(photo))
);
const photos = computed(() => (hero.value ? [hero.value, ...side.value, ...favorites.value, ...rest.value] : []));
const activeIndex = computed(() => photos.value.findIndex(photo => photo.id === activeId.value));
const active = computed(() => photos.value[activeIndex.value]);
const imageLabel = computed(() => (props.gallery === "photos" ? "photo" : "drawing"));
function source(photo: GalleryItem, preview = true) {
	return `/api/gallery/${props.gallery}/${photo.id}${preview ? "?preview=1" : ""}`;
}
const gap = computed(() => (wallWidth.value <= 700 ? 8 : 12));
const targetHeight = computed(() =>
	wallWidth.value <= 700
		? Math.min(205, Math.max(100, wallWidth.value * 0.31))
		: Math.min(360, Math.max(175, wallWidth.value * 0.2))
);
const opening = computed(() =>
	props.gallery === "drawings" && hero.value && wallWidth.value
		? drawingOpening(hero.value, side.value, wallWidth.value, viewportHeight.value * 0.8, gap.value)
		: undefined
);
const favoriteWidths = computed(() =>
	galleryRowWidths(favorites.value, wallWidth.value, targetHeight.value * 1.65, gap.value)
);
const regularWidths = computed(() => galleryRowWidths(rest.value, wallWidth.value, targetHeight.value, gap.value));
const tileWidth = (width?: number) => (width === undefined ? undefined : `${width}px`);
function measureWall() {
	wallWidth.value = wall.value?.getBoundingClientRect().width ?? 0;
	viewportHeight.value = window.innerHeight;
}

async function appendBatch() {
	loading.value = true;
	failed.value = false;
	try {
		const result = await fetchGalleryPage(props.gallery, cursor.value, lifetime.signal);
		if (lifetime.signal.aborted) return false;
		if (result.next && seenCursors.has(result.next)) throw new Error("Repeated gallery cursor");
		const fresh = result.items.filter(item => {
			if (seenIds.has(item.id)) return false;
			seenIds.add(item.id);
			return true;
		});
		if (!started) {
			firstBatch.value = fresh;
			started = true;
		}
		items.value.push(...fresh);
		cursor.value = result.next;
		if (result.next) seenCursors.add(result.next);
		return true;
	} catch {
		if (!lifetime.signal.aborted) failed.value = true;
		return false;
	} finally {
		loading.value = false;
	}
}
async function loadNext() {
	if (pending) return pending;
	if (started && !cursor.value) return false;
	pending = appendBatch();
	try {
		return await pending;
	} finally {
		pending = undefined;
	}
}

async function open(photo: GalleryItem, event: MouseEvent) {
	trigger = event.currentTarget as HTMLElement;
	activeId.value = photo.id;
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
	activeId.value = undefined;
	trigger?.focus({ preventScroll: true });
	trigger = undefined;
}
async function move(offset: number) {
	const original = activeId.value;
	if (offset === 1 && activeIndex.value === photos.value.length - 1 && cursor.value) {
		if (!(await loadNext()) || activeId.value !== original) return;
	}
	const count = photos.value.length;
	if (count > 1) activeId.value = photos.value[(activeIndex.value + offset + count) % count]?.id;
}
function onKey(event: KeyboardEvent) {
	if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
	event.preventDefault();
	void move(event.key === "ArrowLeft" ? -1 : 1);
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
			void move(horizontal < 0 ? 1 : -1);
	}
	touchStart = undefined;
}

watch(
	sentinel,
	(element, previous) => {
		if (previous) observer?.unobserve(previous);
		if (element) observer?.observe(element);
	},
	{ flush: "post" }
);

onMounted(() => {
	measureWall();
	window.addEventListener("resize", measureWall);
	if (wall.value && typeof ResizeObserver !== "undefined") {
		resizeObserver = new ResizeObserver(measureWall);
		resizeObserver.observe(wall.value);
	}
	if (typeof IntersectionObserver !== "undefined") {
		observer = new IntersectionObserver(
			entries => {
				if (entries.some(entry => entry.isIntersecting && entry.target === sentinel.value)) void loadNext();
			},
			{ rootMargin: "450px 0px" }
		);
	}
	void loadNext();
});
onBeforeUnmount(() => {
	window.removeEventListener("resize", measureWall);
	resizeObserver?.disconnect();
	observer?.disconnect();
	lifetime.abort();
	unlockScroll();
});
</script>

<template>
	<section
		ref="wall"
		class="photo-gallery"
		:class="{ artwork: gallery === 'drawings' }"
		:style="{ '--gallery-gap': `${gap}px` }"
		:aria-label="gallery === 'photos' ? 'Photos' : 'Drawings'"
	>
		<div v-if="hero" class="opening-grid" :class="{ 'hero-only': !side.length, stacked: opening?.stacked }">
			<button
				class="photo-tile lead"
				:style="{ width: tileWidth(opening?.widths[0]) }"
				type="button"
				:aria-label="`Enlarge: ${hero.description}`"
				@click="open(hero, $event)"
			>
				<GalleryImage :url="source(hero)" :alt="hero.description" :width="hero.width" :height="hero.height" />
			</button>
			<div v-if="side.length" class="side-photos">
				<button
					v-for="(photo, index) in side"
					:key="photo.id"
					class="photo-tile"
					:style="{ width: tileWidth(opening?.widths[index + 1]) }"
					type="button"
					:aria-label="`Enlarge: ${photo.description}`"
					@click="open(photo, $event)"
				>
					<GalleryImage
						:url="source(photo)"
						:alt="photo.description"
						:width="photo.width"
						:height="photo.height"
					/>
				</button>
			</div>
		</div>
		<ul v-if="favorites.length" aria-label="Favorites" class="photo-grid favorites">
			<li
				v-for="(photo, index) in favorites"
				:key="photo.id"
				:style="{ width: tileWidth(favoriteWidths[index]) }"
			>
				<button
					class="photo-tile"
					type="button"
					:aria-label="`Enlarge: ${photo.description}`"
					@click="open(photo, $event)"
				>
					<GalleryImage
						:url="source(photo)"
						:alt="photo.description"
						:width="photo.width"
						:height="photo.height"
					/>
				</button>
			</li>
		</ul>
		<ul v-if="rest.length" :aria-label="`More ${gallery}`" class="photo-grid">
			<li v-for="(photo, index) in rest" :key="photo.id" :style="{ width: tileWidth(regularWidths[index]) }">
				<button
					class="photo-tile"
					type="button"
					:aria-label="`Enlarge: ${photo.description}`"
					@click="open(photo, $event)"
				>
					<GalleryImage
						:url="source(photo)"
						:alt="photo.description"
						:width="photo.width"
						:height="photo.height"
					/>
				</button>
			</li>
		</ul>
		<div v-if="failed" class="gallery-message" role="alert">
			Couldn’t load {{ gallery }}.
			<button class="section-link" type="button" @click="loadNext">Reload gallery</button>
		</div>
		<p v-else-if="loading" :class="items.length ? 'visually-hidden' : 'gallery-message'" role="status">
			Loading {{ gallery }}…
		</p>
		<p v-else-if="!items.length" class="gallery-message">No {{ gallery }} yet.</p>
		<div v-if="cursor && !failed && !loading" ref="sentinel" class="gallery-sentinel" aria-hidden="true" />

		<dialog
			ref="viewer"
			class="photo-viewer"
			:aria-label="`${gallery === 'photos' ? 'Photo' : 'Drawing'} viewer`"
			@close="onClose"
			@keydown="onKey"
		>
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
					<GalleryImage
						:key="active.id"
						:url="source(active, false)"
						:alt="active.description"
						:width="active.width"
						:height="active.height"
						immediate
					/>
				</div>
				<div v-if="photos.length > 1" class="viewer-navigation">
					<button type="button" @click="move(-1)">Previous {{ imageLabel }}</button>
					<button type="button" @click="move(1)">Next {{ imageLabel }}</button>
				</div>
			</div>
		</dialog>
	</section>
</template>

<style scoped>
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
	display: flex;
	flex-wrap: wrap;
	align-items: flex-start;
	gap: var(--gallery-gap);
	margin-top: var(--gallery-gap);
}

.photo-grid > li {
	flex: none;
	max-width: 100%;
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

.photo-grid .photo-tile,
.photo-grid .photo-tile img,
.artwork .photo-tile,
.artwork .photo-tile img {
	height: auto;
}

.photo-grid .photo-tile img,
.artwork .photo-tile img {
	object-fit: contain;
}

.gallery-sentinel {
	height: 1px;
}

.photo-tile:focus-visible {
	outline-offset: -4px;
}

.gallery-message {
	padding: 1rem 0;
}

.viewer-toolbar,
.viewer-navigation {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 0.75rem;
	flex-wrap: wrap;
}

.photo-viewer button {
	padding: 0.55rem 0.85rem;
	min-height: 44px;
	border-radius: 6px;
	border: 1px solid currentColor;
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
	.opening-grid {
		grid-template-columns: minmax(0, 1fr);
		height: auto;
	}

	.lead {
		height: clamp(320px, 65svh, 740px);
	}

	.side-photos {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}

	.side-photos {
		height: max(150px, 32vw);
	}

	.side-photos > :only-child {
		grid-column: 1 / -1;
	}
}

.artwork .opening-grid {
	display: flex;
	flex-wrap: wrap;
	justify-content: center;
	align-items: flex-start;
	height: auto;
}

.artwork .side-photos {
	display: contents;
}

.artwork .stacked .side-photos {
	display: flex;
	flex-direction: column;
	height: auto;
}

.artwork .photo-tile {
	background: transparent;
	border-radius: 0;
}
</style>
