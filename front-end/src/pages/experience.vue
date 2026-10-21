<script lang="ts" setup>
import { computed } from "vue";
import { useMainStore } from "~/stores";

const store = useMainStore();
const patentExperience = computed(() => store.userProfile.experience.filter(item => item.category === "patent"));
const engineeringExperience = computed(() =>
	store.userProfile.experience.filter(item => item.category === "engineering")
);
const additionalExperience = computed(() =>
	store.userProfile.experience.filter(item => item.category === "instruction" || item.category === "leadership")
);

const sections = [
	{ id: "current", label: "Current" },
	{ id: "engineering", label: "Engineering & research" },
	{ id: "teaching", label: "Teaching & more" }
];
</script>

<template>
	<div class="experience-page">
		<header class="page-intro">
			<h1>Experience</h1>
			<p>Patent work today, built on engineering research, product development, and teaching.</p>
			<nav aria-label="Experience sections" class="jump-links">
				<a v-for="section in sections" :key="section.id" :href="`#${section.id}`">{{ section.label }}</a>
			</nav>
		</header>

		<section id="current" class="section-block" aria-labelledby="current-heading">
			<div class="section-head">
				<h2 id="current-heading">Current role</h2>
			</div>
			<ExperienceEntry
				v-for="item in patentExperience"
				:key="item.organization"
				:item="item"
				class="current-entry"
				collapsible
				open
			/>
			<p class="role-boundary">
				Patent work is performed through Meunier Carlin & Curfman under attorney supervision. This personal site
				describes my background, not an offer of legal or patent services.
			</p>
		</section>

		<section id="engineering" class="section-block" aria-labelledby="engineering-heading">
			<div class="section-head">
				<h2 id="engineering-heading">Engineering, research & product</h2>
			</div>
			<div class="timeline">
				<ExperienceEntry
					v-for="item in engineeringExperience"
					:key="`${item.organization}-${item.title}`"
					:item="item"
					collapsible
				/>
			</div>
		</section>

		<section id="teaching" class="section-block" aria-labelledby="additional-heading">
			<div class="section-head">
				<h2 id="additional-heading">Teaching & additional experience</h2>
			</div>
			<div class="timeline">
				<ExperienceEntry
					v-for="item in additionalExperience"
					:key="`${item.organization}-${item.title}`"
					:item="item"
					collapsible
				/>
			</div>
		</section>

		<aside class="resume-callout">
			<p>Prefer everything on one page?</p>
			<RouterLink class="section-link" to="/resume">View the full résumé</RouterLink>
		</aside>
	</div>
</template>

<style scoped>
.experience-page {
	display: flex;
	flex-direction: column;
	gap: 3.5rem;
}

.jump-links {
	display: flex;
	flex-wrap: wrap;
	gap: 0.5rem;
	margin-top: 0.5rem;
}

.jump-links a {
	display: inline-flex;
	align-items: center;
	min-height: 2.25rem;
	padding: 0 0.9rem;
	border: 1px solid var(--color-border-strong);
	border-radius: 999px;
	color: var(--color-text-muted);
	font-size: 0.9rem;
	font-weight: 600;
	text-decoration: none;
}

.jump-links a:hover {
	border-color: var(--color-accent);
	color: var(--color-accent);
}

.section-block {
	display: flex;
	flex-direction: column;
}

.timeline {
	display: flex;
	flex-direction: column;
}

.current-entry {
	border-top: 0;
}

.role-boundary {
	max-width: 70ch;
	margin-left: calc(var(--date-column) + 2rem);
	padding: 0.9rem 1.1rem;
	border-left: 3px solid var(--color-border-strong);
	background: var(--color-surface);
	color: var(--color-text-subtle);
	font-size: 0.9rem;
	line-height: 1.6;
}

.resume-callout {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	justify-content: space-between;
	gap: 0.75rem 1.5rem;
	padding: 1.4rem 1.6rem;
	border-radius: var(--radius-lg);
	background: var(--color-surface-accent);
}

.resume-callout p {
	font-weight: 600;
}

@media (max-width: 640px) {
	.role-boundary {
		margin-left: 0;
	}
}
</style>

<route lang="yaml">
meta:
    layout: default
    title: Experience | Jacob Anderson
    description: Jacob Anderson's current MCC role and experience in engineering, research, product development, technical operations, and instruction.
</route>
