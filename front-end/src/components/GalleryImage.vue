<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import { requestGalleryImage } from "~/utils/galleryImages";

const props = defineProps<{ url: string; alt: string; width: number; height: number; immediate?: boolean }>();
const image = ref<HTMLImageElement>();
const lifetime = new AbortController();
let observer: IntersectionObserver | undefined;
let near = false;
let busy = false;
let done = false;
let attempts = 0;
let retry: ReturnType<typeof setTimeout> | undefined;

async function load() {
	const element = image.value;
	if (!element || !near || busy || done || retry || lifetime.signal.aborted) return;
	busy = true;
	const result = await requestGalleryImage(element, props.url, () => near, lifetime.signal);
	busy = false;
	if (lifetime.signal.aborted || result === "skipped") return;
	if (result === "loaded" || ++attempts >= 3) {
		done = true;
		observer?.disconnect();
	} else {
		retry = setTimeout(
			() => {
				retry = undefined;
				void load();
			},
			attempts === 1 ? 750 : 2000
		);
	}
}

onMounted(() => {
	if (!image.value) return;
	if (props.immediate || typeof IntersectionObserver === "undefined") {
		near = true;
		void load();
		return;
	}
	observer = new IntersectionObserver(
		([entry]) => {
			near = Boolean(entry?.isIntersecting);
			if (near) void load();
		},
		{ rootMargin: "300px 0px" }
	);
	observer.observe(image.value);
});

onBeforeUnmount(() => {
	observer?.disconnect();
	clearTimeout(retry);
	lifetime.abort();
});
</script>

<template>
	<img ref="image" :alt="alt" :width="width" :height="height" decoding="async" />
</template>
