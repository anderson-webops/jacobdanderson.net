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
</script>

<template>
	<div class="landing">
		<section class="hero">
			<div class="hero-content">
				<!--				<p class="update">Last updated {{ profile.lastUpdated }}</p> -->
				<h1>{{ profile.name }}</h1>
				<p class="headline">{{ profile.headline }}</p>
				<p class="summary">
					{{ profile.summary }}
				</p>
				<div class="hero-actions">
					<RouterLink class="btn primary" to="/projects"
						>View projects
					</RouterLink>
					<RouterLink class="btn secondary" to="/classes"
						>Book a lesson
					</RouterLink>
				</div>
				<ul class="contact">
					<li>
						<span class="label">Location</span>
						<span>{{ profile.location }}</span>
					</li>
					<li>
						<span class="label">Email</span>
						<a :href="`mailto:${profile.email}`">{{
							profile.email
						}}</a>
					</li>
					<li>
						<span class="label">Phone</span>
						<a :href="`tel:${profile.phone}`">{{
							profile.phone
						}}</a>
					</li>
				</ul>
			</div>
			<div class="hero-card">
				<h2>Current focus</h2>
				<div
					v-for="(item, index) in profile.education"
					:key="index"
					class="edu"
				>
					<p class="program">{{ item.program }}</p>
					<p class="institution">{{ item.institution }}</p>
					<p class="timeframe">{{ item.timeframe }}</p>
				</div>
			</div>
		</section>

		<section class="featured">
			<div class="section-header">
				<h2>Recent experience</h2>
				<RouterLink class="cta" to="/experience"
					>Explore full timeline →
				</RouterLink>
			</div>
			<div class="card-grid">
				<article
					v-for="(item, index) in featuredExperience"
					:key="index"
					class="card"
				>
					<h3>{{ item.title }}</h3>
					<p class="org">{{ item.organization }}</p>
					<p class="time">{{ item.timeframe }}</p>
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

		<section class="featured">
			<div class="section-header">
				<h2>Highlighted projects</h2>
				<RouterLink class="cta" to="/projects"
					>See more work →
				</RouterLink>
			</div>
			<div class="card-grid projects">
				<article
					v-for="(project, index) in featuredProjects"
					:key="index"
					class="card"
				>
					<header class="card-header">
						<h3>{{ project.name }}</h3>
						<span class="time">{{ project.timeframe }}</span>
					</header>
					<p class="description">{{ project.description }}</p>
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

		<section class="skills">
			<h2>Core strengths</h2>
			<div class="skills-grid">
				<div class="skill-card">
					<h3>Languages &amp; frameworks</h3>
					<p>{{ profile.skills.languages.join(", ") }}</p>
					<p>{{ profile.skills.frameworks.join(", ") }}</p>
				</div>
				<div class="skill-card">
					<h3>What I love working on</h3>
					<ul>
						<li
							v-for="(competency, index) in profile.skills
								.competencies"
							:key="index"
						>
							{{ competency }}
						</li>
					</ul>
				</div>
				<div class="skill-card">
					<h3>Languages</h3>
					<p>{{ profile.skills.languagesSpoken.join(" · ") }}</p>
					<RouterLink class="class-link" to="/classes"
						>Ask about tutoring →
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
	gap: 4rem;
	padding: 2rem 0 4rem;
}

