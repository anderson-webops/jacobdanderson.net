<script lang="ts" setup>
import { computed } from "vue";
import { useMainStore } from "~/stores";
import { toAnchor } from "~/utils/anchor";

defineOptions({ name: "IndexPage" });

const store = useMainStore();
const profile = computed(() => store.userProfile);
const featuredProjects = computed(() => store.featuredProjects);
const currentRole = computed(() => profile.value.experience.find(item => item.category === "patent")!);
</script>

<template>
	<div class="landing">
		<section class="hero">
			<div class="hero-copy">
				<p class="hero-name">{{ profile.name }}</p>
				<h1>{{ currentRole.title }}</h1>
				<p class="firm">{{ currentRole.organization }} · {{ profile.location }}</p>
				<p class="lede">
					I support patent attorneys with technical analysis and application preparation under attorney
					supervision, drawing on a background in computer engineering, embedded systems, and research.
				</p>
				<div class="button-row">
					<RouterLink class="button-primary" to="/resume">View résumé</RouterLink>
					<RouterLink class="button-secondary" to="/experience">Experience</RouterLink>
				</div>
			</div>
			<img
				class="hero-portrait"
				src="/images/jacob-anderson.jpg"
				alt="Portrait of Jacob Anderson"
				fetchpriority="high"
				height="1200"
				width="1200"
			/>
		</section>

		<section class="glance" aria-labelledby="glance-heading">
			<h2 id="glance-heading" class="visually-hidden">At a glance</h2>
			<dl>
				<div>
					<dt class="label">Graduate study</dt>
					<dd>
						<strong>M.S. Computer Engineering, Georgia Tech</strong>
						<span>Expected May 2027</span>
					</dd>
				</div>
				<div>
					<dt class="label">Research</dt>
					<dd>
						<strong>Co-author, ISCAS 2025</strong>
						<span>OSCRE circuit simulation framework</span>
					</dd>
				</div>
				<div>
					<dt class="label">Alongside</dt>
					<dd>
						<strong>Technical operations at AudioT</strong>
						<span>Private STEM & Spanish lessons</span>
					</dd>
				</div>
			</dl>
		</section>

		<section class="featured-section" aria-labelledby="projects-heading">
			<div class="section-head">
				<h2 id="projects-heading">Selected work</h2>
				<RouterLink class="section-link" to="/projects">All projects</RouterLink>
			</div>
			<div class="project-grid">
				<article v-for="project in featuredProjects" :key="project.name" class="feature-card">
					<p class="feature-time">{{ project.timeframe }}</p>
					<h3>{{ project.shortName }}</h3>
					<p>{{ project.preview }}</p>
					<RouterLink
						class="section-link"
						:to="`/projects#${toAnchor(project.shortName)}`"
						:aria-label="`Read more about ${project.shortName}`"
					>
						Read more
					</RouterLink>
				</article>
			</div>
		</section>

		<section class="next-steps" aria-label="More from Jacob">
			<div class="next-card">
				<h2>Private lessons</h2>
				<p>One-on-one programming, STEM, math, and Spanish lessons through Classes with Jacob.</p>
				<RouterLink class="section-link" to="/classes">Explore lessons</RouterLink>
			</div>
			<div class="next-card">
				<h2>Get in touch</h2>
				<p>Questions about engineering, research, or lessons are welcome by email.</p>
				<RouterLink class="section-link" to="/contact">Contact Jacob</RouterLink>
			</div>
		</section>
	</div>
</template>

<style scoped>
.landing {
	display: flex;
	flex-direction: column;
	gap: var(--space-section);
}

.hero {
	display: grid;
	grid-template-columns: minmax(0, 1fr) minmax(0, 18rem);
	gap: 3rem;
	align-items: center;
}

.hero-copy {
	display: flex;
	flex-direction: column;
	gap: 1rem;
	min-width: 0;
}

