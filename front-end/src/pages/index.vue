<script lang="ts" setup>
import { computed } from "vue";
import { useMainStore } from "~/stores";

defineOptions({
	name: "IndexPage"
});

const store = useMainStore();
const profile = computed(() => store.userProfile);
const featuredExperience = computed(() => store.featuredEngineeringExperience);
const instructionExperience = computed(() => store.instructionExperience[0]);
const featuredProjects = computed(() => store.featuredProjects);
const heroHeadlineLines = ["Computer", "Engineer,", "Cofounder,", "and Educator"];
const githubProfile = computed(() => profile.value.profiles[0]);
const teachingProfile = computed(() => profile.value.profiles[1]);
const featuredPublication = computed(() => profile.value.publications[0]);
const engineeringPractice = computed(() => profile.value.practices.engineering);
const teachingPractice = computed(() => profile.value.practices.teaching);
</script>

<template>
	<div class="landing">
		<section class="hero">
			<div class="hero-copy">
				<p class="eyebrow">Professional Portfolio</p>
				<h1>
					<span v-for="line in heroHeadlineLines" :key="line">{{ line }}</span>
				</h1>
				<p class="lede">{{ profile.summary }}</p>

				<div class="button-row">
					<RouterLink class="button-primary" to="/projects">View engineering work</RouterLink>
					<a class="button-secondary" :href="teachingProfile.href" rel="noopener" target="_blank">
						Visit teaching site
					</a>
				</div>

				<div class="proof-strip">
					<a :href="githubProfile.href" rel="noopener" target="_blank">View GitHub</a>
					<a :href="featuredPublication.href" rel="noopener" target="_blank">View OSCRE publication</a>
				</div>
			</div>

			<aside class="hero-aside section-panel">
				<div class="aside-block">
					<span class="aside-label">{{ engineeringPractice.label }}</span>
					<h2>{{ engineeringPractice.title }}</h2>
					<p>{{ engineeringPractice.summary }}</p>
					<span class="aside-meta">{{ engineeringPractice.details }}</span>
				</div>

				<div class="aside-divider" />

				<div class="aside-block">
					<span class="aside-label">{{ teachingPractice.label }}</span>
					<h2>{{ teachingPractice.title }}</h2>
					<p>{{ teachingPractice.summary }}</p>
					<span class="aside-meta">{{ teachingPractice.details }}</span>
				</div>
			</aside>
		</section>

		<section class="featured-section">
			<div class="section-top">
				<div>
					<p class="eyebrow">Engineering & Research</p>
					<h2>Selected technical work</h2>
				</div>
				<RouterLink class="section-link" to="/experience">View full experience</RouterLink>
			</div>

			<div class="experience-grid">
				<article v-for="(item, index) in featuredExperience" :key="index" class="feature-card section-panel">
					<div class="feature-top">
						<span class="feature-kicker">{{ item.organization }}</span>
						<span class="feature-time">{{ item.timeframe }}</span>
					</div>
					<h3>{{ item.title }}</h3>
					<p class="feature-summary">{{ item.summary }}</p>
					<ul class="feature-list">
						<li v-for="(highlight, highlightIndex) in item.highlights.slice(0, 2)" :key="highlightIndex">
							{{ highlight }}
						</li>
					</ul>
				</article>
			</div>
		</section>

		<section class="featured-section">
			<div class="section-top">
				<div>
					<p class="eyebrow">Selected Projects</p>
					<h2>Flagship builds and proof points</h2>
				</div>
				<RouterLink class="section-link" to="/projects">Browse all projects</RouterLink>
			</div>

			<div class="project-grid">
				<article v-for="(project, index) in featuredProjects" :key="index" class="feature-card section-panel">
					<div class="feature-top">
						<span class="feature-kicker">Project</span>
						<span class="feature-time">{{ project.timeframe }}</span>
					</div>
					<h3>{{ project.name }}</h3>
					<p class="feature-description">{{ project.description }}</p>
					<p class="feature-role"><strong>Role:</strong> {{ project.role }}</p>
					<ul class="feature-list">
						<li v-for="(result, resultIndex) in project.results.slice(0, 2)" :key="resultIndex">
							{{ result }}
						</li>
					</ul>
					<div v-if="project.links.length" class="artifact-links">
						<a
							v-for="link in project.links"
							:key="link.href"
							:href="link.href"
							rel="noopener"
							target="_blank"
						>
							{{ link.label }}
						</a>
					</div>
				</article>
			</div>
		</section>

		<section class="instruction-section section-panel">
			<div class="instruction-copy">
				<p class="eyebrow">Teaching</p>
				<h2>Private instruction and instructor training.</h2>
				<p>
					I teach one-on-one lessons in programming, STEM, and Spanish, and I support instructor quality and
					curriculum delivery through training work.
				</p>
			</div>

			<div class="instruction-card">
				<span class="instruction-label">{{ instructionExperience.organization }}</span>
				<h3>{{ instructionExperience.title }}</h3>
				<p>Standard lessons run 50 minutes, and scheduling and tuition live on the dedicated teaching site.</p>
				<a class="section-link" :href="teachingProfile.href" rel="noopener" target="_blank"
					>Visit teaching site</a
				>
			</div>
		</section>
	</div>
</template>

