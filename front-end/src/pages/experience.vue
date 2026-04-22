<script lang="ts" setup>
import { computed } from "vue";
import { useMainStore } from "~/stores";

const store = useMainStore();
const engineeringExperience = computed(() =>
	store.userProfile.experience.filter(item => item.category === "engineering")
);
const instructionExperience = computed(() =>
	store.userProfile.experience.filter(item => item.category === "instruction")
);
</script>

<template>
	<div class="experience-page">
		<header class="page-intro">
			<p class="eyebrow">Experience</p>
			<h1>Engineering, research, and instructional roles.</h1>
			<p>
				Engineering roles have centered on sensing hardware, simulation tooling, and industrial telemetry.
				Instructional work covers programming, STEM, and Spanish.
			</p>
		</header>

		<section class="section-block">
			<div class="section-top">
				<div>
					<p class="eyebrow">Engineering & Research</p>
					<h2>Technical roles</h2>
				</div>
			</div>

			<div class="timeline">
				<article v-for="(item, index) in engineeringExperience" :key="index" class="entry section-panel">
					<div class="entry-meta">
						<span class="entry-organization">{{ item.organization }}</span>
						<span class="entry-timeframe">{{ item.timeframe }}</span>
					</div>
					<h3>{{ item.title }}</h3>
					<p class="entry-location">{{ item.location }}</p>
					<p class="entry-summary">{{ item.summary }}</p>
					<ul>
						<li v-for="(highlight, highlightIndex) in item.highlights" :key="highlightIndex">
							{{ highlight }}
						</li>
					</ul>
				</article>
			</div>
		</section>

		<section class="section-block">
			<div class="section-top">
				<div>
					<p class="eyebrow">Teaching & Instruction</p>
					<h2>Instructional work</h2>
				</div>
			</div>

			<div class="timeline instruction-timeline">
				<article v-for="(item, index) in instructionExperience" :key="index" class="entry section-panel">
					<div class="entry-meta">
						<span class="entry-organization">{{ item.organization }}</span>
						<span class="entry-timeframe">{{ item.timeframe }}</span>
					</div>
					<h3>{{ item.title }}</h3>
					<p class="entry-location">{{ item.location }}</p>
					<p class="entry-summary">{{ item.summary }}</p>
					<ul>
						<li v-for="(highlight, highlightIndex) in item.highlights" :key="highlightIndex">
							{{ highlight }}
						</li>
					</ul>
				</article>
			</div>
		</section>
	</div>
</template>

<style scoped>
.experience-page {
	display: flex;
	flex-direction: column;
	gap: 2rem;
}

.section-block {
	display: flex;
	flex-direction: column;
	gap: 1.2rem;
}

.section-top h2 {
	font-size: clamp(1.9rem, 3.4vw, 2.3rem);
	margin-top: 0.55rem;
}

.timeline {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 1.2rem;
}

.instruction-timeline {
	grid-template-columns: 1fr;
}

.entry {
	padding: 1.6rem;
	display: flex;
	flex-direction: column;
	gap: 0.9rem;
}

.entry-meta {
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: 0.9rem;
}

.entry-organization {
	color: var(--color-highlight);
	font-size: 0.76rem;
	font-weight: 700;
	letter-spacing: 0.12em;
	text-transform: uppercase;
}

.entry-timeframe {
	color: var(--color-accent);
	font-size: 0.92rem;
	font-weight: 700;
}

.entry h3 {
	font-size: 1.65rem;
	line-height: 1.14;
}

.entry-location,
.entry-summary,
.entry ul {
	color: var(--color-text-muted);
	line-height: 1.72;
}

.entry-location {
	font-weight: 600;
}

.entry ul {
	margin: 0;
	padding-left: 1.1rem;
	display: flex;
	flex-direction: column;
	gap: 0.55rem;
}

@media (max-width: 900px) {
	.timeline {
		grid-template-columns: 1fr;
	}
}

@media (max-width: 640px) {
	.entry {
		padding: 1.4rem;
	}

	.entry-meta {
		flex-direction: column;
		align-items: flex-start;
	}
}
</style>

<route lang="yaml">
meta:
    layout: default
</route>
