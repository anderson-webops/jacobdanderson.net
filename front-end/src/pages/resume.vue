<script lang="ts" setup>
import { computed } from "vue";
import { useMainStore } from "~/stores";

const store = useMainStore();
const profile = computed(() => store.userProfile);
const profileLinks = computed(() => profile.value.profiles.filter(item => item.href !== "/resume"));
const engineeringExperience = computed(() =>
	store.userProfile.experience.filter(item => item.category === "engineering")
);
const instructionExperience = computed(() =>
	store.userProfile.experience.filter(item => item.category === "instruction")
);

function printResume() {
	if (typeof window !== "undefined") window.print();
}
</script>

<template>
	<div class="resume-page">
		<header class="resume-hero section-panel">
			<div class="resume-top">
				<div class="resume-copy">
					<p class="eyebrow">Résumé</p>
					<h1>{{ profile.name }}</h1>
					<p class="resume-headline">{{ profile.headline }}</p>
					<p class="resume-summary">{{ profile.summary }}</p>
				</div>

				<div class="resume-actions button-row">
					<button class="button-primary" type="button" @click="printResume">Print résumé</button>
					<a class="button-secondary" :href="`mailto:${profile.email}`">Email Jacob</a>
				</div>
			</div>

			<dl class="resume-contact">
				<div>
					<dt>Email</dt>
					<dd>
						<a :href="`mailto:${profile.email}`">{{ profile.email }}</a>
					</dd>
				</div>
				<div>
					<dt>Phone</dt>
					<dd>
						<a :href="`tel:${profile.phone}`">{{ profile.phone }}</a>
					</dd>
				</div>
				<div>
					<dt>Location</dt>
					<dd>{{ profile.location }}</dd>
				</div>
				<div>
					<dt>Links</dt>
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

		<section class="resume-section">
			<div class="section-head">
				<p class="eyebrow">Experience</p>
				<h2>Engineering, research, and instruction</h2>
			</div>

			<div class="resume-grid">
				<article v-for="item in engineeringExperience" :key="item.title" class="resume-card section-panel">
					<div class="card-top">
						<span class="card-label">{{ item.organization }}</span>
						<span class="timeframe">{{ item.timeframe }}</span>
					</div>
					<h3>{{ item.title }}</h3>
					<p class="meta">{{ item.location }}</p>
					<p class="summary">{{ item.summary }}</p>
					<ul>
						<li v-for="highlight in item.highlights" :key="highlight">{{ highlight }}</li>
					</ul>
				</article>

				<article v-for="item in instructionExperience" :key="item.title" class="resume-card section-panel">
					<div class="card-top">
						<span class="card-label">{{ item.organization }}</span>
						<span class="timeframe">{{ item.timeframe }}</span>
					</div>
					<h3>{{ item.title }}</h3>
					<p class="meta">{{ item.location }}</p>
					<p class="summary">{{ item.summary }}</p>
					<ul>
						<li v-for="highlight in item.highlights" :key="highlight">{{ highlight }}</li>
					</ul>
				</article>
			</div>
		</section>

		<section class="resume-columns">
			<article class="resume-card section-panel">
				<div class="section-head">
					<p class="eyebrow">Education</p>
					<h2>Academic background</h2>
				</div>

				<div class="stack">
					<section v-for="item in profile.education" :key="item.program" class="stack-item">
						<div class="card-top">
							<span class="card-label">Program</span>
							<span class="timeframe">{{ item.timeframe }}</span>
						</div>
						<h3>{{ item.program }}</h3>
						<p class="meta">{{ item.institution }}</p>
						<ul>
							<li v-for="highlight in item.highlights" :key="highlight">{{ highlight }}</li>
						</ul>
					</section>
				</div>
			</article>

			<article class="resume-card section-panel">
				<div class="section-head">
					<p class="eyebrow">Strengths</p>
					<h2>Technical focus</h2>
				</div>

				<div class="stack">
					<section class="stack-item">
						<span class="card-label">Competencies</span>
						<ul>
							<li v-for="item in profile.skills.competencies" :key="item">{{ item }}</li>
						</ul>
					</section>

					<section class="stack-item">
						<span class="card-label">Languages & Tools</span>
						<p class="summary">{{ profile.skills.languages.slice(0, 8).join(", ") }}</p>
						<p class="summary">{{ profile.skills.frameworks.join(", ") }}</p>
					</section>

					<section class="stack-item">
						<span class="card-label">Languages Spoken</span>
						<p class="summary">{{ profile.skills.languagesSpoken.join(", ") }}</p>
					</section>
				</div>
			</article>
		</section>
	</div>