<style scoped>
.landing {
	display: flex;
	flex-direction: column;
	gap: 2.45rem;
	padding-bottom: 0.75rem;
}

.hero {
	display: grid;
	grid-template-columns: minmax(0, 1.55fr) minmax(320px, 0.8fr);
	gap: 1.7rem;
	align-items: start;
}

.hero-copy {
	display: flex;
	flex-direction: column;
	gap: 1.3rem;
	padding-top: 0.2rem;
}

.hero-copy h1 {
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	gap: 0.06em;
	font-size: clamp(2.7rem, 5.8vw, 4.6rem);
	line-height: 0.94;
	letter-spacing: -0.03em;
	max-width: none;
}

.hero-copy h1 span {
	display: block;
	white-space: nowrap;
}

.lede {
	max-width: var(--text-measure);
	color: var(--color-text-muted);
	font-size: 1.08rem;
	line-height: 1.82;
}

.proof-strip {
	display: flex;
	flex-wrap: wrap;
	gap: 0.75rem 1.2rem;
}

.proof-strip a {
	color: var(--color-accent);
	font-size: 0.92rem;
	font-weight: 700;
	text-decoration: none;
}

.hero-aside {
	padding: var(--panel-padding-roomy);
	display: flex;
	flex-direction: column;
	gap: 1.25rem;
}

.aside-block {
	display: flex;
	flex-direction: column;
	gap: 0.8rem;
}

.aside-label,
.feature-kicker,
.instruction-label,
.capability-label {
	color: var(--color-highlight);
	font-size: 0.76rem;
	font-weight: 700;
	letter-spacing: 0.12em;
	text-transform: uppercase;
}

.aside-block h2 {
	font-size: 1.95rem;
	line-height: 1.08;
}

.aside-block p {
	color: var(--color-text-muted);
	line-height: 1.72;
}

.aside-block a {
	color: var(--color-accent);
	font-weight: 700;
	text-decoration: none;
}

.aside-meta {
	color: var(--color-accent);
	font-weight: 700;
}

.aside-divider {
	height: 1px;
	background: var(--color-border);
}

.experience-grid {
	display: grid;
	grid-template-columns: repeat(3, minmax(0, 1fr));
	gap: 1.1rem;
}

.feature-card {
	padding: var(--panel-padding);
	display: flex;
	flex-direction: column;
	gap: 0.95rem;
}

.feature-card h3,
.instruction-card h3 {
	font-size: 1.6rem;
	line-height: 1.14;
}

.feature-description,
.feature-summary,
.feature-list,
.feature-role,
.instruction-card p {
	color: var(--color-text-muted);
	line-height: 1.72;
}

.featured-section {
	display: flex;
	flex-direction: column;
	gap: 1.2rem;
}

.section-top {
	display: flex;
	align-items: end;
	justify-content: space-between;
	gap: 1rem;
}

.section-top h2 {
	font-size: clamp(1.9rem, 3.6vw, 2.4rem);
	margin-top: 0.55rem;
}

.project-grid {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 1.1rem;
}

.feature-top {
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: 0.8rem;
}

.feature-time {
	color: var(--color-accent);
	font-size: 0.92rem;
	font-weight: 700;
}

.feature-list {
	margin: 0;
	padding-left: 1.1rem;
	display: flex;
	flex-direction: column;
	gap: 0.55rem;
}

.feature-role {
	margin: 0;
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

.instruction-section {
	display: grid;
	grid-template-columns: minmax(0, 1.15fr) minmax(280px, 0.85fr);
	gap: 1.4rem;
	padding: var(--panel-padding-roomy);
}

.instruction-copy {
	display: flex;
	flex-direction: column;
	gap: 1rem;
}

.instruction-copy h2 {
	font-size: clamp(2rem, 4vw, 2.6rem);
	line-height: 1.05;
	max-width: 15ch;
}

.instruction-copy p {
	color: var(--color-text-muted);
	line-height: 1.75;
}

.instruction-card {
	padding: var(--panel-padding-compact);
	border-radius: var(--radius-md);
	background: var(--color-surface);
	border: 1px solid var(--color-border);
	display: flex;
	flex-direction: column;
	gap: 0.85rem;
}

@media (max-width: 960px) {
	.hero,
	.project-grid,
	.experience-grid,
	.instruction-section {
		grid-template-columns: 1fr;
	}

	.hero-copy h1,
	.instruction-copy h2 {
		max-width: 9ch;
	}

	.hero-copy h1 {
		gap: 0.07em;
		font-size: clamp(2.45rem, 8vw, 3.9rem);
		max-width: none;
	}
}

@media (max-width: 720px) {
	.hero-copy {
		gap: 1.2rem;
	}

	.hero-copy h1 {
		gap: 0.08em;
		font-size: clamp(2rem, 10.8vw, 3rem);
		line-height: 0.96;
	}

	.section-top {
		flex-direction: column;
		align-items: flex-start;
	}

	.hero-aside,
	.feature-card,
	.instruction-section {
		padding: var(--panel-padding);
	}

	.instruction-card {
		padding: var(--panel-padding-compact);
	}
}
</style>

<route lang="yaml">
meta:
    layout: default
    title: Jacob Anderson
    description: Engineering portfolio and teaching practice for Jacob Anderson covering embedded systems, research tooling, publications, and private instruction.
</route>
