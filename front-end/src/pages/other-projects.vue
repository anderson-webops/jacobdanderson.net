<script lang="ts" setup>
import type { OtherProjectCategory } from "~/data/otherProjects";
import { computed, onMounted, ref } from "vue";
import { useProjectVisibility } from "~/composables/useProjectVisibility";
import { otherProjectCategories, otherProjects } from "~/data/otherProjects";

const allCategoriesLabel = "All projects" as const;
const selectedCategory = ref<OtherProjectCategory | typeof allCategoriesLabel>(allCategoriesLabel);
const { errorMessage, hasLoadedVisibility, isLoading, isProjectVisible, loadVisibility } = useProjectVisibility();

const visibleProjects = computed(() =>
	otherProjects.filter(
		project =>
			isProjectVisible(project) &&
			(selectedCategory.value === allCategoriesLabel || project.category === selectedCategory.value)
	)
);

const availableCategories = computed(() =>
	otherProjectCategories.filter(category =>
		otherProjects.some(project => project.category === category && isProjectVisible(project))
	)
);

onMounted(() => void loadVisibility());
</script>

<template>
	<div class="other-projects-page">
		<header class="page-intro">
			<p class="eyebrow">Working index</p>
			<h1>Other projects</h1>
			<p>
				A broader, less formal inventory of substantial research, software, teaching, civic, web, and product
				work. Status labels are high-level snapshots reviewed in August 2026, not promises about future
				releases.
			</p>
		</header>

		<p v-if="isLoading" class="loading-state section-panel" role="status">Loading the current project index…</p>

		<section v-else-if="!hasLoadedVisibility" class="empty-state section-panel" role="alert">
			<h2>The project index is temporarily unavailable</h2>
			<p>{{ errorMessage }}</p>
			<button class="retry-button" type="button" @click="loadVisibility">Try again</button>
		</section>

		<nav v-if="hasLoadedVisibility" aria-label="Filter other projects by category" class="filters">
			<button
				:aria-pressed="selectedCategory === allCategoriesLabel"
				class="filter-button"
				type="button"
				@click="selectedCategory = allCategoriesLabel"
			>
				{{ allCategoriesLabel }}
			</button>
			<button
				v-for="category in availableCategories"
				:key="category"
				:aria-pressed="selectedCategory === category"
				class="filter-button"
				type="button"
				@click="selectedCategory = category"
			>
				{{ category }}
			</button>
		</nav>

		<p v-if="hasLoadedVisibility" class="result-count" aria-live="polite">
			{{ visibleProjects.length }} {{ visibleProjects.length === 1 ? "project" : "projects" }} shown
		</p>

		<section
			v-if="hasLoadedVisibility && visibleProjects.length"
			class="project-grid"
			aria-label="Other project cards"
		>
			<article v-for="project in visibleProjects" :key="project.slug" class="project-card section-panel">
				<div class="card-top">
					<span class="category">{{ project.category }}</span>
					<span class="status" :class="`status-${project.statusTone}`">{{ project.status }}</span>
				</div>
				<div class="card-heading">
					<h2>{{ project.name }}</h2>
					<span class="timeframe">{{ project.timeframe }}</span>
				</div>
				<p class="summary">{{ project.summary }}</p>
				<p class="status-note"><strong>Status:</strong> {{ project.statusNote }}</p>
				<ul class="tag-list" aria-label="Project technologies and topics">
					<li v-for="tag in project.tags" :key="tag" class="tag">{{ tag }}</li>
				</ul>
				<div v-if="project.links.length" class="artifact-links">
					<a v-for="link in project.links" :key="link.href" :href="link.href" rel="noopener" target="_blank">
						{{ link.label }}
					</a>
				</div>
			</article>
		</section>

		<section v-else-if="hasLoadedVisibility" class="empty-state section-panel">
			<h2>No projects in this view</h2>
			<p>Choose another category to continue browsing.</p>
		</section>

		<footer class="page-note section-panel">
			<div>
				<p class="category">Source notes</p>
				<h2>Public evidence, summarized carefully</h2>
			</div>
			<p>
				This index draws from public repositories, released sites, and the professional project record. Support
				repositories, course forks, private implementation details, and routine maintenance work are grouped or
				omitted when separate cards would overstate their significance.
			</p>
			<a class="section-link" href="https://github.com/Jacoba1100254352" rel="noopener" target="_blank">
				Browse the public GitHub profile
			</a>
		</footer>
	</div>
