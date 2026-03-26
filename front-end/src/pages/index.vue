<script lang="ts" setup>
import { computed } from "vue";
import { useMainStore } from "~/stores";

defineOptions({
	name: "IndexPage"
});

const store = useMainStore();
const profile = computed(() => store.userProfile);
const featuredExperience = computed(() => store.featuredExperience);
const featuredProjects = computed(() => store.featuredProjects);
const topEducation = computed(() => profile.value.education[0]);
const featuredTools = computed(() => [
	...profile.value.skills.languages.slice(0, 6),
	...profile.value.skills.frameworks.slice(0, 4)
]);
</script>

<template>
	<div class="landing">
		<section class="hero section-panel">
			<div class="hero-copy">
				<p class="eyebrow">Professional Portfolio</p>
				<h1>{{ profile.headline }}</h1>
				<p class="lede">{{ profile.summary }}</p>

				<div class="button-row">
					<RouterLink class="button-primary" to="/projects">
						View projects
					</RouterLink>
					<RouterLink class="button-secondary" to="/contact">
						Contact Jacob
					</RouterLink>
				</div>

				<dl class="hero-details">
					<div>
						<dt>Location</dt>
						<dd>{{ profile.location }}</dd>
					</div>
					<div>
						<dt>Email</dt>
						<dd>
							<a :href="`mailto:${profile.email}`">{{
								profile.email
							}}</a>
						</dd>
					</div>
					<div>
						<dt>Phone</dt>
						<dd>
							<a :href="`tel:${profile.phone}`">{{
								profile.phone
							}}</a>
						</dd>
					</div>
				</dl>
			</div>

			<div class="hero-panel">
				<div class="panel-block">
					<span class="panel-label">Current focus</span>
					<h2>{{ topEducation.program }}</h2>
					<p>{{ topEducation.institution }}</p>
					<span class="panel-meta">{{ topEducation.timeframe }}</span>
				</div>

				<div class="panel-block">
					<span class="panel-label">Primary strengths</span>
					<ul class="panel-list">
						<li
							v-for="(competency, index) in profile.skills
								.competencies"
							:key="index"
						>
							{{ competency }}
						</li>
					</ul>
				</div>
			</div>
		</section>

		<section class="focus-grid">
			<article class="focus-card section-panel">
				<span class="focus-label">Engineering</span>
				<h2>
					Embedded and software systems that behave reliably in the
					real world.
				</h2>
				<p>
					I build across hardware, firmware, data pipelines, and web
					interfaces with an emphasis on maintainability and clarity.
				</p>
			</article>

			<article class="focus-card section-panel">
				<span class="focus-label">Research</span>
				<h2>
					Tooling and workflows that make technical work easier to
					repeat.
				</h2>
				<p>
					My research work focuses on signal processing, analysis
					pipelines, and simulation tooling that support dependable
					results.
				</p>
			</article>

			<article class="focus-card section-panel">
				<span class="focus-label">Teaching</span>
				<h2>
					Instruction that makes complex subjects practical and
					approachable.
				</h2>
				<p>
					I teach programming, STEM, and Spanish with a structured,
					project-based approach tailored to each learner.
				</p>
			</article>
		</section>

		<section class="featured-section">
			<div class="section-top">
				<div>
					<p class="eyebrow">Selected Experience</p>
					<h2>Recent roles</h2>
				</div>
				<RouterLink class="section-link" to="/experience">
					Explore full timeline
				</RouterLink>
			</div>

			<div class="card-grid">
				<article
					v-for="(item, index) in featuredExperience"
					:key="index"
					class="card section-panel"
				>
					<div class="card-top">
						<span class="card-kicker">{{ item.organization }}</span>
						<span class="card-time">{{ item.timeframe }}</span>
					</div>
					<h3>{{ item.title }}</h3>
					<p class="card-location">{{ item.location }}</p>
					<ul>
						<li
							v-for="(
								highlight, highlightIndex
							) in item.highlights"
							:key="highlightIndex"
						>
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
					<h2>Recent work</h2>
				</div>
				<RouterLink class="section-link" to="/projects">
					See more work
				</RouterLink>
			</div>

			<div class="card-grid project-grid">
				<article
					v-for="(project, index) in featuredProjects"
					:key="index"
					class="card section-panel"
				>
					<div class="card-top">
						<span class="card-kicker">Project</span>
						<span class="card-time">{{ project.timeframe }}</span>
					</div>
					<h3>{{ project.name }}</h3>
					<p class="card-description">{{ project.description }}</p>
					<ul>
						<li
							v-for="(
								highlight, highlightIndex
							) in project.highlights"
							:key="highlightIndex"
						>
							{{ highlight }}
						</li>
					</ul>
				</article>
			</div>
		</section>

		<section class="capabilities section-panel">
			<div class="capabilities-copy">
				<p class="eyebrow">Technical Foundation</p>
				<h2>
					Broad engineering coverage with a bias toward practical
					execution.
				</h2>
				<p>
					I work comfortably across embedded systems, web
					applications, data analysis, and instruction, which makes it
					easier to move projects from concept to delivery without
					losing context.
				</p>
			</div>

			<div class="capabilities-grid">
				<div class="capability-card">
					<span class="capability-label"
						>Languages and frameworks</span
					>
					<div class="tag-list">
						<span
							v-for="(tool, index) in featuredTools"
							:key="index"
							class="tag"
						>
							{{ tool }}
						</span>
					</div>
				</div>

				<div class="capability-card">
					<span class="capability-label">Languages spoken</span>
					<p>{{ profile.skills.languagesSpoken.join(" · ") }}</p>
					<RouterLink class="section-link" to="/classes">
						Learn about private lessons
					</RouterLink>
				</div>
			</div>
		</section>
	</div>
