<script setup lang="ts">
import type { Gallery, GalleryItem } from "~/utils/gallery";
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from "vue";
import { useGalleryReorder } from "~/composables/useGalleryReorder";
import { fetchGalleryPage } from "~/utils/gallery";
import GalleryIcon from "./GalleryIcon.vue";
import GalleryImage from "./GalleryImage.vue";

const props = defineProps<{ gallery: Gallery; adminFetch: typeof fetch }>();
const items = ref<GalleryItem[]>([]);
const next = ref<string | null>(null);
const hidden = ref(false);
const loading = ref(false);
const failed = ref(false);
const saving = ref(false);
const saveFailed = ref(false);
const status = ref<HTMLElement>();
const notice = ref("");
const noticeId = ref("");
const sentinel = ref<HTMLElement>();
const instructions = useId();
const renameId = ref("");
const draft = ref("");
const nameError = ref("");
const list = ref<HTMLUListElement>();
const confirming = ref("");
const preview = ref<{ id: string; url: string }>();
const lifetime = new AbortController();
const busy = computed(() => (loading.value && !items.value.length) || saving.value || saveFailed.value || failed.value);

let pending: Promise<void> | undefined;
let observer: IntersectionObserver | undefined;
let lastHiddenPage = 0;

function load(reset = false, keepSlot = false): Promise<void> {
	if (pending) return pending;
	loading.value = true;
	failed.value = false;
	saveFailed.value = false;
	pending = readPages(reset, keepSlot).finally(() => {
		loading.value = false;
		pending = undefined;
	});
	return pending;
}
let retryReset = false;
async function readPages(reset: boolean, keepSlot: boolean) {
	retryReset = reset;
	const count = reset ? items.value.length : 0;
	try {
		const result = reset ? [] : [...items.value];
		let cursor = reset ? null : next.value;
		do {
			if (hidden.value) {
				const delay = lastHiddenPage + 550 - Date.now();
				if (cursor && delay > 0) await new Promise(resolve => setTimeout(resolve, delay));
				lastHiddenPage = Date.now();
			}
			if (lifetime.signal.aborted) return;
			const page = await fetchGalleryPage(
				props.gallery,
				cursor,
				lifetime.signal,
				hidden.value ? props.adminFetch : undefined
			);
			const seen = new Set(result.map(item => item.id));
			for (const item of page.items) {
				if (seen.has(item.id)) throw new Error();
				seen.add(item.id);
			}
			if (page.next && (!page.items.length || !seen.has(page.next))) throw new Error();
			result.push(...page.items);
			cursor = page.next;
		} while (cursor && result.length < count);
		if (lifetime.signal.aborted) return;
		const left = window.scrollX;
		const top = window.scrollY;
		items.value = result;
		next.value = cursor;
		if (keepSlot) {
			await nextTick();
			if (window.scrollY !== top || window.scrollX !== left) window.scrollTo({ left, top, behavior: "instant" });
		}
	} catch {
		if (!lifetime.signal.aborted) failed.value = true;
	}
}
function append() {
	if (next.value && !loading.value && !saving.value && !failed.value && !saveFailed.value) void load();
}
function checkNear() {
	const element = sentinel.value;
	if (!element?.getClientRects().length) return;
	const box = element.getBoundingClientRect();
	if (box.top <= window.innerHeight + 300 && box.bottom >= -300) append();
}
watch(
	sentinel,
	element => {
		observer?.disconnect();
		if (element) {
			if (observer) observer.observe(element);
			else checkNear();
		}
	},
	{ flush: "post" }
);

