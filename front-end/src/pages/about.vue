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
						<h1>Engineering work and teaching practice built around the same standards.</h1>
						<p>
							My engineering work has included radiation-effects simulation tooling, sensing hardware for
							glucose-monitoring research, industrial telemetry interfaces, and product development at
							Stride. In parallel, I teach programming, STEM, and Spanish one-on-one and support
							instructor training and curriculum quality.
						</p>
					</header>

					<div class="snapshot-card section-panel">
						<div class="snapshot-top">
							<span class="card-label">Current work</span>
							<span class="snapshot-date">Updated {{ profile.lastUpdated }}</span>
						</div>

						<div class="snapshot-practice">
							<span class="card-label">Engineering</span>
							<h2>{{ profile.practices.engineering.title }}</h2>
							<p class="snapshot-copy">{{ profile.practices.engineering.summary }}</p>
						</div>

						<div class="snapshot-practice">
							<span class="card-label">Teaching</span>
							<h2>{{ profile.practices.teaching.title }}</h2>
							<p class="snapshot-copy">{{ profile.practices.teaching.summary }}</p>
						</div>
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
				<span class="card-label">Engineering work</span>
				<h2>What that work usually involves</h2>
				<ul>
					<li>Embedded systems, telemetry, and sensor integration.</li>
					<li>Research tooling, simulation workflows, and analysis pipelines.</li>
					<li>Technical product work that connects hardware, software, and review workflows.</li>
				</ul>
			</article>

			<article class="support-card section-panel">
				<span class="card-label">Teaching work</span>
				<h2>What the teaching practice includes</h2>
				<ul>
					<li>Private lessons in programming, STEM, and Spanish.</li>
					<li>Project-based instruction with clear follow-up and next steps.</li>
					<li>Instructor training and curriculum support through Juni Learning.</li>
				</ul>
			</article>

			<article class="support-card section-panel">
				<span class="card-label">Public references</span>
				<h2>Where to verify and reach out</h2>
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
				<h2>ISCAS 2025</h2>
				<p>{{ profile.publications[0].title }}</p>
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

.snapshot-practice {
	display: flex;
	flex-direction: column;
	gap: 0.4rem;
}

.snapshot-practice h2 {
	font-size: 1.55rem;
	line-height: 1.16;
}

.snapshot-copy,
.support-card p,
.support-card ul,
.profile-list a span {
	color: var(--color-text-muted);
	line-height: 1.75;
	text-decoration: none;
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
    layout: default
</route>
