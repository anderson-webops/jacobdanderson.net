<script setup lang="ts">
import type { MusicTrack } from "~/utils/music";
import { ref, useTemplateRef } from "vue";

defineProps<{ track: MusicTrack }>();
const failed = ref(false);
const audio = useTemplateRef<HTMLAudioElement>("audio");

function stopAudio() {
	if (!audio.value) return;
	audio.value.pause();
	audio.value.removeAttribute("src");
	audio.value.load();
}

onBeforeUnmount(stopAudio);
</script>

<template>
	<div class="track-player">
		<audio
			v-if="track.audio"
			ref="audio"
			:src="`/music-library/audio/${track.audio}`"
			:aria-label="track.title"
			controls
			autoplay
			preload="metadata"
			@error="failed = true"
		/>
		<p v-if="failed" role="alert">This recording couldn’t be loaded.</p>
		<div v-if="!track.audio && track.permalink" class="sources">
			<a :href="track.permalink">Listen on SoundCloud ↗</a>
		</div>
	</div>
</template>

<style scoped>
.track-player {
	display: grid;
	gap: 0.65rem;
	padding: 0.25rem 0.75rem 1rem;
}
audio {
	display: block;
	width: 100%;
	min-width: 0;
	border: 0;
}
.sources {
	display: flex;
	flex-wrap: wrap;
	gap: 0.25rem 1.25rem;
}
.sources a {
	display: inline-flex;
	align-items: center;
	min-height: 44px;
	color: var(--color-accent);
	text-decoration: underline;
}
</style>