const { picked, spot, ghost, reset, choose, down, move, up, cancelPointer, key } = useGalleryReorder(
	list,
	items,
	() => busy.value || hidden.value,
	(item, destination) => {
		void edit(item, "move", destination);
	},
	item => Boolean(item.favorite)
);
function select(archive: boolean) {
	if (saving.value || loading.value || hidden.value === archive) return;
	reset();
	hidden.value = archive;
	confirming.value = "";
	renameId.value = "";
	notice.value = "";
	preview.value = undefined;
	items.value = [];
	next.value = null;
	void load(true);
}
function control(id: string, selector: string) {
	return list.value?.querySelector<HTMLElement>(`[data-item="${id}"] ${selector}`);
}
async function edit(item: GalleryItem, action: string, payload: object) {
	if (busy.value) return false;
	saving.value = true;
	notice.value = "";
	const index = items.value.findIndex(image => image.id === item.id);
	const anchor = document.activeElement;
	const ownedFocus = Boolean(list.value?.contains(anchor));
	try {
		if (pending) await pending;
		if (failed.value || lifetime.signal.aborted) return false;
		noticeId.value = item.id;
		const response = await props.adminFetch(`/api/admin/gallery/${props.gallery}/${item.id}/${action}`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload)
		});
		if (response.status === 429) {
			notice.value = "Too many changes. Wait a moment and try again.";
			return false;
		}
		if (response.status !== 204 && response.status !== 409) throw new Error();
		confirming.value = "";
		if (action === "rename" && response.status === 204 && "description" in payload) {
			item.description = String(payload.description);
		} else {
			preview.value = undefined;
			await load(true, action === "favorite");
		}
		saving.value = false;
		await nextTick();
		if (response.status === 409) notice.value = "Order changed. Choose the position again.";
		if (
			action !== "rename" &&
			ownedFocus &&
			(document.activeElement === anchor || document.activeElement === document.body)
		) {
			const nearby = action === "move" ? item : items.value[Math.min(index, items.value.length - 1)];
			const button = nearby && control(nearby.id, action === "move" ? ".reorder" : ".star");
			(button || status.value)?.focus({ preventScroll: true });
		}
		return response.status === 204;
	} catch {
		if (!lifetime.signal.aborted) saveFailed.value = true;
		return false;
	} finally {
		saving.value = false;
	}
}

async function beginName(item: GalleryItem) {
	if (busy.value) return;
	reset();
	renameId.value = item.id;
	draft.value = item.description;
	nameError.value = "";
	await nextTick();
	const input = control(item.id, "input") as HTMLInputElement | undefined;
	input?.focus({ preventScroll: true });
	input?.select();
}
function closeName(item: GalleryItem, focus: boolean) {
	renameId.value = "";
	nameError.value = "";
	if (focus) void nextTick(() => control(item.id, ".name")?.focus({ preventScroll: true }));
}
async function finishName(item: GalleryItem, focus: boolean) {
	if (renameId.value !== item.id || saving.value) return;
	const description = draft.value.trim();
	if (
		!description ||
		description.length > 200 ||
		Array.from(description).some(char => char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127)
	) {
		nameError.value = "Enter a name of 1 to 200 characters.";
		return;
	}
	if (description === item.description || (await edit(item, "rename", { description }))) closeName(item, focus);
}

async function showPreview(item: GalleryItem) {
	if (busy.value) return;
	saving.value = true;
	try {
		const response = await props.adminFetch(`/api/admin/gallery/${props.gallery}/hidden/${item.id}`);
		if (!response.ok) throw new Error();
		const blob = await response.blob();
		const url = await new Promise<string>((resolve, reject) => {
			const reader = new FileReader();
			reader.onerror = () => reject(new Error("Image read failed"));
			reader.onload = () => resolve(String(reader.result));
			reader.readAsDataURL(blob);
		});
		if (!lifetime.signal.aborted) preview.value = { id: item.id, url };
	} catch {
		noticeId.value = item.id;
		notice.value = "Couldn’t load the preview.";
	} finally {
		saving.value = false;
	}
}

async function confirmDelete(id: string, event: MouseEvent) {
	const card = (event.currentTarget as HTMLElement).closest("li");
	confirming.value = id;
	await nextTick();
	card?.querySelector<HTMLButtonElement>(id ? "[data-cancel]" : "[data-delete]")?.focus({ preventScroll: true });
}
onMounted(() => {
	if (typeof IntersectionObserver !== "undefined") {
		observer = new IntersectionObserver(
			entries => {
				if (entries.some(entry => entry.isIntersecting && entry.target === sentinel.value)) append();
			},
			{ rootMargin: "300px 0px" }
		);
	} else {
		window.addEventListener("scroll", checkNear, { passive: true });
		window.addEventListener("resize", checkNear);
	}
	void load();
});
onBeforeUnmount(() => {
	observer?.disconnect();
	window.removeEventListener("scroll", checkNear);
	window.removeEventListener("resize", checkNear);
	lifetime.abort();
});
</script>

