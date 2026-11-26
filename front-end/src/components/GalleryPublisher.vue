<script setup lang="ts">
import type { PDFDocumentLoadingTask, PDFDocumentProxy } from "pdfjs-dist";
import { nextTick, onBeforeUnmount, ref } from "vue";
import GalleryGrid from "./GalleryGrid.vue";

const props = defineProps<{ gallery: "photos" | "drawings"; adminFetch: typeof fetch }>();
const description = ref("");
const picker = ref<HTMLInputElement>();
const preview = ref<HTMLCanvasElement>();
const preparing = ref(false);
const publishing = ref(false);
const selected = ref(false);
const error = ref("");
const revision = ref(0);
const dragDepth = ref(0);
const pages = ref(0);
const pageNumber = ref(1);
const limit = 200 * 1024 * 1024;
const maxSide = 1024;
let pdfTask: PDFDocumentLoadingTask | undefined;
let pdf: PDFDocumentProxy | undefined;
let disposed = false;

async function releasePdf() {
	const task = pdfTask;
	pdfTask = undefined;
	pdf = undefined;
	if (task) await task.destroy();
}
async function paintPage() {
	const canvas = preview.value;
	if (!canvas || !pdf) return;
	const page = await pdf.getPage(pageNumber.value);
	try {
		const size = page.getViewport({ scale: 1 });
		const scale = maxSide / Math.max(size.width, size.height);
		if (!Number.isFinite(scale) || scale <= 0) throw new Error();
		const viewport = page.getViewport({ scale });
		canvas.width = Math.max(1, Math.round(viewport.width));
		canvas.height = Math.max(1, Math.round(viewport.height));
		await page.render({ canvas, viewport }).promise;
	} finally {
		page.cleanup();
	}
}
async function changePage() {
	if (preparing.value || publishing.value || !pdf) return;
	selected.value = false;
	error.value = "";
	if (!Number.isInteger(pageNumber.value) || pageNumber.value < 1 || pageNumber.value > pages.value) {
		error.value = `Choose a page from 1 to ${pages.value}.`;
		return;
	}
	preparing.value = true;
	try {
		await paintPage();
		selected.value = !disposed;
	} catch {
		error.value = "Couldn’t render that PDF page.";
	} finally {
		preparing.value = false;
	}
}
async function select(file?: File) {
	if (preparing.value || publishing.value || !file) return;
	selected.value = false;
	description.value = "";
	error.value = "";
	pages.value = 0;
	pageNumber.value = 1;
	preparing.value = true;
	const heic = ["image/heic", "image/heif"].includes(file.type) || (!file.type && /\.hei[cf]$/i.test(file.name));
	const isPdf = file.type === "application/pdf" || (!file.type && /\.pdf$/i.test(file.name));
	try {
		await releasePdf();
		if (file.size > limit) {
			error.value = "Choose a file of 200 MB or smaller.";
			return;
		}
		if (!isPdf && !heic && !["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
			error.value = "Choose a JPEG, PNG, WebP, HEIC, or PDF file.";
			return;
		}
		const canvas = preview.value;
		if (!canvas || disposed) return;
		if (isPdf) {
			const [library] = await Promise.all([import("pdfjs-dist"), import("pdfjs-dist/build/pdf.worker.min.mjs")]);
			const data = new Uint8Array(await file.arrayBuffer());
			if (disposed) return;
			pdfTask = library.getDocument({
				data,
				useWasm: false,
				useWorkerFetch: false,
				disableWorkerRendering: true,
				stopAtErrors: true,
				maxImageSize: 64_000_000,
				canvasMaxAreaInBytes: 32 * 1024 * 1024
			});
			pdf = await pdfTask.promise;
			pages.value = pdf.numPages;
			await paintPage();
		} else {
			const bitmap = await createImageBitmap(file);
			try {
				if (disposed) return;
				const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
				canvas.width = Math.max(1, Math.round(bitmap.width * scale));
				canvas.height = Math.max(1, Math.round(bitmap.height * scale));
				const context = canvas.getContext("2d");
				if (!context) throw new Error();
				context.imageSmoothingQuality = "high";
				context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
			} finally {
				bitmap.close();
			}
		}
		selected.value = !disposed;
	} catch {
		error.value = isPdf
			? "Couldn’t render this PDF. Choose an unlocked PDF or an image."
			: heic
				? "This browser couldn’t open the HEIC image. Try Safari or export a JPEG."
				: "This image couldn’t be opened. Choose another file.";
	} finally {
		preparing.value = false;
		if (picker.value) picker.value.value = "";
	}
}
function drop(event: DragEvent) {
	dragDepth.value = 0;
	if (preparing.value || publishing.value) return;
	const files = event.dataTransfer?.files;
	if (files?.length === 1) void select(files[0]);
	else if (files?.length) error.value = "Choose one file at a time.";
}
onBeforeUnmount(() => {
	disposed = true;
	void releasePdf();
});

async function publish() {
	const canvas = preview.value;
	if (publishing.value || !selected.value || !canvas) return;
	publishing.value = true;
	error.value = "";
	try {
		const pixels = canvas.getContext("2d")!.getImageData(0, 0, canvas.width, canvas.height);
		const response = await props.adminFetch(`/api/admin/gallery/${props.gallery}`, {
			method: "POST",
			headers: {
				"Content-Type": "application/octet-stream",
				"X-Image-Width": String(canvas.width),

				"X-Image-Height": String(canvas.height),
				"X-Image-Description": encodeURIComponent(
					description.value.trim() || (props.gallery === "photos" ? "Untitled photo" : "Untitled drawing")
				)
			},
			body: new Blob([new Uint8Array(pixels.data)])
		});
		if (response.status !== 201) throw new Error();
		selected.value = false;
		description.value = "";
		if (picker.value) picker.value.value = "";
		await releasePdf();
		pages.value = 0;
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
		<form class="section-panel" @submit.prevent="publish">
			<label
				class="dropzone"
				:class="{ over: dragDepth > 0 }"
				@dragenter.prevent="dragDepth++"
				@dragleave.prevent="dragDepth = Math.max(0, dragDepth - 1)"
				@dragover.prevent
				@drop.prevent="drop"
			>
				Upload an image
				<input
					ref="picker"
					type="file"
					accept="image/jpeg,image/png,image/webp,image/heic,image/heif,application/pdf,.heic,.heif,.pdf"
					:disabled="preparing || publishing"
					@change="select(picker?.files?.[0])"
				/>
			</label>
			<p v-if="preparing" role="status">Preparing preview…</p>
			<label v-if="pages > 1"
				>PDF page (of {{ pages }})<input
					v-model.number="pageNumber"
					type="number"
					min="1"
					:max="pages"
					:disabled="preparing || publishing"
					@change="changePage"
			/></label>
			<canvas v-show="selected" ref="preview" role="img" aria-label="Selected image preview" />
			<label v-if="selected"
				>Image description (optional)<input v-model="description" maxlength="200" :disabled="publishing"
			/></label>
			<button v-if="selected" class="button-primary" :disabled="preparing || publishing">
				{{ publishing ? "Publishing…" : gallery === "photos" ? "Publish photo" : "Publish drawing" }}
			</button>
			<p v-if="error" role="alert">{{ error }}</p>
		</form>
		<GalleryGrid :key="revision" :gallery="gallery" :admin-fetch="adminFetch" />
	</section>
</template>

<style scoped>
.publisher .dropzone {
	position: relative;
	width: 100%;
	min-height: 6rem;
	display: grid;
	place-items: center;
	border: 2px dashed var(--color-text-muted);
	border-radius: 0.5rem;
	cursor: pointer;
	color: var(--color-highlight);
}
.dropzone input {
	position: absolute;
	inset: 0;
	opacity: 0;
	height: 100%;
	cursor: pointer;
}
.publisher .dropzone:is(:hover, :focus-within, .over) {
	border-style: solid;
	outline: 2px solid var(--color-highlight);
	outline-offset: 2px;
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
