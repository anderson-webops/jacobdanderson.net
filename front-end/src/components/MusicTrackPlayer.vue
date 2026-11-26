<script setup lang="ts">
import type { MusicTrack } from "~/utils/music";
import { ref, useTemplateRef } from "vue";
import { widgetUrl } from "~/utils/music";

const props = defineProps<{ track: MusicTrack }>();
const local = ref(!props.track.soundcloudId);
const failed = ref(false);
const audio = useTemplateRef<HTMLAudioElement>("audio");

function stopAudio() {
	if (!audio.value) return;
	audio.value.pause();
	audio.value.removeAttribute("src");
	audio.value.load();
}

function switchPlayer() {
	stopAudio();
	failed.value = false;
	local.value = !local.value;
}

onBeforeUnmount(stopAudio);
</script>

<template>
	<div class="track-player">
		<audio
			v-if="local && track.audio"
			ref="audio"
			:src="`/music-library/audio/${track.audio}`"
			:aria-label="track.title"
			controls
			autoplay
			preload="metadata"
			@error="failed = true"
		/>
		<iframe
			v-else-if="track.soundcloudId"
			:title="`SoundCloud player: ${track.title}`"
			:src="widgetUrl(track.soundcloudId)"
			allow="autoplay"
			referrerpolicy="strict-origin-when-cross-origin"
			width="100%"
			height="166"
		/>
		<p v-if="local && failed" role="alert">This recording couldn’t be loaded.</p>
		<div v-if="track.permalink" class="sources">
			<a :href="track.permalink">Listen on SoundCloud ↗</a>
			<button v-if="track.audio" type="button" @click="switchPlayer">
				{{ local ? "Use SoundCloud player" : "Play local recording" }}
			</button>
		</div>
	</div>
</template>

<style scoped>
.track-player {
	display: grid;
	gap: 0.65rem;
	padding: 0.25rem 0.75rem 1rem;
}
audio,
iframe {
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
.sources a,
.sources button {
	display: inline-flex;
	align-items: center;
	min-height: 44px;
	color: var(--color-accent);
	text-decoration: underline;
}
</style>