<template>
	<section class="gallery" aria-label="Gallery selection" @keydown.esc="reset">
		<div ref="status" tabindex="-1" class="filters" role="group" aria-label="Gallery visibility">
			<button type="button" :aria-pressed="!hidden" :disabled="loading || saving" @click="select(false)">
				Visible
			</button>
			<button type="button" :aria-pressed="hidden" :disabled="loading || saving" @click="select(true)">
				Hidden
			</button>
		</div>
		<p :id="instructions" class="sr-only">
			Drag within favorites or other images. Or select an image, then select its new position. Escape cancels.
		</p>
		<ul v-if="items.length" ref="list">
			<li
				v-for="item in items"
				:key="item.id"
				:data-item="item.id"
				:data-drop="spot?.targetId === item.id ? spot.placement : undefined"
			>
				<button
					v-if="!hidden"
					type="button"
					class="reorder"
					:aria-label="`Reorder: ${item.description}`"
					:aria-pressed="picked === item.id"
					:aria-describedby="instructions"
					:disabled="saving || failed || saveFailed"
					@dragstart.prevent
					@pointerdown="down($event, item)"
					@pointermove="move"
					@pointerup="up"
					@pointercancel="cancelPointer"
					@lostpointercapture="cancelPointer"
					@click="choose(item, $event)"
					@keydown="key($event, item)"
				>
					<span
						class="thumb"
						:class="{ ghost: ghost && picked === item.id }"
						:style="
							ghost && picked === item.id ? { left: `${ghost.left}px`, top: `${ghost.top}px` } : undefined
						"
					>
						<GalleryImage
							:url="`/api/gallery/${gallery}/${item.id}?preview=1`"
							alt=""
							:width="item.width"
							:height="item.height"
						/>
					</span>
					<span class="grip" aria-hidden="true"><GalleryIcon name="grip" /></span>
				</button>
				<img
					v-else-if="preview?.id === item.id"
					class="private-image"
					:src="preview.url"
					:alt="item.description"
				/>
				<button
					v-else
					type="button"
					class="private-image"
					:disabled="busy"
					:aria-label="`Preview: ${item.description}`"
					@click="showPreview(item)"
				>
					Preview
				</button>
				<template v-if="renameId === item.id">
					<input
						v-model="draft"
						:aria-label="`Name: ${item.description}`"
						maxlength="200"
						:readonly="saving"
						@keydown.enter.prevent="finishName(item, true)"
						@keydown.esc.stop.prevent="closeName(item, true)"
						@blur="finishName(item, false)"
					/>
					<p v-if="nameError" role="alert">{{ nameError }}</p>
				</template>
				<button
					v-else
					type="button"
					class="name"
					:aria-label="`Rename: ${item.description}`"
					:disabled="busy"
					@click="beginName(item)"
				>
					{{ item.description }}
				</button>
				<div class="actions">
					<button
						type="button"
						class="star"
						:aria-label="`Favorite: ${item.description}`"
						:aria-pressed="Boolean(item.favorite)"
						:title="item.favorite ? 'Remove from favorites' : 'Add to favorites'"
						:disabled="busy"
						@click="edit(item, 'favorite', { favorite: !item.favorite })"
					>
						<GalleryIcon name="star" :filled="Boolean(item.favorite)" />
					</button>
					<button
						type="button"
						:aria-label="`${hidden ? 'Show' : 'Hide'}: ${item.description}`"
						:title="hidden ? 'Show in gallery' : 'Hide from gallery'"
						:disabled="busy"
						@click="edit(item, 'visibility', { visible: hidden })"
					>
						<GalleryIcon :name="hidden ? 'eye-off' : 'eye'" />
					</button>
					<button
						type="button"
						data-delete
						:aria-label="`Delete: ${item.description}`"
						title="Delete image"
						:disabled="busy"
						@click="confirmDelete(item.id, $event)"
					>
						<GalleryIcon name="trash" />
					</button>
				</div>
				<div
					v-if="confirming === item.id"
					class="confirmation"
					role="group"
					:aria-label="`Confirm deletion: ${item.description}`"
				>
					<p>Permanently delete “{{ item.description }}”?</p>
					<button type="button" data-cancel :disabled="busy" @click="confirmDelete('', $event)">
						Cancel
					</button>
					<button type="button" :disabled="busy" @click="edit(item, 'delete', { confirm: item.id })">
						Delete permanently
					</button>
				</div>
				<div v-if="saveFailed && noticeId === item.id" role="alert">
					Couldn’t confirm the change. <button type="button" @click="load(true)">Reload gallery</button>
				</div>
				<p v-if="notice && noticeId === item.id" role="alert">{{ notice }}</p>
			</li>
		</ul>
		<p v-if="loading && !items.length" role="status">Loading {{ gallery }}…</p>
		<p v-else-if="!failed && !items.length">No {{ hidden ? "hidden " : "" }}{{ gallery }} yet.</p>
		<div v-if="failed" role="alert">
			Couldn’t load the gallery. <button type="button" @click="load(retryReset)">Reload gallery</button>
		</div>
		<div v-if="next && !busy && !loading" ref="sentinel" class="sentinel" aria-hidden="true"></div>
	</section>
