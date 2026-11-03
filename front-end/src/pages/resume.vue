<script lang="ts" setup>
import { computed } from "vue";
import { useMainStore } from "~/stores";

const store = useMainStore();
const profile = computed(() => store.userProfile);
const profileLinks = computed(() => profile.value.profiles.filter(item => item.href !== "/resume"));
const workingLanguages = computed(() =>
	profile.value.skills.languagesSpoken.filter(item => !item.includes("(elementary)"))
);
const elementaryLanguages = computed(() =>
	profile.value.skills.languagesSpoken.filter(item => item.includes("(elementary)"))
);
const professionalExperience = computed(() =>
	store.userProfile.experience.filter(item => item.category === "patent" || item.category === "engineering")
);
const additionalExperience = computed(() =>
	store.userProfile.experience.filter(item => item.category === "instruction" || item.category === "leadership")
);

function printResume() {
	if (typeof window !== "undefined") window.print();
}
</script>

<template>
	<div class="resume-page">
		<header class="resume-hero">
			<div class="resume-top">
				<div class="resume-copy">
					<p class="eyebrow">Résumé</p>
					<h1>{{ profile.name }}</h1>
					<p class="resume-headline">{{ profile.headline }}</p>
				</div>

				<div class="resume-actions button-row">
					<a class="button-primary" download href="/resume/jacob-anderson-resume.pdf">Download PDF</a>
					<button class="button-secondary" type="button" @click="printResume">Print</button>
				</div>
			</div>

			<p class="resume-summary">{{ profile.summary }}</p>

			<dl class="resume-contact">
				<div>
					<dt class="label">Email</dt>
					<dd>
						<a :href="`mailto:${profile.email}`">{{ profile.email }}</a>
					</dd>
				</div>
				<div>
					<dt class="label">Location</dt>
					<dd>{{ profile.location }}</dd>
				</div>
				<div>
					<dt class="label">Links</dt>
					<dd class="resume-links">
						<a
							v-for="item in profileLinks"
							:key="item.href"
							:href="item.href"
							rel="noopener"
							target="_blank"
						>
							{{ item.label }}
						</a>
					</dd>
				</div>
			</dl>
		</header>

		<div class="resume-body">
			<div class="resume-main">
				<section class="resume-section" aria-labelledby="professional-heading">
					<div class="section-head">
						<h2 id="professional-heading">Professional experience</h2>
					</div>
					<div class="resume-grid">
						<ExperienceEntry
							v-for="item in professionalExperience"
							:key="`${item.organization}-${item.title}`"
							:class="{ 'current-role': item.category === 'patent' }"
							:item="item"
							compact
							reference
						/>
					</div>
				</section>

				<section class="resume-section" aria-labelledby="additional-heading">
					<div class="section-head">
						<h2 id="additional-heading">Teaching & leadership</h2>
					</div>
					<div class="resume-grid">
						<ExperienceEntry
							v-for="item in additionalExperience"
							:key="`${item.organization}-${item.title}`"
							:item="item"
							compact
							reference
						/>
					</div>
				</section>
			</div>

			<aside class="resume-aside">
				<section class="resume-card" aria-labelledby="education-heading">
					<h2 id="education-heading">Education</h2>
					<div class="stack">
						<section v-for="item in profile.education" :key="item.program" class="stack-item">
							<span class="timeframe">{{ item.timeframe }}</span>
							<h3>{{ item.program }}</h3>
							<p class="meta">{{ item.institution }}</p>
							<ul class="bullet-list">
								<li v-for="highlight in item.highlights" :key="highlight">{{ highlight }}</li>
							</ul>
						</section>
					</div>
				</section>

				<section class="resume-card" aria-labelledby="skills-heading">
					<h2 id="skills-heading">Skills</h2>
					<div class="stack">
						<section v-for="group in profile.skills.groups" :key="group.label" class="stack-item">
							<h3 class="label">{{ group.label }}</h3>
							<ul class="tag-list">
								<li v-for="skill in group.items" :key="skill" class="tag">{{ skill }}</li>
							</ul>
						</section>

						<section class="stack-item">
							<h3 class="label">Competencies</h3>
							<ul class="bullet-list">
								<li v-for="item in profile.skills.competencies" :key="item">{{ item }}</li>
							</ul>
						</section>

						<section class="stack-item">
							<h3 class="label">Languages spoken</h3>
							<p class="summary working-languages">{{ workingLanguages.join(", ") }}</p>
							<p v-if="elementaryLanguages.length" class="elementary-languages">
								{{ elementaryLanguages.join(", ") }}
							</p>
						</section>
					</div>
				</section>
			</aside>
		</div>
	</div>
</template>

<style scoped>
.resume-page {
	display: flex;
	flex-direction: column;
	gap: 3rem;
}

.resume-hero {
	display: flex;
	flex-direction: column;
	gap: 1.25rem;
	padding-bottom: 2rem;
	border-bottom: 1px solid var(--color-border);
}

.resume-top {
	display: flex;
	flex-wrap: wrap;
	align-items: flex-end;
	justify-content: space-between;
	gap: 1.25rem 2rem;
}

