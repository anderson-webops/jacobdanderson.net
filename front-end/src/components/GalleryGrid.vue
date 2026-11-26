<script setup lang="ts">
import type { Gallery, GalleryItem } from "~/utils/gallery";
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import { fetchGalleryPage } from "~/utils/gallery";
import GalleryImage from "./GalleryImage.vue";

const props = defineProps<{ gallery: Gallery; adminFetch: typeof fetch }>();
const items = ref<GalleryItem[]>([]);
const next = ref<string | null>(null);
const hidden = ref(false);
const loading = ref(false);
const failed = ref(false);
const saving = ref(false);
const saveFailed = ref(false);
const message = ref("");
const status = ref<HTMLElement>();
const list = ref<HTMLUListElement>();
const confirming = ref("");
const preview = ref<{ id: string; url: string }>();
const lifetime = new AbortController();
const busy = computed(() => loading.value || saving.value || saveFailed.value || failed.value);

async function load(reset = false) {
	if (loading.value) return;
	loading.value = true;
	failed.value = false;
	saveFailed.value = false;
	const count = reset ? items.value.length : 0;
	try {
		const result = reset ? [] : [...items.value];
		let cursor = reset ? null : next.value;
		do {
			const page = await fetchGalleryPage(
				props.gallery,
				cursor,
				lifetime.signal,
				hidden.value ? props.adminFetch : undefined
			);
			const seen = new Set(result.map(item => item.id));
			if (page.items.some(item => seen.has(item.id)) || (page.next && !page.items.length)) throw new Error();
			result.push(...page.items);
			cursor = page.next;
			if (hidden.value && cursor && result.length < count) {
				await new Promise(resolve => setTimeout(resolve, 550));
				if (lifetime.signal.aborted) return;
			}
		} while (cursor && result.length < count);
		items.value = result;
		next.value = cursor;
	} catch {
		failed.value = true;
	} finally {
		loading.value = false;
	}
}

function select(archive: boolean) {
	if (saving.value || loading.value || hidden.value === archive) return;
	hidden.value = archive;
	confirming.value = "";
	message.value = "";
	preview.value = undefined;
	items.value = [];
	next.value = null;
	void load(true);
}

async function edit(item: GalleryItem, action: string, payload: object, success: string) {
	if (busy.value) return;
	saving.value = true;
	message.value = "";
	const oldIndex = items.value.findIndex(image => image.id === item.id);
	try {
		const response = await props.adminFetch(`/api/admin/gallery/${props.gallery}/${item.id}/${action}`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload)
		});
		if (response.status === 429) {
			message.value = "Too many changes. Wait a moment and try again.";
			return;
		}
		if (response.status !== 204 && response.status !== 409) throw new Error();
		message.value = response.status === 409 ? "Order unchanged. Check the current order." : success;
		confirming.value = "";
		preview.value = undefined;
		await load(true);
		saving.value = false;
		await nextTick();
		const nearby =
			items.value.find(image => image.id === item.id) ?? items.value[Math.min(oldIndex, items.value.length - 1)];
		const control =
			nearby &&
			list.value?.querySelector<HTMLElement>(
				`[data-item="${nearby.id}"] ${action === "favorite" ? "[aria-pressed]" : "summary"}`
			);
		(control || status.value)?.focus();
	} catch {
		saveFailed.value = true;
	} finally {
		saving.value = false;
	}
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
		message.value = "Couldn’t load the preview.";
	} finally {
		saving.value = false;
	}
}

function canMove(index: number, step: number) {
	const neighbor = items.value[index + step];
	return neighbor
		? Boolean(neighbor.favorite) === Boolean(items.value[index]?.favorite)
		: step === 1 && Boolean(next.value);
}
async function confirmDelete(id: string, event: MouseEvent) {
	const options = (event.currentTarget as HTMLElement).closest(".options");
	confirming.value = id;
	await nextTick();
	options?.querySelector<HTMLButtonElement>(id ? "[data-cancel]" : "[data-delete]")?.focus();
}
onMounted(() => load());
onBeforeUnmount(() => lifetime.abort());
</script>

