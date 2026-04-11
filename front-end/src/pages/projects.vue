<script lang="ts" setup>
import { computed } from "vue";
import { useMainStore } from "~/stores";

const store = useMainStore();
const projects = computed(() => store.userProfile.projects);
</script>

<template>
	<div class="projects-page">
		<header class="page-intro">
			<p class="eyebrow">Projects</p>
			<h1>Selected work across research, embedded systems, and product development.</h1>
			<p>
				These projects reflect how I approach technical work: strong system design, clear documentation, and a
				focus on delivery rather than unnecessary complexity.
			</p>
		</header>

		<section class="grid">
			<article v-for="(project, index) in projects" :key="index" class="project-card section-panel">
				<div class="card-top">
					<span class="card-label">Project</span>
					<span class="timeframe">{{ project.timeframe }}</span>
				</div>
				<h2>{{ project.name }}</h2>
				<p class="description">{{ project.description }}</p>
				<ul>
					<li v-for="(highlight, highlightIndex) in project.highlights" :key="highlightIndex">
						{{ highlight }}
					</li>
				</ul>
			</article>
		</section>
	</div>
</template>

<style scoped>
.projects-page {
	display: flex;
	flex-direction: column;
	gap: 2rem;
}

.grid {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 1.2rem;
}

.project-card {
	padding: 1.6rem;
	display: flex;
	flex-direction: column;
	gap: 0.95rem;
}

.card-top {
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: 0.75rem;
}

.card-label {
	color: var(--color-highlight);
	font-size: 0.76rem;
	font-weight: 700;
	letter-spacing: 0.12em;
	text-transform: uppercase;
}

.timeframe {
	color: var(--color-accent);
	font-size: 0.92rem;
	font-weight: 700;
}

.project-card h2 {
	font-size: 1.62rem;
	line-height: 1.14;
}

.description,
.project-card ul {
	color: var(--color-text-muted);
	line-height: 1.72;
}

.project-card ul {
	margin: 0;
	padding-left: 1.1rem;
	display: flex;
	flex-direction: column;
	gap: 0.55rem;
}

@media (max-width: 900px) {
	.grid {
		grid-template-columns: 1fr;
	}
}

@media (max-width: 640px) {
	.project-card {
		padding: 1.4rem;
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
