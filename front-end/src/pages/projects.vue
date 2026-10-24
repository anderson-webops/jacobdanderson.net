<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted } from "vue";
import { useMainStore } from "~/stores";
import { toAnchor } from "~/utils/anchor";

const store = useMainStore();
const projects = computed(() => store.userProfile.projects);

// Deep links from Home (/projects#slug) land with that project's details expanded.
function openLinkedProject() {
	const id = window.location.hash.slice(1);
	if (id) document.getElementById(id)?.querySelector("details")?.setAttribute("open", "");
}

onMounted(() => {
	openLinkedProject();
	window.addEventListener("hashchange", openLinkedProject);
});
onBeforeUnmount(() => window.removeEventListener("hashchange", openLinkedProject));
</script>

<template>
	<div class="projects-page">
		<header class="page-intro">
			<h1>Selected projects</h1>
			<p>Engineering and research work I can speak to in depth.</p>
		</header>

		<section class="project-list" aria-label="Selected projects">
			<article
				v-for="(project, index) in projects"
				:id="toAnchor(project.shortName)"
				:key="index"
				class="project-card"
			>
				<p class="timeframe">{{ project.timeframe }}</p>
				<div class="project-body">
					<h2>{{ project.shortName }}</h2>
					<p class="description">{{ project.description }}</p>
					<p class="key-result">{{ project.results[0] }}</p>
					<div class="project-actions">
						<a
							v-if="project.links[0]"
							class="primary-link"
							:href="project.links[0].href"
							rel="noopener"
							target="_blank"
						>
							{{ project.links[0].label }}
						</a>
						<details class="disclosure">
							<summary tabindex="0">
								<span class="when-closed">Role & more results</span
								><span class="when-open">Hide details</span>
							</summary>
							<div class="details-body">
								<p class="role"><span class="label">Role</span> {{ project.role }}</p>
								<ul v-if="project.results.length > 1" class="bullet-list">
									<li v-for="result in project.results.slice(1)" :key="result">{{ result }}</li>
								</ul>
								<p v-if="project.links.length > 1" class="more-links">
									<a
										v-for="link in project.links.slice(1)"
										:key="link.href"
										:href="link.href"
										rel="noopener"
										target="_blank"
									>
										{{ link.label }}
									</a>
								</p>
							</div>
						</details>
					</div>
				</div>
			</article>
		</section>

		<footer class="other-projects-callout">
			<div>
				<h2>Other projects</h2>
				<p>Experiments, tools, and work in progress.</p>
			</div>
			<RouterLink class="section-link" to="/other-projects">Browse other projects</RouterLink>
		</footer>
	</div>
</template>

<style scoped>
.projects-page {
	display: flex;
	flex-direction: column;
	gap: 2.75rem;
}

.project-list {
	display: flex;
	flex-direction: column;
	border-top: 1px solid var(--color-border);
}

.project-card {
	display: grid;
	grid-template-columns: var(--date-column) minmax(0, 1fr);
	gap: 0.35rem 2rem;
	padding: 1.9rem 0;
	border-bottom: 1px solid var(--color-border);
}

.project-card:target h2 {
	color: var(--color-accent);
}

.timeframe {
	padding-top: 0.35rem;
	color: var(--color-text-subtle);
	font-size: 0.875rem;
	font-variant-numeric: tabular-nums;
}

.project-body {
	display: flex;
	flex-direction: column;
	gap: 0.7rem;
	min-width: 0;
}

.project-card h2 {
	font-family: var(--font-body);
	font-size: 1.3rem;
	font-weight: 650;
	line-height: 1.3;
}

.description {
	color: var(--color-text-muted);
	max-width: var(--text-measure);
}

.details-body {
	display: flex;
	flex-direction: column;
	gap: 0.7rem;
	margin-top: 0.8rem;
	max-width: var(--text-measure);
}

.role {
	color: var(--color-text-muted);
}

.role .label {
	margin-right: 0.4rem;
}

.key-result {
	max-width: var(--text-measure);
	padding-left: 0.9rem;
	border-left: 2px solid var(--color-accent);
	font-weight: 550;
}

/* One disclosure and at most one visible link keep each card to a single choice. */
.project-actions {
	display: flex;
	flex-wrap: wrap;
	align-items: flex-start;
	gap: 0.75rem 1.5rem;
}

.project-actions .disclosure {
	flex: 0 1 auto;
	min-width: 0;
}

.project-actions .disclosure[open] {
	flex-basis: 100%;
}

.primary-link {
	color: var(--color-accent);
	font-size: 0.92rem;
	font-weight: 650;
}

.more-links {
	display: flex;
	flex-wrap: wrap;
	gap: 0.25rem 1rem;
}

.more-links a {
	color: var(--color-accent);
	font-size: 0.92rem;
	font-weight: 600;
}

.other-projects-callout {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	justify-content: space-between;
	gap: 0.75rem 1.5rem;
	padding: 1.4rem 1.6rem;
	border-radius: var(--radius-lg);
	background: var(--color-surface-accent);
}

.other-projects-callout h2 {
	font-size: 1.35rem;
	line-height: 1.25;
}

.other-projects-callout p {
	color: var(--color-text-muted);
}

@media (max-width: 640px) {
	.project-card {
		grid-template-columns: 1fr;
	}

	.timeframe {
		padding-top: 0;
	}
}
</style>

<route lang="yaml">
meta:
    layout: default
    title: Projects | Jacob Anderson
    description: Selected engineering and research projects from Jacob Anderson, including tooling, telemetry, and hardware integration work.
</route>