.hero-name {
	color: var(--color-highlight);
	font-size: 0.85rem;
	font-weight: 700;
	letter-spacing: 0.14em;
	text-transform: uppercase;
}

.hero-copy h1 {
	font-size: clamp(2.6rem, 6vw, 4.25rem);
	line-height: 1.04;
	max-width: 16ch;
}

.firm {
	color: var(--color-text-muted);
	font-size: 1.1rem;
	font-weight: 550;
}

.lede {
	max-width: 54ch;
	color: var(--color-text-muted);
	font-size: 1.15rem;
	line-height: 1.65;
}

.hero-copy .button-row {
	margin-top: 0.5rem;
}

.hero-portrait {
	width: 100%;
	height: auto;
	aspect-ratio: 4 / 5;
	object-fit: cover;
	object-position: center 35%;
	border-radius: var(--radius-xl);
	box-shadow: var(--shadow-soft);
}

.glance dl {
	display: grid;
	grid-template-columns: repeat(3, minmax(0, 1fr));
	margin: 0;
	border-top: 1px solid var(--color-border);
	border-bottom: 1px solid var(--color-border);
}

.glance dl > div {
	display: flex;
	flex-direction: column;
	gap: 0.55rem;
	padding: 1.5rem 1.5rem 1.5rem 0;
}

.glance dl > div + div {
	padding-left: 1.5rem;
	border-left: 1px solid var(--color-border);
}

.glance dd {
	display: flex;
	flex-direction: column;
	gap: 0.2rem;
	margin: 0;
}

.glance strong {
	font-weight: 650;
	line-height: 1.4;
}

.glance dd span {
	color: var(--color-text-subtle);
	font-size: 0.95rem;
}

.featured-section {
	display: flex;
	flex-direction: column;
	gap: 1.5rem;
}

.project-grid {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 1.25rem;
}

.feature-card {
	display: flex;
	flex-direction: column;
	gap: 0.6rem;
	padding: var(--panel-padding-roomy);
	border: 1px solid var(--color-border);
	border-radius: var(--radius-lg);
	background: var(--color-surface-strong);
	transition:
		border-color 0.2s ease,
		box-shadow 0.2s ease;
}

.feature-card:hover {
	border-color: var(--color-border-strong);
	box-shadow: var(--shadow-card);
}

.feature-time {
	color: var(--color-text-subtle);
	font-size: 0.875rem;
	font-variant-numeric: tabular-nums;
}

.feature-card h3 {
	font-size: 1.25rem;
	line-height: 1.3;
}

.feature-card p:not(.feature-time) {
	flex: 1;
	color: var(--color-text-muted);
}

.feature-card .section-link {
	margin-top: 0.4rem;
	font-size: 0.95rem;
}

.next-steps {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 1.25rem;
}

.next-card {
	display: flex;
	flex-direction: column;
	gap: 0.6rem;
	padding: var(--panel-padding-roomy);
	border-radius: var(--radius-lg);
	background: var(--color-surface-accent);
}

.next-card h2 {
	font-size: 1.45rem;
	line-height: 1.25;
}

.next-card p {
	flex: 1;
	color: var(--color-text-muted);
}

@media (max-width: 860px) {
	.hero {
		grid-template-columns: 1fr;
		gap: 2rem;
	}

	.hero-portrait {
		order: -1;
		width: 7.5rem;
		aspect-ratio: 1;
		border-radius: 50%;
	}

	.glance dl {
		grid-template-columns: 1fr;
	}

	.glance dl > div,
	.glance dl > div + div {
		padding: 1.15rem 0;
		border-left: 0;
	}

	.glance dl > div + div {
		border-top: 1px solid var(--color-border);
	}

	.project-grid,
	.next-steps {
		grid-template-columns: 1fr;
	}
}
</style>

<route lang="yaml">
meta:
    layout: default
    title: Jacob Anderson
    description: Jacob Anderson is a Patent Technical Specialist at Meunier Carlin & Curfman, with a background in computer engineering, research, and teaching.
</route>
