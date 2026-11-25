<script setup lang="ts">
import { onMounted, ref } from "vue";

const props = defineProps<{ gallery: "photos" | "drawings" }>();
interface Item {
	id: string;
	description: string;
	width: number;
	height: number;
}
const items = ref<Item[]>([]);
const next = ref<string | null>(null);
const loading = ref(true);
const failed = ref(false);
async function load() {
	loading.value = true;
	failed.value = false;
	try {
		const response = await fetch(`/api/gallery/${props.gallery}${next.value ? `?before=${next.value}` : ""}`, {
			credentials: "omit"
		});
		if (!response.ok) throw new Error();
		const payload = await response.json();
		const validId = (value: unknown) => typeof value === "string" && /^[a-f0-9]{24}$/.test(value);
		if (
			!Array.isArray(payload.items) ||
			payload.items.length > 12 ||
			!(payload.next === null || validId(payload.next)) ||
			!payload.items.every(
				(item: Item) =>
					item &&
					validId(item.id) &&
					typeof item.description === "string" &&
					Number.isInteger(item.width) &&
					Number.isInteger(item.height)
			)
		) {
			throw new Error();
		}
		items.value.push(...payload.items);
		next.value = payload.next;
	} catch {
		failed.value = true;
	} finally {
		loading.value = false;
	}
}
onMounted(load);
</script>

<template>
	<div class="gallery">
		<ul v-if="items.length">
			<li v-for="item in items" :key="item.id">
				<img
					:src="`/api/gallery/${gallery}/${item.id}`"
					:alt="item.description"
					:width="item.width"
					:height="item.height"
					loading="lazy"
				/>
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