<template>
	<section class="gallery" aria-label="Gallery selection" :aria-busy="loading || saving">
		<div class="filters" role="group" aria-label="Gallery visibility">
			<button type="button" :aria-pressed="!hidden" :disabled="loading || saving" @click="select(false)">
				Visible
			</button>
			<button type="button" :aria-pressed="hidden" :disabled="loading || saving" @click="select(true)">
				Hidden
			</button>
		</div>
		<p v-if="message" ref="status" role="status" tabindex="-1">{{ message }}</p>
		<div v-if="saveFailed || failed" role="alert">
			{{ saveFailed ? "Couldn’t confirm the change." : "Couldn’t load the gallery." }}
			<button type="button" @click="load(true)">Reload gallery</button>
		</div>
		<ul v-if="items.length" ref="list">
			<li v-for="(item, index) in items" :key="item.id" :data-item="item.id">
				<GalleryImage
					v-if="!hidden"
					:url="`/api/gallery/${gallery}/${item.id}?preview=1`"
					:alt="item.description"
					:width="item.width"
					:height="item.height"
				/>
				<img v-else-if="preview?.id === item.id" :src="preview.url" :alt="item.description" />
				<button
					v-else
					type="button"
					:disabled="busy"
					:aria-label="`Preview: ${item.description}`"
					@click="showPreview(item)"
				>
					Preview
				</button>
				<strong>{{ item.description }}</strong>
				<div class="actions">
					<button
						type="button"
						:aria-label="`Favorite: ${item.description}`"
						:aria-pressed="Boolean(item.favorite)"
						:disabled="busy"
						@click="
							edit(
								item,
								'favorite',
								{ favorite: !item.favorite },
								item.favorite ? 'Removed from favorites.' : 'Added to favorites.'
							)
						"
					>
						{{ item.favorite ? "★ Favorited" : "☆ Favorite" }}
					</button>
					<details>
						<summary :aria-label="`Manage: ${item.description}`">Manage</summary>
						<div class="options">
							<button
								type="button"
								:disabled="busy"
								@click="
									edit(
										item,
										'visibility',
										{ visible: hidden },
										hidden ? 'Image shown.' : 'Image hidden.'
									)
								"
							>
								{{ hidden ? "Show in gallery" : "Hide from gallery" }}
							</button>
							<template v-if="!hidden">
								<button
									type="button"
									:disabled="busy || !canMove(index, -1)"
									@click="edit(item, 'move', { direction: 'earlier' }, 'Moved earlier.')"
								>
									Move earlier
								</button>
								<button
									type="button"
									:disabled="busy || !canMove(index, 1)"
									@click="edit(item, 'move', { direction: 'later' }, 'Moved later.')"
								>
									Move later
								</button>
							</template>
							<button
								v-if="confirming !== item.id"
								type="button"
								:disabled="busy"
								data-delete
								@click="confirmDelete(item.id, $event)"
							>
								Delete…
							</button>
							<div
								v-else
								class="confirmation"
								role="group"
								:aria-label="`Confirm deletion: ${item.description}`"
							>
								<p>Permanently delete “{{ item.description }}”?</p>
								<button type="button" data-cancel :disabled="busy" @click="confirmDelete('', $event)">
									Cancel
								</button>
								<button
									type="button"
									:disabled="busy"
									@click="edit(item, 'delete', { confirm: item.id }, 'Image deleted.')"
								>
									Delete permanently
								</button>
							</div>
						</div>
					</details>
				</div>
			</li>
		</ul>
		<p v-if="loading" role="status">Loading {{ gallery }}…</p>
		<p v-else-if="!failed && !items.length">No {{ hidden ? "hidden " : "" }}{{ gallery }} yet.</p>
		<button v-if="next" type="button" :disabled="busy" @click="load()">More {{ gallery }}</button>
	</section>
</template>

<style scoped>
.gallery {
	margin-top: 1.25rem;
}
.filters,
.actions {
	display: flex;
	align-items: baseline;
	flex-wrap: wrap;
	gap: 0.5rem;
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
}
.gallery strong {
	display: block;
	overflow-wrap: anywhere;
}
.gallery img {
	display: block;
	width: 100%;
	height: 10rem;
	object-fit: contain;
	object-position: left center;
	margin-bottom: 0.4rem;
}
.gallery button,
.gallery summary {
	color: var(--color-highlight);
	padding: 0.45rem;
	cursor: pointer;
}
.gallery button:disabled {
	color: var(--color-text-muted);
	cursor: default;
}
.options {
	display: grid;
	justify-items: start;
}
.confirmation {
	padding: 0.5rem;
	border-inline-start: 2px solid currentColor;
}
</style>