.hero {
	display: grid;
	gap: 2.5rem;
	grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
	background: radial-gradient(circle at top left, #eef2ff, #ffffff 55%);
	border-radius: 20px;
	padding: 3rem;
	box-shadow: 0 20px 45px rgba(15, 23, 42, 0.12);
	position: relative;
	overflow: hidden;
}

.hero::after {
	content: "";
	position: absolute;
	inset: 0;
	border-radius: 20px;
	background: radial-gradient(
		circle at bottom right,
		rgba(37, 99, 235, 0.12),
		transparent 60%
	);
	pointer-events: none;
}

.hero-content {
	position: relative;
	z-index: 1;
	display: flex;
	flex-direction: column;
	gap: 1.5rem;
}

/*.update {
	font-size: 0.85rem;
	font-weight: 600;
	letter-spacing: 0.08em;
	text-transform: uppercase;
	color: #2563eb;
	margin: 0;
}*/

h1 {
	font-size: clamp(2.5rem, 5vw, 3.5rem);
	color: #0f172a;
	margin: 0;
}

.headline {
	font-size: 1.35rem;
	font-weight: 600;
	color: #1e293b;
	margin: 0;
}

.summary {
	color: #334155;
	margin: 0;
	line-height: 1.65;
}

.hero-actions {
	display: flex;
	flex-wrap: wrap;
	gap: 1rem;
}

.btn {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	padding: 0.85rem 1.6rem;
	border-radius: 999px;
	font-weight: 600;
	text-decoration: none;
	transition:
		transform 0.2s ease,
		box-shadow 0.2s ease;
}

.btn.primary {
	background: #2563eb;
	color: #ffffff;
	box-shadow: 0 10px 20px rgba(37, 99, 235, 0.25);
}

.btn.secondary {
	background: #ffffff;
	color: #1d4ed8;
	border: 1px solid rgba(37, 99, 235, 0.2);
}

.btn:hover {
	transform: translateY(-2px);
	box-shadow: 0 14px 28px rgba(15, 23, 42, 0.12);
}

.contact {
	list-style: none;
	margin: 0;
	padding: 0;
	display: grid;
	gap: 0.8rem;
}

.contact li {
	display: flex;
	gap: 0.75rem;
	align-items: baseline;
	color: #1f2937;
}

.label {
	font-size: 0.85rem;
	font-weight: 700;
	text-transform: uppercase;
	color: #64748b;
	letter-spacing: 0.08em;
}

.contact a {
	color: #1d4ed8;
	text-decoration: none;
}

.hero-card {
	position: relative;
	z-index: 1;
	background: rgba(15, 23, 42, 0.86);
	color: #f8fafc;
	border-radius: 18px;
	padding: 2rem;
	display: flex;
	flex-direction: column;
	gap: 1.2rem;
	box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.2);
}

.hero-card h2 {
	margin: 0;
	font-size: 1.4rem;
	color: #bfdbfe;
}

.edu {
	padding: 1rem;
	border-radius: 12px;
	background: rgba(148, 163, 184, 0.18);
}

.program {
	font-weight: 600;
	margin: 0 0 0.25rem;
}

.institution {
	margin: 0 0 0.25rem;
	font-size: 0.95rem;
	color: #e2e8f0;
}

.timeframe {
	margin: 0;
	font-size: 0.85rem;
	color: #cbd5f5;
}

.featured {
	display: flex;
	flex-direction: column;
	gap: 1.5rem;
}

.section-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: 1rem;
}

.section-header h2 {
	margin: 0;
	font-size: 1.8rem;
	color: #0f172a;
}

.cta {
	font-weight: 600;
	color: #2563eb;
	text-decoration: none;
}

.card-grid {
	display: grid;
	gap: 1.5rem;
	grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
}

.card {
	background: #ffffff;
	border-radius: 18px;
	padding: 1.5rem;
	box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
	border: 1px solid rgba(148, 163, 184, 0.18);
	display: flex;
	flex-direction: column;
	gap: 0.8rem;
}

.card h3 {
	margin: 0;
	color: #0f172a;
}

.org {
	color: #1d4ed8;
	font-weight: 600;
	margin: 0;
}

.time {
	margin: 0;
	font-size: 0.9rem;
	color: #64748b;
}

.card ul {
	margin: 0;
	padding-left: 1.1rem;
	color: #475569;
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
}

.card-header {
	display: flex;
	justify-content: space-between;
	align-items: baseline;
	gap: 0.5rem;
}

.description {
	margin: 0;
	color: #334155;
}

.skills {
	display: flex;
	flex-direction: column;
	gap: 1.5rem;
}

.skills h2 {
	margin: 0;
	font-size: 1.8rem;
	color: #0f172a;
}

.skills-grid {
	display: grid;
	gap: 1.5rem;
	grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}

.skill-card {
	background: linear-gradient(
		160deg,
		rgba(59, 130, 246, 0.1),
		rgba(14, 165, 233, 0.08)
	);
	border-radius: 18px;
	padding: 1.6rem;
	color: #0f172a;
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
	box-shadow: 0 12px 28px rgba(59, 130, 246, 0.12);
}

.skill-card h3 {
	margin: 0;
	font-size: 1.2rem;
}

.skill-card ul {
	margin: 0;
	padding-left: 1.1rem;
	display: flex;
	flex-direction: column;
	gap: 0.45rem;
	color: #0f172a;
}

.class-link {
	font-weight: 600;
	color: #1d4ed8;
	text-decoration: none;
}

@media (max-width: 768px) {
	.hero {
		padding: 2.2rem;
	}

	.hero-actions {
		flex-direction: column;
		align-items: flex-start;
	}

	.skills-grid {
		grid-template-columns: 1fr;
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