.resume-copy {
	display: flex;
	flex-direction: column;
	gap: 0.6rem;
}

.resume-copy h1 {
	font-size: clamp(2.4rem, 6vw, 3.5rem);
	line-height: 1.05;
}

.resume-headline {
	color: var(--color-accent);
	font-size: 1.1rem;
	font-weight: 600;
}

.resume-summary {
	color: var(--color-text-muted);
	font-size: 1.08rem;
	max-width: 70ch;
}

.resume-contact {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
	gap: 1rem 2rem;
	margin: 0;
}

.resume-contact div {
	display: flex;
	flex-direction: column;
	gap: 0.2rem;
	min-width: 0;
}

.resume-contact dd {
	margin: 0;
	color: var(--color-text-muted);
}

.resume-links {
	display: flex;
	flex-wrap: wrap;
	gap: 0.25rem 1rem;
}

.resume-contact a {
	color: var(--color-accent);
	font-weight: 600;
	text-decoration: none;
}

.resume-contact a:hover {
	text-decoration: underline;
}

.resume-body {
	display: grid;
	grid-template-columns: minmax(0, 1fr) minmax(0, 19rem);
	gap: 3.5rem;
	align-items: start;
}

.resume-main {
	display: flex;
	flex-direction: column;
	gap: 3rem;
	min-width: 0;
}

/* The résumé column is narrow, so dates sit above titles instead of in a gutter. */
.resume-main :deep(.experience-entry) {
	grid-template-columns: minmax(0, 1fr);
}

.resume-main :deep(.entry-time) {
	padding-top: 0;
}

.resume-section {
	display: flex;
	flex-direction: column;
}

.resume-grid {
	display: flex;
	flex-direction: column;
}

.resume-aside {
	display: flex;
	flex-direction: column;
	gap: 1.25rem;
}

.resume-card {
	display: flex;
	flex-direction: column;
	gap: 1.1rem;
	padding: var(--panel-padding);
	border: 1px solid var(--color-border);
	border-radius: var(--radius-lg);
	background: var(--color-surface-strong);
}

.resume-card > h2 {
	font-size: 1.35rem;
}

.stack {
	display: flex;
	flex-direction: column;
	gap: 1.25rem;
}

.stack-item {
	display: flex;
	flex-direction: column;
	gap: 0.45rem;
}

.stack-item + .stack-item {
	padding-top: 1.25rem;
	border-top: 1px solid var(--color-border);
}

.timeframe {
	color: var(--color-text-subtle);
	font-size: 0.85rem;
	font-variant-numeric: tabular-nums;
}

.resume-card h3:not(.label) {
	font-size: 1rem;
	line-height: 1.35;
}

.meta,
.summary {
	color: var(--color-text-muted);
	font-size: 0.95rem;
}

.resume-card .bullet-list {
	font-size: 0.92rem;
	gap: 0.35rem;
}

.resume-card .tag {
	font-size: 0.8rem;
	padding: 0.2rem 0.6rem;
}

.resume-card .tag-list {
	gap: 0.35rem;
}

.elementary-languages {
	color: var(--color-text-subtle);
	font-size: 0.9rem;
}

@media (max-width: 900px) {
	.resume-body {
		grid-template-columns: 1fr;
	}
}

@media print {
	.resume-page {
		display: block;
	}

	.resume-hero {
		gap: 0.5rem;
		margin-bottom: 1rem;
		padding-bottom: 0.75rem;
	}

	.resume-copy {
		gap: 0.2rem;
	}

	.resume-copy h1 {
		font-size: 2rem;
	}

	.resume-body,
	.resume-main,
	.resume-aside {
		display: block;
	}

	.resume-section,
	.resume-card {
		margin-bottom: 1rem;
	}

	.resume-card {
		padding: 0;
		border: 0;
		background: white;
		box-shadow: none;
		gap: 0.45rem;
	}

	.section-head {
		padding-bottom: 0.3rem;
	}

	.section-head h2,
	.resume-card > h2 {
		font-size: 1.3rem;
	}

	.stack,
	.stack-item {
		gap: 0.3rem;
	}

	.stack-item {
		break-inside: avoid;
	}

	.stack-item + .stack-item {
		padding-top: 0.5rem;
	}

	.resume-page :deep(p),
	.resume-page :deep(ul) {
		line-height: 1.4;
	}

	.resume-main :deep(.experience-entry) {
		grid-template-columns: 8.5rem minmax(0, 1fr);
	}

	.resume-page :deep(.entry-heading h3) {
		font-size: 1.05rem;
		text-wrap: wrap;
	}

	.resume-card .tag-list {
		display: block;
	}

	.resume-card .tag {
		display: inline;
		padding: 0;
		background: none;
		color: inherit;
		font-size: inherit;
	}

	.resume-card .tag:not(:last-child)::after {
		content: ", ";
	}

	.resume-actions {
		display: none;
	}
}
</style>

<route lang="yaml">
meta:
    layout: default
    title: Résumé | Jacob Anderson
    description: Résumé for Jacob Anderson covering patent work at Meunier Carlin & Curfman, engineering, research, teaching, education, and technical skills.
</route>
