<script lang="ts" setup>
import { computed } from "vue";
import { useMainStore } from "~/stores";

const store = useMainStore();
const profile = computed(() => store.userProfile);
</script>

<template>
	<div class="about-page">
		<section class="about-intro">
			<p class="eyebrow">About</p>

			<div class="about-layout">
				<div class="about-copy">
					<header class="page-intro">
						<h1>Systems-minded engineering with a strong emphasis on clarity.</h1>
						<p>{{ profile.summary }}</p>
					</header>

					<div class="summary-card section-panel">
						<div class="summary-top">
							<span class="summary-label">Professional snapshot</span>
							<span class="summary-date">Updated {{ profile.lastUpdated }}</span>
						</div>

						<dl class="details-grid">
							<div class="detail-item">
								<dt>Location</dt>
								<dd>{{ profile.location }}</dd>
							</div>
							<div class="detail-item">
								<dt>Email</dt>
								<dd>
									<a :href="`mailto:${profile.email}`">{{ profile.email }}</a>
								</dd>
							</div>
							<div class="detail-item">
								<dt>Phone</dt>
								<dd>
									<a :href="`tel:${profile.phone}`">{{ profile.phone }}</a>
								</dd>
							</div>
						</dl>

						<p class="summary-text">
							I care about building dependable systems that connect hardware, firmware, and intuitive
							interfaces. Whether I am prototyping sensor networks or teaching a student through a new
							programming concept, I focus on measurable outcomes, maintainability, and clear
							communication.
						</p>
					</div>
				</div>

				<img
					class="portrait-image"
					src="https://jacobdanderson.s3.amazonaws.com/images/Jacob_Anderson.jpg"
					alt="Portrait of Jacob Anderson"
				/>
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
					<li v-for="(competency, index) in profile.skills.competencies" :key="index">
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
					<li v-for="(achievement, index) in profile.achievements" :key="index">
						{{ achievement }}
					</li>
				</ul>
			</article>

			<article class="recognition-card section-panel">
				<span class="card-label">Beyond the lab</span>
				<h2>Community and personal interests</h2>
				<ul>
					<li v-for="(activity, index) in profile.activities" :key="index">
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

.about-intro {
	display: flex;
	flex-direction: column;
	gap: 1rem;
}

.about-layout {
	display: grid;
	grid-template-columns: minmax(0, 1.28fr) minmax(300px, 0.82fr);
	gap: 1.6rem;
	align-items: center;
}

.about-copy {
	display: flex;
	flex-direction: column;
	gap: 1.5rem;
	min-width: 0;
}

.about-intro .page-intro {
	max-width: none;
}

.summary-card,
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
	grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
	column-gap: 1.25rem;
	row-gap: 1rem;
	margin: 0;
}

.detail-item,
.details-grid dd {
	min-width: 0;
}

.details-grid dt,
.details-grid dd {
	margin: 0;
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

.details-grid dd,
.details-grid a {
	display: block;
	overflow-wrap: anywhere;
}

.portrait-image {
	width: 100%;
	height: auto;
	align-self: center;
	justify-self: end;
	border-radius: 30px;
	border: 1px solid rgba(255, 255, 255, 0.72);
	box-shadow:
		0 22px 40px rgba(17, 29, 43, 0.1),
		0 0 0 1px rgba(17, 29, 43, 0.06);
	background: rgba(255, 255, 255, 0.4);
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
	.about-layout,
	.highlights-grid,
	.recognition-grid {
		grid-template-columns: 1fr;
	}

	.portrait-image {
		max-width: 520px;
		justify-self: start;
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
	.highlight-card,
	.recognition-card {
		padding: 1.4rem;
	}
}
</style>
