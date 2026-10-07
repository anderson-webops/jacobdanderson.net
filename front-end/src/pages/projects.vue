<script lang="ts" setup>
import { computed } from "vue";
import { useMainStore } from "~/stores";

const store = useMainStore();
const projects = computed(() => store.userProfile.projects);
</script>

<template>
	<div class="projects-page">
		<header class="page-intro">
			<h1>Selected projects</h1>
		</header>

		<section class="grid">
			<article v-for="(project, index) in projects" :key="index" class="project-card section-panel">
				<div class="card-top">
					<span class="timeframe">{{ project.timeframe }}</span>
				</div>
				<h2>{{ project.shortName }}</h2>
				<p class="description">{{ project.description }}</p>
				<ul>
					<li v-for="(result, resultIndex) in project.results" :key="resultIndex">
						{{ result }}
					</li>
				</ul>
				<div v-if="project.links.length" class="artifact-links">
					<a v-for="link in project.links" :key="link.href" :href="link.href" rel="noopener" target="_blank">
						{{ link.label }}
					</a>
				</div>
			</article>
		</section>

		<footer class="other-projects-callout">
			<RouterLink class="section-link" to="/other-projects">Other projects</RouterLink>
			<p>Experiments, tools, and work in progress.</p>
		</footer>
	</div>
</template>

<style scoped>
.projects-page {
	display: flex;
	flex-direction: column;
	gap: 1.85rem;
}

.grid {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 1.1rem;
}

.project-card {
	padding: var(--panel-padding);
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
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
	font-size: 1.42rem;
	line-height: 1.2;
}

.description,
.role,
.project-card ul {
	color: var(--color-text-muted);
	line-height: 1.72;
}

.role {
	margin: 0;
}

.project-card ul {
	margin: 0;
	padding-left: 1.1rem;
	display: flex;
	flex-direction: column;
	gap: 0.55rem;
}

.artifact-links {
	display: flex;
	flex-wrap: wrap;
	gap: 0.75rem;
}

.artifact-links a {
	color: var(--color-accent);
	font-size: 0.92rem;
	font-weight: 700;
	text-decoration: none;
}

.artifact-links a:first-child {
	text-decoration: underline;
	text-underline-offset: 0.16em;
}

.other-projects-callout {
	display: flex;
	flex-direction: column;
	gap: 0.4rem;
	padding-top: 1rem;
	border-top: 1px solid var(--color-border-strong);
}

.other-projects-callout h2 {
	font-size: 1.42rem;
	line-height: 1.25;
}

.other-projects-callout > p {
	color: var(--color-text-muted);
	line-height: 1.72;
	max-width: var(--text-measure);
}

@media (max-width: 900px) {
	.grid {
		grid-template-columns: 1fr;
	}
}

@media (max-width: 640px) {
	.project-card {
		padding: var(--panel-padding);
	}
}
</style>

<route lang="yaml">
meta:
    layout: default
    title: Projects | Jacob Anderson
    description: Selected engineering and research projects from Jacob Anderson, including tooling, telemetry, and hardware integration work.
</route>
