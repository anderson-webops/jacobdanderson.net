<script setup lang="ts">
import type { MusicTrack } from "~/utils/music";
import { computed, onBeforeUnmount, onMounted, ref, shallowRef } from "vue";
import MusicTrackPlayer from "~/components/MusicTrackPlayer.vue";
import { loadMusicCatalog, musicSections, musicTime, soundcloudProfile } from "~/utils/music";

defineProps<{ standalone?: boolean }>();
const tracks = shallowRef<MusicTrack[]>([]);
const ready = ref(false);
const unavailable = ref(false);
const active = ref("");
const groups = computed(() =>
	musicSections.map(section => ({
		...section,
		tracks: tracks.value.filter(track => track.section === section.id)
	}))
);
let request: AbortController | undefined;
onMounted(async () => {
	request = new AbortController();
	const fallback: MusicTrack[] = [];
	const result = await loadMusicCatalog(fallback, request.signal);
	if (!request.signal.aborted) {
		tracks.value = result;
		unavailable.value = result === fallback;
		ready.value = true;
	}
});
onBeforeUnmount(() => request?.abort());

function toggle(track: MusicTrack) {
	active.value = active.value === track.id ? "" : track.id;
}
</script>

<template>
	<div class="music-room">
		<a class="section-link back" :href="standalone ? 'https://jacobdanderson.net/extra' : '/extra'">
			<span aria-hidden="true">←</span> Galleries, music &amp; games
		</a>
		<div class="listening-room">
			<header class="sleeve">
				<img src="/images/music-sleeve.svg" alt="" width="768" height="768" />
				<div class="sleeve-caption">
					<h1>Music</h1>
					<p>Jacob Anderson</p>
					<div class="music-profile-links">
						<a :href="soundcloudProfile">SoundCloud <span aria-hidden="true">↗</span></a>
						<a href="https://www.youtube.com/@J.D.Al.MusicLogic"
							>YouTube <span aria-hidden="true">↗</span></a
						>
					</div>
				</div>
			</header>
			<div class="library">
				<p v-if="unavailable" role="alert">Couldn’t load the music library.</p>
				<nav aria-label="Music sections" class="section-index">
					<a v-for="group in groups" :key="group.id" :href="`#${group.id}`">{{ group.label }}</a>
				</nav>
				<section v-for="group in groups" :key="group.id" :aria-labelledby="group.id">
					<div class="section-heading">
						<h2 :id="group.id" tabindex="-1">{{ group.label }}</h2>
					</div>
					<ol>
						<li
							v-for="(track, index) in group.tracks"
							:key="track.id"
							:class="{ selected: active === track.id }"
						>
							<button
								class="track"
								type="button"
								:aria-expanded="active === track.id"
								:aria-describedby="`duration-${track.id}`"
								:aria-label="`${active === track.id ? 'Close player for' : 'Play'} ${track.title}`"
								@click="toggle(track)"
							>
								<span class="track-no" aria-hidden="true">{{
									String(index + 1).padStart(2, "0")
								}}</span>
								<span class="track-title">{{ track.title }}</span>
								<span :id="`duration-${track.id}`" class="time">{{ musicTime(track.seconds) }}</span>
								<span class="play-mark" aria-hidden="true">{{ active === track.id ? "■" : "▶" }}</span>
							</button>
							<MusicTrackPlayer v-if="active === track.id" :key="track.id" :track="track" />
						</li>
					</ol>
					<p v-if="ready && !unavailable && !group.tracks.length">No recordings yet.</p>
				</section>
			</div>
		</div>
	</div>
</template>

<style scoped>
.music-room {
	display: grid;
	gap: 1.2rem;
}
.back {
	justify-self: start;
}
.back::after {
	content: none;
}
.listening-room {
	display: grid;
	grid-template-columns: minmax(12rem, 0.74fr) minmax(0, 1.4fr);
	gap: clamp(1.5rem, 5vw, 4.5rem);
	align-items: start;
}
.sleeve {
	position: sticky;
	top: 6rem;
	align-self: start;
}
.sleeve img {
	display: block;
	width: 100%;
	height: auto;
	border-radius: 3px;
	box-shadow: var(--shadow-card);
}
.sleeve-caption {
	padding-top: 1rem;
}
.sleeve h1 {
	margin: 0;
	font-size: clamp(2.5rem, 5vw, 4.8rem);
	line-height: 1;
}
.sleeve p {
	margin: 0.45rem 0;
	font-size: 1.15rem;
}
.music-profile-links {
	display: grid;
	justify-items: start;
}
.music-profile-links a {
	display: inline-block;
	padding: 0.45rem 0;
}
.library {
	min-width: 0;
}
.section-index {
	display: flex;
	flex-wrap: wrap;
	gap: 0.25rem 1.25rem;
	padding-bottom: 1rem;
}
.section-index a {
	display: inline-flex;
	align-items: center;
	min-height: 44px;
	font-weight: 650;
}
.library section + section {
	margin-top: 2.6rem;
}
.section-heading {
	display: flex;
	align-items: baseline;
	flex-wrap: wrap;
	justify-content: space-between;
	gap: 0.25rem 1rem;
}
.section-heading > span {
	color: var(--color-text-muted);
	font-size: 0.86rem;
}
.library h2 {
	margin: 0 0 0.55rem;
	scroll-margin-top: 6rem;
	font-size: clamp(1.7rem, 3vw, 2.3rem);
}
.library ol {
	list-style: none;
	padding: 0;
	border-top: 1px solid var(--color-border-strong);
}
.library li {
	border-bottom: 1px solid var(--color-border);
}
.track {
	display: grid;
	grid-template-columns: 2ch 1fr 4ch 1.4rem;
	gap: 0.8rem;
	align-items: center;
	width: 100%;
	min-height: 52px;
	padding: 0.6rem 0.55rem;
	text-align: left;
}
.track-no,
.time {
	font-size: 0.85rem;
	font-variant-numeric: tabular-nums;
	color: var(--color-text-muted);
}
.time {
	text-align: right;
}
.track-title {
	min-width: 0;
	font-weight: 600;
	overflow-wrap: anywhere;
}
.play-mark {
	text-align: center;
	font-size: 0.74rem;
	color: var(--color-accent-strong);
}
.track:hover,
.selected {
	background: var(--color-accent-soft);
}
@media (max-width: 680px) {
	.listening-room {
		grid-template-columns: minmax(0, 1fr);
		gap: 1rem;
	}
	.sleeve {
		position: static;
		display: flex;
		align-items: center;
		gap: 1.15rem;
	}
	.sleeve img {
		width: clamp(88px, 28vw, 150px);
	}
	.sleeve-caption {
		padding: 0;
	}
	.section-index {
		padding-bottom: 0.5rem;
	}
	.track {
		gap: 0.5rem;
		padding-inline: 0.25rem;
	}
}
</style>
