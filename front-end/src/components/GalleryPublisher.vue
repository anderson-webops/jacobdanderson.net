<script setup lang="ts">
import { nextTick, ref } from "vue";
import GalleryGrid from "./GalleryGrid.vue";

const props = defineProps<{ gallery: "photos" | "drawings"; adminFetch: typeof fetch }>();
const description = ref("");
const picker = ref<HTMLInputElement>();
const preview = ref<HTMLCanvasElement>();
const preparing = ref(false);
const publishing = ref(false);
const selected = ref(false);
const error = ref("");
const status = ref("");
const revision = ref(0);

async function select() {
	const file = picker.value?.files?.[0];
	selected.value = false;
	error.value = "";
	status.value = "";
	if (!file) return;
	const heic = ["image/heic", "image/heif"].includes(file.type) || (!file.type && /\.hei[cf]$/i.test(file.name));
	if ((!heic && !["image/jpeg", "image/png", "image/webp"].includes(file.type)) || file.size > 16 * 1024 * 1024) {
		error.value = "Choose a JPEG, PNG, WebP, or HEIC image up to 16 MB.";
		return;
	}
	preparing.value = true;
	try {
		const bitmap = await createImageBitmap(file);
		try {
			if (!preview.value) return;
			const scale = Math.min(1, 1024 / Math.max(bitmap.width, bitmap.height));
			const canvas = preview.value;
			canvas.width = Math.max(1, Math.round(bitmap.width * scale));
			canvas.height = Math.max(1, Math.round(bitmap.height * scale));
			const context = canvas.getContext("2d");
			if (!context) throw new Error();
			context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
			selected.value = true;
		} finally {
			bitmap.close();
		}
	} catch {
		error.value = heic
			? "This browser couldn’t open the HEIC image. Try Safari or export a JPEG."
			: "This image couldn’t be opened. Choose another file.";
	} finally {
		preparing.value = false;
	}
}

async function publish() {
	const canvas = preview.value;
	if (publishing.value || !selected.value || !canvas || !description.value.trim()) return;
	publishing.value = true;
	status.value = "";
	error.value = "";
	try {
		const pixels = canvas.getContext("2d")!.getImageData(0, 0, canvas.width, canvas.height);
		const response = await props.adminFetch(`/api/admin/gallery/${props.gallery}`, {
			method: "POST",
			headers: {
				"Content-Type": "application/octet-stream",
				"X-Image-Width": String(canvas.width),

				"X-Image-Height": String(canvas.height),
				"X-Image-Description": encodeURIComponent(description.value.trim())
			},
			body: new Blob([new Uint8Array(pixels.data)])
		});
		if (response.status !== 201) throw new Error();
		selected.value = false;
		description.value = "";
		if (picker.value) picker.value.value = "";
		status.value = props.gallery === "photos" ? "Photo published." : "Drawing published.";
		revision.value++;
		await nextTick();
		picker.value?.focus();
	} catch {
		error.value = "Couldn’t confirm publication. Check the gallery before trying again.";
	} finally {
		publishing.value = false;
	}
}
</script>

<template>
	<section class="publisher">
		<header>
			<h2>{{ gallery === "photos" ? "Top Photos" : "Top Drawings" }}</h2>
			<a class="section-link" :href="`/extra/${gallery}`" target="_blank" rel="noopener noreferrer"
				>View gallery<span class="sr-only"> (opens in a new tab)</span></a
			>
		</header>
		<form class="section-panel" @submit.prevent="publish">
			<label
				>Choose an image<input
					ref="picker"
					type="file"
					accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
					:disabled="preparing || publishing"
					aria-describedby="image-formats"
					@change="select"
			/></label>
			<small id="image-formats">JPEG, PNG, WebP, or HEIC · Up to 16 MB</small>
			<canvas v-show="selected" ref="preview" role="img" aria-label="Selected image preview" />
			<label v-if="selected"
				>Image description<input v-model="description" maxlength="200" required :disabled="publishing"
			/></label>
			<button class="button-primary" :disabled="preparing || publishing || !selected || !description.trim()">
				{{ publishing ? "Publishing…" : gallery === "photos" ? "Publish photo" : "Publish drawing" }}
			</button>
			<p v-if="error" role="alert">{{ error }}</p>
			<p v-if="status" role="status">{{ status }}</p>
		</form>
		<GalleryGrid :key="revision" :gallery="gallery" :admin-fetch="adminFetch" />
	</section>
</template>

<style scoped>
.publisher header {
	display: flex;
	justify-content: space-between;
	align-items: baseline;
	flex-wrap: wrap;
	gap: 0.75rem;
	margin-bottom: 1rem;
}
.publisher form {
	display: grid;
	justify-items: start;
	gap: 0.65rem;
	padding: 1.25rem;
}
.publisher label {
	display: grid;
	gap: 0.4rem;
	font-weight: 650;
	max-width: 100%;
}
.publisher input {
	min-width: 0;
	width: 100%;
}
.publisher input:not([type="file"]) {
	border: 1px solid var(--color-text-muted);
	border-radius: 0.4rem;
	padding: 0.5rem;
}
.publisher canvas {
	max-width: 100%;
	width: auto;
	height: auto;
	max-height: 15rem;
	object-fit: contain;
}
.publisher button:disabled {
	opacity: 0.65;
}
</style>
