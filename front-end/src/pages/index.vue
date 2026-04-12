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
const topEducation = computed(() => profile.value.education[0]);
const featuredTools = computed(() => [
	...profile.value.skills.languages.slice(0, 5),
	...profile.value.skills.frameworks.slice(0, 5)
]);
const githubProfile = computed(() => profile.value.profiles[0]);
const resumeRequest = computed(() => profile.value.profiles[2]);
const featuredPublication = computed(() => profile.value.publications[0]);
</script>

<template>
	<div class="landing">
		<section class="hero">
			<div class="hero-copy">
				<p class="eyebrow">Professional Portfolio</p>
				<h1>{{ profile.headline }}</h1>
				<p class="lede">{{ profile.summary }}</p>

				<div class="button-row">
					<RouterLink class="button-primary" to="/projects">View engineering work</RouterLink>
					<a class="button-secondary" :href="githubProfile.href" rel="noopener" target="_blank"
						>View GitHub</a
					>
				</div>

				<dl class="hero-details">
					<div>
						<dt>Location</dt>
						<dd>{{ profile.location }}</dd>
					</div>
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
				</dl>

				<div class="verification-strip">
					<a :href="resumeRequest.href">Request résumé</a>
					<a :href="featuredPublication.href" rel="noopener" target="_blank">View OSCRE publication</a>
					<RouterLink to="/contact">Start a conversation</RouterLink>
				</div>
			</div>

			<aside class="hero-aside section-panel">
				<div class="aside-block">
					<span class="aside-label">Current focus</span>
					<h2>{{ topEducation.program }}</h2>
					<p>{{ topEducation.institution }}</p>
					<span class="aside-meta">{{ topEducation.timeframe }}</span>
				</div>

				<div class="aside-divider" />

				<div class="aside-block">
					<span class="aside-label">Verification</span>
					<p>{{ featuredPublication.title }}</p>
					<a :href="featuredPublication.href" rel="noopener" target="_blank">Open publication record</a>
				</div>
			</aside>
		</section>

		<section class="practice-grid">
			<article class="practice-card section-panel">
				<span class="practice-label">Engineering</span>
				<h2>Embedded and software systems that stay dependable outside the lab.</h2>
				<p>
					I work across firmware, telemetry, analysis workflows, and user-facing interfaces with an emphasis
					on maintainability and disciplined execution.
				</p>
			</article>

			<article class="practice-card section-panel">
				<span class="practice-label">Research</span>
				<h2>Tooling and technical workflows that make complex work easier to repeat.</h2>
				<p>
					From signal processing pipelines to simulation environments, I focus on building systems that are
					clear, testable, and practical for teams to use.
				</p>
			</article>

			<article class="practice-card section-panel">
				<span class="practice-label">Instruction</span>
				<h2>Teaching that stays structured, practical, and measurable.</h2>
				<p>
					I teach programming, STEM, and Spanish through project-based instruction that emphasizes
					understanding, execution, and clear progress.
				</p>
			</article>
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
				<p class="eyebrow">Instruction & Curriculum</p>
				<h2>Teaching remains part of the work, but it sits on its own clearly defined track.</h2>
				<p>
					I teach private lessons and support instructor quality with the same structured, systems-minded
					approach I bring to engineering work.
				</p>
			</div>

			<div class="instruction-card">
				<span class="instruction-label">{{ instructionExperience.organization }}</span>
				<h3>{{ instructionExperience.title }}</h3>
				<p>{{ instructionExperience.summary }}</p>
				<RouterLink class="section-link" to="/classes">View teaching details</RouterLink>
			</div>
		</section>

		<section class="capabilities section-panel">
			<div class="capabilities-copy">
				<p class="eyebrow">Technical Foundation</p>
				<h2>Broad coverage, practical scope, and communication that stays clear as projects grow.</h2>
				<p>
					I work comfortably across embedded systems, modern web stacks, data analysis, and instruction, which
					helps reduce handoff friction and keeps technical decisions aligned with delivery.
				</p>
			</div>

			<div class="capability-grid">
				<div class="capability-card">
					<span class="capability-label">Core tools</span>
					<div class="tag-list">
						<span v-for="(tool, index) in featuredTools" :key="index" class="tag">
							{{ tool }}
						</span>
					</div>
				</div>

				<div class="capability-card">
					<span class="capability-label">Profiles</span>
					<div class="profile-links">
						<a
							v-for="item in profile.profiles"
							:key="item.href"
							:href="item.href"
							rel="noopener"
							target="_blank"
						>
							<strong>{{ item.label }}</strong>
							<span>{{ item.description }}</span>
						</a>
					</div>
				</div>
			</div>
		</section>
	</div>
</template>

<style scoped>
.landing {
	display: flex;
	flex-direction: column;
	gap: 2.8rem;
	padding-bottom: 1rem;
}

.hero {
	display: grid;
	grid-template-columns: minmax(0, 1.55fr) minmax(320px, 0.8fr);
	gap: 2rem;
	align-items: start;
}

