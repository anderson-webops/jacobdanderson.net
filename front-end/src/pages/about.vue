<script lang="ts" setup>
import { computed } from "vue";
import { useMainStore } from "~/stores";

const store = useMainStore();
const profile = computed(() => store.userProfile);
</script>

<template>
	<div class="about-page">
		<header class="page-intro">
			<p class="eyebrow">About</p>
			<h1>
				Systems-minded engineering with a strong emphasis on clarity.
			</h1>
			<p>{{ profile.summary }}</p>
		</header>

		<section class="intro-grid">
			<div class="summary-card section-panel">
				<div class="summary-top">
					<span class="summary-label">Professional snapshot</span>
					<span class="summary-date"
						>Updated {{ profile.lastUpdated }}</span
					>
				</div>

				<dl class="details-grid">
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

				<p class="summary-text">
					I care about building dependable systems that connect
					hardware, firmware, and intuitive interfaces. Whether I am
					prototyping sensor networks or teaching a student through a
					new programming concept, I focus on measurable outcomes,
					maintainability, and clear communication.
				</p>
			</div>

			<div class="portrait-card section-panel">
				<div class="portrait" role="presentation" />
			</div>
		</section>

		<section class="highlights-grid">
			<article class="highlight-card section-panel">
				<span class="card-label">Technical toolkit</span>
				<h2>Languages and frameworks</h2>
				<div class="tag-list">
					<span
						v-for="(tool, index) in [
							...profile.skills.languages.slice(0, 7),
							...profile.skills.frameworks.slice(0, 4)
						]"
						:key="index"
						class="tag"
					>
						{{ tool }}
					</span>
				</div>
			</article>

			<article class="highlight-card section-panel">
				<span class="card-label">Core strengths</span>
				<h2>Where I create the most value</h2>
				<ul>
					<li
						v-for="(competency, index) in profile.skills
							.competencies"
						:key="index"
					>
						{{ competency }}
					</li>
				</ul>
			</article>

			<article class="highlight-card section-panel">
				<span class="card-label">Languages</span>
				<h2>Communication beyond code</h2>
				<p>{{ profile.skills.languagesSpoken.join(" · ") }}</p>
			</article>
		</section>

		<EducationComponent />

		<section class="recognition-grid">
			<article class="recognition-card section-panel">
				<span class="card-label">Recognition</span>
				<h2>Achievements</h2>
				<ul>
					<li
						v-for="(achievement, index) in profile.achievements"
						:key="index"
					>
						{{ achievement }}
					</li>
				</ul>
			</article>

			<article class="recognition-card section-panel">
				<span class="card-label">Beyond the lab</span>
				<h2>Community and personal interests</h2>
				<ul>
					<li
						v-for="(activity, index) in profile.activities"
						:key="index"
					>
						{{ activity }}
					</li>
				</ul>
			</article>
		</section>
	</div>
</template>

<style scoped>
.about-page {
	display: flex;
	flex-direction: column;
	gap: 2.4rem;
}

.intro-grid {
	display: grid;
	grid-template-columns: minmax(0, 1.2fr) minmax(300px, 0.8fr);
	gap: 1.4rem;
}

.summary-card,
.portrait-card,
.highlight-card,
.recognition-card {
	padding: 1.7rem;
}

.summary-card {
	display: flex;
	flex-direction: column;
	gap: 1.4rem;
}

.summary-top {
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: 1rem;
}

.summary-label,
.card-label {
	font-size: 0.76rem;
	font-weight: 700;
	letter-spacing: 0.12em;
	text-transform: uppercase;
	color: var(--color-highlight);
}

.summary-date {
	font-size: 0.92rem;
	color: var(--color-text-muted);
}

.details-grid {
	display: grid;
	grid-template-columns: repeat(3, minmax(0, 1fr));
	gap: 1rem;
}

.details-grid dt {
	font-size: 0.76rem;
	font-weight: 700;
	letter-spacing: 0.12em;
	text-transform: uppercase;
	color: var(--color-text-muted);
	margin-bottom: 0.45rem;
}

.details-grid dd,
.details-grid a,
.summary-text,
.highlight-card p {
	color: var(--color-text-muted);
	line-height: 1.75;
	text-decoration: none;
}

.portrait-card {
	display: flex;
}

.portrait {
	width: 100%;
	min-height: 100%;
	border-radius: 22px;
	background:
		url("https://jacobdanderson.s3.amazonaws.com/images/Jacob_Anderson.jpg")
			center 18% / cover,
		linear-gradient(
			135deg,
			rgba(33, 74, 104, 0.18),
			rgba(167, 125, 71, 0.16)
		);
	box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.35);
}

.highlights-grid,
.recognition-grid {
	display: grid;
	grid-template-columns: repeat(3, minmax(0, 1fr));
	gap: 1.2rem;
}

.recognition-grid {
	grid-template-columns: repeat(2, minmax(0, 1fr));
}

.highlight-card,
.recognition-card {
	display: flex;
	flex-direction: column;
	gap: 1rem;
}

.highlight-card h2,
.recognition-card h2 {
	font-size: 1.55rem;
	line-height: 1.15;
}

.highlight-card ul,
.recognition-card ul {
	margin: 0;
	padding-left: 1.1rem;
	display: flex;
	flex-direction: column;
	gap: 0.55rem;
	color: var(--color-text-muted);
}

@media (max-width: 960px) {
	.intro-grid,
	.highlights-grid,
	.recognition-grid {
		grid-template-columns: 1fr;
	}
}

@media (max-width: 720px) {
	.details-grid {
		grid-template-columns: 1fr;
	}

	.summary-top {
		flex-direction: column;
		align-items: flex-start;
	}

	.summary-card,
	.portrait-card,
	.highlight-card,
	.recognition-card {
		padding: 1.4rem;
	}
}
</style>