</template>

<style scoped>
.landing {
	display: flex;
	flex-direction: column;
	gap: 2.5rem;
	padding-bottom: 1rem;
}

.hero {
	display: grid;
	grid-template-columns: minmax(0, 1.45fr) minmax(300px, 0.9fr);
	gap: 2rem;
	padding: 3rem;
	position: relative;
	overflow: hidden;
}

.hero::after {
	content: "";
	position: absolute;
	inset: auto -8% -10% auto;
	width: 18rem;
	height: 18rem;
	border-radius: 50%;
	background: radial-gradient(
		circle,
		rgba(167, 125, 71, 0.18),
		transparent 70%
	);
	pointer-events: none;
}

.hero-copy,
.hero-panel {
	position: relative;
	z-index: 1;
}

.hero-copy {
	display: flex;
	flex-direction: column;
	gap: 1.4rem;
}

.hero-copy h1 {
	font-size: clamp(3rem, 7vw, 5rem);
	line-height: 0.95;
	max-width: 10ch;
}

.lede {
	max-width: 42rem;
	color: var(--color-text-muted);
	font-size: 1.08rem;
	line-height: 1.8;
}

.hero-details {
	display: grid;
	grid-template-columns: repeat(3, minmax(0, 1fr));
	gap: 1rem;
}

.hero-details div {
	padding-top: 1rem;
	border-top: 1px solid rgba(17, 29, 43, 0.12);
}

.hero-details dt {
	font-size: 0.75rem;
	font-weight: 700;
	letter-spacing: 0.12em;
	text-transform: uppercase;
	color: var(--color-text-muted);
	margin-bottom: 0.45rem;
}

.hero-details dd,
.hero-details a {
	color: var(--color-text);
	font-weight: 600;
	text-decoration: none;
}

.hero-panel {
	display: flex;
	flex-direction: column;
	gap: 1rem;
}

.panel-block {
	background: rgba(23, 54, 77, 0.94);
	border-radius: 22px;
	padding: 1.5rem;
	color: rgba(255, 251, 245, 0.92);
	box-shadow: 0 20px 36px rgba(23, 54, 77, 0.16);
}

.panel-block:last-child {
	background: linear-gradient(
		180deg,
		rgba(255, 250, 243, 0.88),
		rgba(241, 231, 216, 0.82)
	);
	color: var(--color-text);
	border: 1px solid rgba(17, 29, 43, 0.08);
	box-shadow: none;
}