.hero-copy {
	display: flex;
	flex-direction: column;
	gap: 1.45rem;
	padding-top: 0.4rem;
}

.hero-copy h1 {
	font-size: clamp(2.85rem, 6.2vw, 4.85rem);
	line-height: 0.98;
	letter-spacing: -0.03em;
	max-width: 8.6ch;
	text-wrap: balance;
}

.lede {
	max-width: 44rem;
	color: var(--color-text-muted);
	font-size: 1.08rem;
	line-height: 1.82;
}

.hero-details {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
	gap: 1rem;
	margin: 0;
}

.hero-details div {
	min-width: 0;
	padding-top: 1rem;
	border-top: 1px solid var(--color-border);
}

.hero-details dt,
.hero-details dd {
	margin: 0;
}

.hero-details dt {
	color: var(--color-text-muted);
	font-size: 0.76rem;
	font-weight: 700;
	letter-spacing: 0.12em;
	margin-bottom: 0.42rem;
	text-transform: uppercase;
}

.hero-details dd,
.hero-details a {
	color: var(--color-text);
	display: block;
	font-weight: 600;
	overflow-wrap: anywhere;
	text-decoration: none;
}

.verification-strip {
	display: flex;
	flex-wrap: wrap;
	gap: 0.75rem 1rem;
	padding-top: 0.25rem;
}

.verification-strip a {
	color: var(--color-accent);
	font-size: 0.92rem;
	font-weight: 700;
	text-decoration: none;
}

.hero-aside {
	padding: 1.65rem;
	display: flex;
	flex-direction: column;
	gap: 1.4rem;
}

.aside-block {
	display: flex;
	flex-direction: column;
	gap: 0.8rem;
}

.aside-label,
.practice-label,
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

.practice-grid,
.experience-grid {
	display: grid;
	grid-template-columns: repeat(3, minmax(0, 1fr));
	gap: 1.2rem;
}

.practice-card,
.feature-card {
	padding: 1.55rem;
	display: flex;
	flex-direction: column;
	gap: 0.95rem;
}

.practice-card h2,
.feature-card h3,
.instruction-card h3 {
	font-size: 1.6rem;
	line-height: 1.14;
}

.practice-card p,
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
	gap: 1.3rem;
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
	gap: 1.2rem;
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
	gap: 1.6rem;
	padding: 1.9rem;
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
	padding: 1.3rem;
	border-radius: 20px;
	background: var(--color-surface);
	border: 1px solid var(--color-border);
	display: flex;
	flex-direction: column;
	gap: 0.85rem;
}

.capabilities {
	display: grid;
	grid-template-columns: minmax(0, 1fr) minmax(320px, 0.95fr);
	gap: 1.8rem;
	padding: 2rem;
}

.capabilities-copy {
	display: flex;
	flex-direction: column;
	gap: 1rem;
}

.capabilities-copy h2 {
	font-size: clamp(2rem, 4.5vw, 2.7rem);
	line-height: 1.05;
	max-width: 16ch;
}

.capabilities-copy p,
.capability-card p {
	color: var(--color-text-muted);
	line-height: 1.75;
}

.capability-grid {
	display: grid;
	gap: 1rem;
}

.capability-card {
	padding: 1.35rem;
	border-radius: 20px;
	background: var(--color-surface);
	border: 1px solid var(--color-border);
	display: flex;
	flex-direction: column;
	gap: 0.9rem;
}

.profile-links {
	display: flex;
	flex-direction: column;
	gap: 0.85rem;
}

.profile-links a {
	display: flex;
	flex-direction: column;
	gap: 0.18rem;
	text-decoration: none;
}

.profile-links a strong {
	color: var(--color-text);
}

.profile-links a span {
	color: var(--color-text-muted);
	line-height: 1.6;
}

@media (max-width: 960px) {
	.hero,
	.capabilities,
	.project-grid,
	.practice-grid,
	.experience-grid,
	.instruction-section {
		grid-template-columns: 1fr;
	}

	.hero-copy h1,
	.capabilities-copy h2,
	.instruction-copy h2 {
		max-width: 9ch;
	}

	.hero-copy h1 {
		font-size: clamp(2.7rem, 8.3vw, 4.15rem);
	}
}

@media (max-width: 720px) {
	.hero-copy {
		gap: 1.2rem;
	}

	.hero-copy h1 {
		font-size: clamp(2.3rem, 12.5vw, 3.45rem);
		line-height: 1.02;
		max-width: 7.4ch;
	}

	.hero-details {
		grid-template-columns: 1fr;
	}

	.section-top {
		flex-direction: column;
		align-items: flex-start;
	}

	.hero-aside,
	.practice-card,
	.feature-card,
	.instruction-section,
	.capabilities {
		padding: 1.45rem;
	}
}
</style>

<route lang="json">
{
	"meta": {
		"layout": "default"
	}
}
</route>