</template>

<style scoped>
.other-projects-page {
	display: flex;
	flex-direction: column;
	gap: 1.65rem;
}

.filters {
	display: flex;
	flex-wrap: wrap;
	gap: 0.65rem;
}

.filter-button {
	border: 1px solid var(--color-border-strong);
	border-radius: 999px;
	background: rgba(255, 255, 255, 0.68);
	color: var(--color-accent-strong);
	cursor: pointer;
	font-size: 0.88rem;
	font-weight: 700;
	padding: 0.58rem 0.9rem;
}

.filter-button[aria-pressed="true"] {
	background: var(--color-accent-strong);
	border-color: var(--color-accent-strong);
	color: var(--color-surface-strong);
}

.result-count {
	color: var(--color-text-muted);
	font-size: 0.92rem;
}

.loading-state {
	color: var(--color-text-muted);
	padding: var(--panel-padding);
}

.retry-button {
	align-self: flex-start;
	border: 1px solid var(--color-accent-strong);
	border-radius: 999px;
	background: var(--color-accent-strong);
	color: var(--color-surface-strong);
	cursor: pointer;
	font: inherit;
	font-weight: 700;
	padding: 0.62rem 0.95rem;
}

.project-grid {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 1.1rem;
}

.project-card {
	display: flex;
	flex-direction: column;
	gap: 0.9rem;
	padding: var(--panel-padding);
}

.card-top,
.card-heading {
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	gap: 0.9rem;
}

.category {
	color: var(--color-highlight);
	font-size: 0.74rem;
	font-weight: 800;
	letter-spacing: 0.1em;
	text-transform: uppercase;
}

.status {
	border: 1px solid transparent;
	border-radius: 999px;
	font-size: 0.78rem;
	font-weight: 800;
	line-height: 1;
	padding: 0.48rem 0.68rem;
	white-space: nowrap;
}

.status-active,
.status-live {
	background: #e4f1e8;
	border-color: #bfd9c7;
	color: #285b36;
}

.status-published,
.status-completed {
	background: #e8edf3;
	border-color: #c8d3df;
	color: #344f68;
}

.status-preview,
.status-prototype {
	background: #f4ebd9;
	border-color: #dfcba4;
	color: #745420;
}

.status-maintained {
	background: #ece8f4;
	border-color: #d2c8e2;
	color: #594875;
}

.card-heading h2 {
	font-size: 1.45rem;
	line-height: 1.2;
}

.timeframe {
	color: var(--color-accent);
	font-size: 0.86rem;
	font-weight: 700;
	white-space: nowrap;
}

.summary,
.status-note,
.page-note > p,
.empty-state p {
	color: var(--color-text-muted);
	line-height: 1.7;
}

.status-note {
	font-size: 0.92rem;
}

.tag-list {
	list-style: none;
	margin: 0;
	padding: 0;
}

.tag {
	font-size: 0.8rem;
	padding: 0.36rem 0.64rem;
}

.artifact-links {
	display: flex;
	flex-wrap: wrap;
	gap: 0.75rem;
	margin-top: auto;
	padding-top: 0.2rem;
}

.artifact-links a {
	color: var(--color-accent);
	font-size: 0.9rem;
	font-weight: 750;
	text-decoration: none;
}

.page-note,
.empty-state {
	display: flex;
	flex-direction: column;
	gap: 0.85rem;
	padding: var(--panel-padding);
}

.page-note h2,
.empty-state h2 {
	font-size: 1.35rem;
}

@media (max-width: 900px) {
	.project-grid {
		grid-template-columns: 1fr;
	}
}

@media (max-width: 640px) {
	.card-top,
	.card-heading {
		align-items: flex-start;
		flex-direction: column;
	}

	.status,
	.timeframe {
		white-space: normal;
	}
}
</style>

<route lang="yaml">
meta:
    layout: default
    title: Other Projects | Jacob Anderson
    description: A working index of substantial research, software, teaching, civic, web, and product projects by Jacob Anderson.
    robots: noindex,follow
</route>
