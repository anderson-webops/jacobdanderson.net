<script lang="ts" setup>
import { computed } from "vue";
import { useMainStore } from "~/stores";

defineOptions({ name: "IndexPage" });

const store = useMainStore();
const profile = computed(() => store.userProfile);
const featuredProjects = computed(() => store.featuredProjects);
const currentRole = computed(() => profile.value.experience.find(item => item.category === "patent")!);
const linkedinProfile = computed(() => profile.value.profiles.find(item => item.label === "LinkedIn")!);
const githubProfile = computed(() => profile.value.profiles.find(item => item.label === "GitHub")!);
</script>

<template>
	<div class="landing">
		<section class="hero">
			<div class="hero-copy">
				<p class="eyebrow">Jacob Anderson</p>
				<h1>{{ currentRole.title }}</h1>
				<p class="firm">{{ currentRole.organization }}</p>
				<p class="lede">
					I support patent attorneys with technical analysis and application preparation under attorney
					supervision. My background is in computer engineering, embedded systems, and research.
				</p>
				<p class="hero-meta">{{ profile.location }} · {{ currentRole.timeframe }}</p>
				<div class="button-row">
					<RouterLink class="button-primary" to="/experience">Professional experience</RouterLink>
					<RouterLink class="button-secondary" to="/resume">View résumé</RouterLink>
				</div>
				<div class="profile-links">
					<a :href="linkedinProfile.href" rel="noopener" target="_blank">LinkedIn</a>
					<a :href="githubProfile.href" rel="noopener" target="_blank">GitHub</a>
				</div>
			</div>
			<aside class="background-note section-panel" aria-labelledby="background-heading">
				<h2 id="background-heading">Engineering background</h2>
				<p>
					My work spans circuit simulation, sensing hardware, device deployment, and software. I’m pursuing an
					M.S. in Computer Engineering at Georgia Tech, with expected completion in May 2027.
				</p>
				<p>
					Alongside MCC, I work on technical operations at AudioT. Earlier work includes university research,
					an Epiroc capstone, and co-founding the Stride device concept.
				</p>
			</aside>
		</section>

		<section class="featured-section" aria-labelledby="projects-heading">
			<div class="section-top">
				<h2 id="projects-heading">Selected engineering projects</h2>
				<RouterLink class="section-link" to="/projects">All selected projects</RouterLink>
			</div>
			<div class="project-grid">
				<article v-for="project in featuredProjects" :key="project.name" class="feature-card section-panel">
					<span class="feature-time">{{ project.timeframe }}</span>
					<h3>{{ project.shortName }}</h3>
					<p>{{ project.preview }}</p>
					<p class="contribution">{{ project.results[1] }}</p>
					<a
						v-if="project.links[0]"
						class="section-link"
						:href="project.links[0].href"
						rel="noopener"
						target="_blank"
					>
						{{ project.links[0].label }}
					</a>
				</article>
			</div>
		</section>

		<section class="instruction-section section-panel" aria-labelledby="teaching-heading">
			<div>
				<h2 id="teaching-heading">Private lessons</h2>
				<p>
					I teach programming, STEM, math, and Spanish through Classes with Jacob, building on four years of
					instruction and instructor coaching at Juni Learning.
				</p>
			</div>
			<RouterLink class="section-link" to="/classes">Explore lessons</RouterLink>
		</section>
	</div>
</template>

<style scoped>
.landing,
.hero-copy,
.featured-section {
	display: flex;
	flex-direction: column;
}

.landing {
	gap: 2.45rem;
}

.hero {
	display: grid;
	grid-template-columns: minmax(0, 1.55fr) minmax(0, 0.8fr);
	gap: 1.7rem;
	align-items: start;
}

.hero-copy {
	gap: 1rem;
	min-width: 0;
}

.hero-copy h1 {
	font-size: clamp(2.75rem, 5.5vw, 4.4rem);
	line-height: 1.04;
	max-width: 14ch;
}

.firm {
	color: var(--color-accent);
	font-size: 1.15rem;
	font-weight: 700;
}

.lede {
	max-width: var(--text-measure);
	color: var(--color-text-muted);
	font-size: 1.08rem;
	line-height: 1.78;
}

.hero-meta,
.feature-time {
	color: var(--color-text-muted);
	font-size: 0.92rem;
}

.profile-links {
	display: flex;
	flex-wrap: wrap;
	gap: 0.75rem 1.2rem;
}

.profile-links a {
	color: var(--color-accent);
	font-weight: 700;
	text-decoration: none;
}

.background-note,
.feature-card {
	padding: var(--panel-padding);
	display: flex;
	flex-direction: column;
	gap: 0.8rem;
}

.background-note h2,
.feature-card h3 {
	font-size: 1.42rem;
	line-height: 1.2;
}

.background-note p,
.feature-card p,
.instruction-section p {
	color: var(--color-text-muted);
	line-height: 1.72;
}

.featured-section {
	gap: 1.2rem;
}

.section-top {
	display: flex;
	align-items: baseline;
	justify-content: space-between;
	gap: 1rem;
}

.section-top h2,
.instruction-section h2 {
	font-size: 2rem;
	line-height: 1.2;
}

.project-grid {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 1.1rem;
}

.instruction-section {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 1.4rem;
	padding: var(--panel-padding);
}

.instruction-section p {
	max-width: var(--text-measure);
	margin-top: 0.65rem;
}

.instruction-section > a {
	flex-shrink: 0;
}

@media (max-width: 960px) {
	.hero,
	.project-grid {
		grid-template-columns: 1fr;
	}
}

@media (max-width: 720px) {
	.section-top,
	.instruction-section {
		flex-direction: column;
		align-items: flex-start;
	}

	.section-top h2,
	.instruction-section h2 {
		font-size: 1.75rem;
	}
}
</style>

<route lang="yaml">
meta:
    layout: default
    title: Jacob Anderson
    description: Jacob Anderson is a Patent Technical Specialist at Meunier Carlin & Curfman, with a background in computer engineering, research, and teaching.
</route>