</template>

<style scoped>
.resume-page {
	display: flex;
	flex-direction: column;
	gap: 1.9rem;
}

.resume-hero,
.resume-card {
	padding: var(--panel-padding-roomy);
}

.resume-hero {
	display: flex;
	flex-direction: column;
	gap: 1.35rem;
}

.resume-top {
	display: grid;
	grid-template-columns: minmax(0, 1.3fr) auto;
	gap: 1.2rem;
	align-items: start;
}

.resume-copy {
	display: flex;
	flex-direction: column;
	gap: 0.8rem;
}

.resume-copy h1 {
	font-size: 3.75rem;
	line-height: 1.05;
}

.resume-headline {
	color: var(--color-accent);
	font-weight: 700;
	letter-spacing: 0.02em;
}

.resume-summary,
.meta,
.summary,
.resume-contact dd,
.resume-card ul {
	color: var(--color-text-muted);
	line-height: 1.72;
}

.resume-contact {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
	gap: 1rem;
	margin: 0;
}

.resume-contact div {
	min-width: 0;
	padding-top: 1rem;
	border-top: 1px solid var(--color-border);
}

.resume-contact dt,
.resume-contact dd {
	margin: 0;
}

.resume-contact dt,
.card-label {
	color: var(--color-highlight);
	font-size: 0.76rem;
	font-weight: 700;
	letter-spacing: 0.12em;
	text-transform: uppercase;
}

.resume-links {
	display: flex;
	flex-wrap: wrap;
	gap: 0.45rem 0.9rem;
}

.resume-contact a,
.resume-links a {
	text-decoration: none;
}

.section-head {
	display: flex;
	flex-direction: column;
	gap: 0.55rem;
}

.section-head h2 {
	font-size: 2rem;
}

.resume-grid,
.resume-columns {
	display: grid;
	gap: 1.1rem;
}

.resume-grid {
	grid-template-columns: repeat(2, minmax(0, 1fr));
}

.resume-columns {
	grid-template-columns: repeat(2, minmax(0, 1fr));
}

.resume-card {
	display: flex;
	flex-direction: column;
	gap: 1rem;
}

.card-top {
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: 0.75rem;
}

.timeframe {
	color: var(--color-accent);
	font-size: 0.92rem;
	font-weight: 700;
}

.resume-card h3 {
	font-size: 1.38rem;
	line-height: 1.2;
}

.resume-card ul {
	margin: 0;
	padding-left: 1.1rem;
	display: flex;
	flex-direction: column;
	gap: 0.55rem;
}

.stack {
	display: flex;
	flex-direction: column;
	gap: 1rem;
}

.stack-item {
	display: flex;
	flex-direction: column;
	gap: 0.65rem;
}

@media (max-width: 960px) {
	.resume-top,
	.resume-grid,
	.resume-columns {
		grid-template-columns: 1fr;
	}
}

@media (max-width: 720px) {
	.resume-copy h1 {
		font-size: 2.65rem;
	}

	.section-head h2 {
		font-size: 1.75rem;
	}

	.resume-hero,
	.resume-card {
		padding: var(--panel-padding);
	}

	.card-top {
		flex-direction: column;
		align-items: flex-start;
	}
}

@media print {
	.resume-page {
		gap: 1rem;
	}

	.resume-hero,
	.resume-card {
		padding: 1rem;
		border-color: rgba(21, 34, 51, 0.12);
		box-shadow: none;
		break-inside: avoid;
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
    description: Printable résumé for Jacob Anderson covering engineering work, teaching, education, and contact details.
</route>
