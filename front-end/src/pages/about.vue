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
					fetchpriority="high"
					height="3088"
					width="2316"
				/>
			</div>
		</section>

		<section class="support-grid">
			<article class="support-card section-panel">
				<span class="card-label">Recent engineering proof</span>
				<h2>Recent outcomes and artifacts</h2>
				<ul>
					<li>Co-authored the ISCAS 2025 paper on the OSCRE radiation-effects simulation framework.</li>
					<li>Delivered a working industrial drill monitoring demo for Epiroc sponsor review.</li>
					<li>Built hardware and analysis tooling for non-invasive glucose-monitoring experiments.</li>
				</ul>
			</article>

			<article class="support-card section-panel">
				<span class="card-label">Teaching in practice</span>
				<h2>What students and families can expect</h2>
				<ul>
					<li>Private lessons in programming, STEM, and Spanish.</li>
					<li>50-minute sessions with a consultation before the first lesson.</li>
					<li>Follow-up, project review, and next steps after sessions when useful.</li>
					<li>Instructor training and curriculum support through Juni Learning.</li>
				</ul>
			</article>

			<article class="support-card section-panel">
				<span class="card-label">Public references</span>
				<h2>Where to verify and reach out</h2>
				<div class="profile-list">
					<template v-for="item in profile.profiles" :key="item.href">
						<RouterLink v-if="item.href.startsWith('/')" :to="item.href">
							<strong>{{ item.label }}</strong>
							<span>{{ item.description }}</span>
						</RouterLink>
						<a v-else :href="item.href" rel="noopener" target="_blank">
							<strong>{{ item.label }}</strong>
							<span>{{ item.description }}</span>
						</a>
					</template>
				</div>
			</article>

			<article class="support-card section-panel">
				<span class="card-label">Résumé</span>
				<h2>Printable background</h2>
				<p>Use the résumé page for a direct view of experience, education, and contact details.</p>
				<RouterLink class="section-link" to="/resume">Open résumé</RouterLink>
			</article>
		</section>

		<EducationComponent />
	</div>
</template>

<style scoped>
.about-page {
	display: flex;
	flex-direction: column;
	gap: 2.35rem;
}

.about-intro {
	display: flex;
	flex-direction: column;
	gap: 1rem;
}

.about-layout {
	display: grid;
	grid-template-columns: minmax(0, 1.25fr) minmax(320px, 0.82fr);
	gap: 1.7rem;
	align-items: center;
}

.about-copy {
	display: flex;
	flex-direction: column;
	gap: 1.35rem;
	min-width: 0;
}

.about-intro .page-intro {
	max-width: none;
}

.snapshot-card,
.support-card {
	padding: var(--panel-padding-roomy);
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
	border-radius: 24px;
	border: 1px solid rgba(255, 255, 255, 0.72);
	box-shadow: var(--shadow-card);
}

.support-grid {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 1.1rem;
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
		padding: var(--panel-padding);
	}
}
</style>

<route lang="yaml">
meta:
    layout: default
    title: About | Jacob Anderson
    description: Background on Jacob Anderson's engineering work, teaching practice, publications, and current focus.
</route>
