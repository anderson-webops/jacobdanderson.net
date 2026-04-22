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

					<div class="snapshot-card section-panel">
						<div class="snapshot-top">
							<span class="card-label">Professional snapshot</span>
							<span class="snapshot-date">Updated {{ profile.lastUpdated }}</span>
						</div>

						<dl class="details-grid">
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

						<p class="snapshot-copy">
							I care about building systems that stay understandable from concept through delivery.
							Whether the work involves hardware, analysis pipelines, or instruction, I prioritize
							reliability, maintainability, and communication.
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

		<section class="support-grid">
			<article class="support-card section-panel">
				<span class="card-label">Technical toolkit</span>
				<h2>Languages and frameworks</h2>
				<div class="tag-list">
					<span
						v-for="(tool, index) in [
							...profile.skills.languages.slice(0, 7),
							...profile.skills.frameworks.slice(0, 5)
						]"
						:key="index"
						class="tag"
					>
						{{ tool }}
					</span>
				</div>
			</article>

			<article class="support-card section-panel">
				<span class="card-label">Core strengths</span>
				<h2>Where I create the most value</h2>
				<ul>
					<li v-for="(competency, index) in profile.skills.competencies" :key="index">
						{{ competency }}
					</li>
				</ul>
			</article>

			<article class="support-card section-panel">
				<span class="card-label">Profiles</span>
				<h2>Verification and contact paths</h2>
				<div class="profile-list">
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
			</article>

			<article class="support-card section-panel">
				<span class="card-label">Publication</span>
				<h2>{{ profile.publications[0].venue }}</h2>
				<p>{{ profile.publications[0].title }}</p>
				<p>{{ profile.publications[0].summary }}</p>
				<a :href="profile.publications[0].href" rel="noopener" target="_blank">Open publication record</a>
			</article>
		</section>

		<EducationComponent />
	</div>
</template>

<style scoped>
.about-page {
	display: flex;
	flex-direction: column;
	gap: 2.6rem;
}

.about-intro {
	display: flex;
	flex-direction: column;
	gap: 1rem;
}

.about-layout {
	display: grid;
	grid-template-columns: minmax(0, 1.25fr) minmax(320px, 0.82fr);
	gap: 2rem;
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

.snapshot-card,
.support-card {
	padding: 1.65rem;
	display: flex;
	flex-direction: column;
	gap: 1rem;
}

.snapshot-top {
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: 1rem;
}

.card-label {
	color: var(--color-highlight);
	font-size: 0.76rem;
	font-weight: 700;
	letter-spacing: 0.12em;
	text-transform: uppercase;
}

.snapshot-date {
	color: var(--color-text-muted);
	font-size: 0.92rem;
}

.details-grid {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
	column-gap: 1.25rem;
	row-gap: 1rem;
	margin: 0;
}

.details-grid div,
.details-grid dd {
	min-width: 0;
}

.details-grid dt,
.details-grid dd {
	margin: 0;
}

.details-grid dt {
	color: var(--color-text-muted);
	font-size: 0.76rem;
	font-weight: 700;
	letter-spacing: 0.12em;
	margin-bottom: 0.42rem;
	text-transform: uppercase;
}

.details-grid dd,
.details-grid a,
.snapshot-copy,
.support-card p,
.support-card ul,
.profile-list a span {
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
	border-radius: 30px;
	border: 1px solid rgba(255, 255, 255, 0.72);
	box-shadow: var(--shadow-soft);
}

.support-grid {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 1.2rem;
}

.support-card h2 {
	font-size: 1.6rem;
	line-height: 1.14;
}

.support-card ul {
	margin: 0;
	padding-left: 1.1rem;
	display: flex;
	flex-direction: column;
	gap: 0.55rem;
}

.profile-list {
	display: flex;
	flex-direction: column;
	gap: 0.85rem;
}

.profile-list a {
	display: flex;
	flex-direction: column;
	gap: 0.18rem;
	text-decoration: none;
}

.profile-list a strong {
	color: var(--color-text);
}

.support-card > a {
	color: var(--color-accent);
	font-weight: 700;
	text-decoration: none;
}

@media (max-width: 960px) {
	.about-layout,
	.support-grid {
		grid-template-columns: 1fr;
	}

	.portrait-image {
		max-width: 520px;
	}
}

@media (max-width: 720px) {
	.snapshot-top {
		flex-direction: column;
		align-items: flex-start;
	}

	.snapshot-card,
	.support-card {
		padding: 1.45rem;
	}
}
</style>

<route lang="yaml">
  meta:
    layout: default</route>