.panel-label,
.focus-label,
.card-kicker,
.capability-label {
	font-size: 0.76rem;
	font-weight: 700;
	letter-spacing: 0.12em;
	text-transform: uppercase;
	color: var(--color-highlight);
}

.panel-block:first-child .panel-label {
	color: rgba(215, 230, 242, 0.8);
}

.panel-block h2 {
	font-size: 1.9rem;
	line-height: 1.1;
	margin-top: 0.8rem;
	color: inherit;
}

.panel-block p {
	margin-top: 0.8rem;
	line-height: 1.7;
	color: inherit;
	opacity: 0.9;
}

.panel-meta {
	display: inline-flex;
	margin-top: 1rem;
	color: rgba(215, 230, 242, 0.88);
	font-weight: 600;
}

.panel-list {
	margin: 1rem 0 0;
	padding-left: 1.1rem;
	display: flex;
	flex-direction: column;
	gap: 0.55rem;
	color: var(--color-text-muted);
}

.focus-grid {
	display: grid;
	grid-template-columns: repeat(3, minmax(0, 1fr));
	gap: 1.2rem;
}

.focus-card {
	padding: 1.6rem;
	display: flex;
	flex-direction: column;
	gap: 1rem;
}

.focus-card h2 {
	font-size: 1.55rem;
	line-height: 1.18;
}

.focus-card p {
	color: var(--color-text-muted);
	line-height: 1.75;
}

.featured-section {
	display: flex;
	flex-direction: column;
	gap: 1.35rem;
}

.section-top {
	display: flex;
	align-items: end;
	justify-content: space-between;
	gap: 1rem;
}

.section-top h2 {
	font-size: 2rem;
	margin-top: 0.65rem;
}

.card-grid {
	display: grid;
	grid-template-columns: repeat(3, minmax(0, 1fr));
	gap: 1.2rem;
}

.project-grid {
	grid-template-columns: repeat(2, minmax(0, 1fr));
}

.card {
	padding: 1.5rem;
	display: flex;
	flex-direction: column;
	gap: 0.95rem;
}

.card-top {
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: 0.8rem;
}

.card-time {
	font-size: 0.92rem;
	font-weight: 700;
	color: var(--color-accent);
}

.card h3 {
	font-size: 1.45rem;
	line-height: 1.15;
}

.card-location,
.card-description {
	color: var(--color-text-muted);
}

.card ul {
	margin: 0;
	padding-left: 1.1rem;
	display: flex;
	flex-direction: column;
	gap: 0.55rem;
	color: var(--color-text-muted);
}

.capabilities {
	display: grid;
	grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr);
	gap: 2rem;
	padding: 2.3rem;
}

.capabilities-copy {
	display: flex;
	flex-direction: column;
	gap: 1rem;
}

.capabilities-copy h2 {
	font-size: 2.1rem;
	line-height: 1.08;
}

.capabilities-copy p,
.capability-card p {
	color: var(--color-text-muted);
	line-height: 1.75;
}

.capabilities-grid {
	display: grid;
	gap: 1rem;
}

.capability-card {
	padding: 1.4rem;
	border-radius: 20px;
	background: rgba(255, 255, 255, 0.68);
	border: 1px solid rgba(17, 29, 43, 0.08);
	display: flex;
	flex-direction: column;
	gap: 1rem;
}

@media (max-width: 960px) {
	.hero,
	.capabilities {
		grid-template-columns: 1fr;
	}

	.focus-grid,
	.card-grid,
	.project-grid {
		grid-template-columns: 1fr;
	}

	.hero-copy h1 {
		max-width: none;
	}
}

@media (max-width: 720px) {
	.hero {
		padding: 2rem 1.5rem;
	}

	.hero-details {
		grid-template-columns: 1fr;
	}

	.section-top {
		flex-direction: column;
		align-items: flex-start;
	}

	.capabilities {
		padding: 1.8rem 1.5rem;
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