</template>

<style scoped>
.gallery {
	margin-top: 1.25rem;
	overflow-anchor: none;
}
.filters,
.actions {
	display: flex;
	align-items: center;
	flex-wrap: wrap;
	gap: 0.25rem;
}
.filters {
	margin-bottom: 1rem;
}
.filters [aria-pressed="true"] {
	font-weight: 700;
	text-decoration: underline;
}
.gallery ul {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(min(15rem, 100%), 1fr));
	gap: 1.25rem;
}
.gallery li {
	min-width: 0;
	position: relative;
}
.gallery button {
	color: var(--color-highlight);
	cursor: pointer;
	min-height: 44px;
	padding: 0.45rem;
}
.gallery :is(button, input):focus-visible {
	outline: 2px solid currentColor;
	outline-offset: 2px;
}
.gallery button:disabled {
	cursor: default;
}
.gallery .reorder,
.private-image {
	position: relative;
	display: block;
	padding: 0;
	width: 100%;
	height: 10rem;
	object-fit: contain;
}
.gallery .reorder {
	touch-action: pan-y;
	cursor: grab;
	user-select: none;
}
.reorder[aria-pressed="true"] {
	outline: 2px solid var(--color-highlight);
}
.thumb {
	display: block;
	width: 100%;
	height: 100%;
	pointer-events: none;
}
.thumb img {
	display: block;
	width: 100%;
	height: 100%;
	object-fit: contain;
}
.thumb.ghost {
	position: fixed;
	z-index: 100;
	width: 8rem;
	height: 6rem;
	transform: translate(-50%, -70%);
	opacity: 0.9;
}
.grip {
	position: absolute;
	right: 0.2rem;
	bottom: 0.2rem;
	display: grid;
	place-items: center;
	width: 44px;
	height: 44px;
	background: var(--color-surface);
	color: var(--color-highlight);
	border-radius: 0.4rem;
	touch-action: none;
}
[data-drop]::before {
	content: "";
	position: absolute;
	z-index: 1;
	inset-block: 0;
	width: 4px;
	background: var(--color-highlight);
	pointer-events: none;
}
[data-drop="before"]::before {
	left: -0.7rem;
}
[data-drop="after"]::before {
	right: -0.7rem;
}
@media (max-width: 550px) {
	[data-drop]::before {
		inset-inline: 0;
		inset-block: auto;
		width: auto;
		height: 4px;
	}
	[data-drop="before"]::before {
		top: -0.7rem;
	}
	[data-drop="after"]::before {
		bottom: -0.7rem;
	}
}
.gallery .name,
.gallery input {
	display: block;
	width: 100%;
	text-align: left;
	overflow-wrap: anywhere;
	font: inherit;
	font-weight: 650;
	border-radius: 0.25rem;
}
.gallery input {
	min-height: 44px;
	padding: 0.4rem;
	color: inherit;
	background: var(--color-surface);
	border: 1px solid currentColor;
}
.name:hover {
	text-decoration: underline;
}
.actions button {
	display: grid;
	place-items: center;
	min-width: 44px;
	border-radius: 0.4rem;
}
.actions button:hover {
	background: var(--color-surface);
}
.confirmation {
	padding: 0.5rem;
	border-inline-start: 2px solid currentColor;
}
.sentinel {
	height: 1px;
}
</style>
