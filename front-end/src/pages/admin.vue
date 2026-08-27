<script lang="ts" setup>
import type { OtherProject } from "~/data/otherProjects";
import { onMounted, ref } from "vue";
import { useProjectVisibility } from "~/composables/useProjectVisibility";
import { otherProjects } from "~/data/otherProjects";

const pendingSlug = ref("");
const statusMessage = ref("");
const { errorMessage, isLoading, isProjectVisible, loadVisibility, setProjectVisibility } = useProjectVisibility();

async function toggleVisibility(project: OtherProject) {
	pendingSlug.value = project.slug;
	statusMessage.value = "";
	const nextVisibility = !isProjectVisible(project);
	const saved = await setProjectVisibility(project, nextVisibility);

	if (saved) {
		statusMessage.value = `${project.name} is now ${nextVisibility ? "shown" : "hidden"} on Other Projects.`;
	}
	pendingSlug.value = "";
}

onMounted(() => {
	void loadVisibility();
});
</script>

<template>
	<div class="admin-page">
		<header class="page-intro">
			<p class="eyebrow">Protected controls</p>
			<h1>Other-project visibility</h1>
			<p>
				Show or hide individual cards on the unlisted Other Projects page. This page has no application login
				form; production access is enforced by the web server before the page or mutation API is reached.
			</p>
		</header>

		<div class="admin-actions">
			<RouterLink class="section-link" to="/other-projects">Open Other Projects</RouterLink>
			<span>{{ otherProjects.length }} managed cards</span>
		</div>

		<p v-if="isLoading" class="notice" role="status">Loading saved visibility settings…</p>
		<p v-if="errorMessage" class="notice notice-error" role="alert">{{ errorMessage }}</p>
		<p v-if="statusMessage" class="notice notice-success" role="status">{{ statusMessage }}</p>

		<section class="control-list" aria-label="Project visibility controls">
			<article v-for="project in otherProjects" :key="project.slug" class="control-row section-panel">
				<div class="project-copy">
					<span class="category">{{ project.category }}</span>
					<h2>{{ project.name }}</h2>
					<p>{{ project.status }} · {{ project.timeframe }}</p>
				</div>
				<button
					:aria-label="`${isProjectVisible(project) ? 'Hide' : 'Show'} ${project.name}`"
					:aria-pressed="isProjectVisible(project)"
					class="visibility-button"
					:class="{ 'is-hidden': !isProjectVisible(project) }"
					:disabled="isLoading || Boolean(pendingSlug)"
					type="button"
					@click="toggleVisibility(project)"
				>
					<span class="eye-icon" :class="{ crossed: !isProjectVisible(project) }" aria-hidden="true">👁︎</span>
					<span>{{ isProjectVisible(project) ? "Shown" : "Hidden" }}</span>
				</button>
			</article>
		</section>
	</div>
</template>

<style scoped>
.admin-page {
	display: flex;
	flex-direction: column;
	gap: 1.4rem;
}

.admin-actions {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 1rem;
	color: var(--color-text-muted);
	font-size: 0.92rem;
}

.notice {
	border: 1px solid var(--color-border-strong);
	border-radius: var(--radius-md);
	background: var(--color-surface-strong);
	color: var(--color-text-muted);
	padding: 0.85rem 1rem;
}

.notice-error {
	border-color: #d8b8b2;
	background: #fbefed;
	color: #783c34;
}

.notice-success {
	border-color: #bdd9c4;
	background: #edf7ef;
	color: #285b36;
}

.control-list {
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
}

.control-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 1.25rem;
	padding: 1rem 1.15rem;
}

.project-copy {
	display: flex;
	flex-direction: column;
	gap: 0.25rem;
}

.category {
	color: var(--color-highlight);
	font-size: 0.7rem;
	font-weight: 800;
	letter-spacing: 0.1em;
	text-transform: uppercase;
}

.project-copy h2 {
	font-family: var(--font-body);
	font-size: 1.04rem;
	line-height: 1.35;
}

.project-copy p {
	color: var(--color-text-muted);
	font-size: 0.88rem;
}

.visibility-button {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	gap: 0.5rem;
	min-width: 7.5rem;
	border: 1px solid #b9d5c1;
	border-radius: 999px;
	background: #edf7ef;
	color: #285b36;
	cursor: pointer;
	font-weight: 800;
	padding: 0.66rem 0.9rem;
}

.visibility-button.is-hidden {
	border-color: #d4c5bd;
	background: #f2ece8;
	color: #69564c;
}

.visibility-button:disabled {
	cursor: wait;
	opacity: 0.62;
}

.eye-icon {
	position: relative;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	font-size: 1.1rem;
	font-variant-emoji: text;
	line-height: 1;
}

.eye-icon.crossed::after {
	position: absolute;
	width: 1.35rem;
	height: 2px;
	background: currentcolor;
	content: "";
	transform: rotate(-42deg);
}

@media (max-width: 640px) {
	.admin-actions,
	.control-row {
		align-items: flex-start;
		flex-direction: column;
	}

	.visibility-button {
		width: 100%;
	}
}
</style>

<route lang="yaml">
meta:
    layout: default
    title: Project Visibility | Jacob Anderson
    description: Protected visibility controls for Jacob Anderson's other-project index.
    robots: noindex,nofollow
</route>
