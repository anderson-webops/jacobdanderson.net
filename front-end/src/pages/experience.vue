<script lang="ts" setup>
import { computed } from "vue";
import { useMainStore } from "~/stores";

const store = useMainStore();
const experiences = computed(() => store.userProfile.experience);
</script>

<template>
	<div class="experience-page">
		<header class="page-intro">
			<p class="eyebrow">Experience</p>
			<h1>Roles spanning engineering, research, and technical instruction.</h1>
			<p>
				A selection of work across embedded systems, research tooling, product development, and teaching, with
				an emphasis on practical execution and dependable communication.
			</p>
		</header>

		<section class="timeline">
			<article v-for="(item, index) in experiences" :key="index" class="entry section-panel">
				<div class="entry-meta">
					<span class="entry-organization">{{ item.organization }}</span>
					<span class="entry-timeframe">{{ item.timeframe }}</span>
				</div>
				<h2>{{ item.title }}</h2>
				<p class="entry-location">{{ item.location }}</p>
				<ul>
					<li v-for="(highlight, highlightIndex) in item.highlights" :key="highlightIndex">
						{{ highlight }}
					</li>
				</ul>
			</article>
		</section>
	</div>
</template>

<style scoped>
.experience-page {
	display: flex;
	flex-direction: column;
	gap: 2rem;
}

.timeline {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 1.2rem;
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

.entry h2 {
	font-size: 1.65rem;
	line-height: 1.14;
}

.entry-location,
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

<route lang="json">
{
	"meta": {
		"layout": "default"
	}
}
</route>
