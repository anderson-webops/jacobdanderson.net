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
			<h1>Roles that connect engineering, research, and instruction.</h1>
			<p>
				A selection of work spanning embedded systems, research tooling,
				product development, and technical education.
			</p>
		</header>

		<section class="timeline">
			<article
				v-for="(item, index) in experiences"
				:key="index"
				class="entry section-panel"
			>
				<div class="entry-meta">
					<span class="timeframe">{{ item.timeframe }}</span>
					<span class="location">{{ item.location }}</span>
				</div>
				<h2>{{ item.title }}</h2>
				<p class="organization">{{ item.organization }}</p>
				<ul>
					<li
						v-for="(highlight, highlightIndex) in item.highlights"
						:key="highlightIndex"
					>
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
	gap: 1rem;
}

.entry {
	padding: 1.6rem;
	border-left: 4px solid rgba(33, 74, 104, 0.24);
}

.entry-meta {
	display: flex;
	flex-wrap: wrap;
	gap: 1rem;
	font-size: 0.9rem;
	font-weight: 700;
	color: var(--color-accent);
	margin-bottom: 0.75rem;
}

.entry h2 {
	font-size: 1.7rem;
	line-height: 1.12;
}

.organization {
	margin-top: 0.45rem;
	color: var(--color-text-muted);
	font-weight: 600;
}

.entry ul {
	margin: 1rem 0 0;
	padding-left: 1.1rem;
	display: flex;
	flex-direction: column;
	gap: 0.55rem;
	color: var(--color-text-muted);
}

@media (max-width: 640px) {
	.entry {
		padding: 1.35rem;
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
