<script lang="ts" setup>
import { computed } from "vue";
import { useMainStore } from "~/stores";

const store = useMainStore();
const profile = computed(() => store.userProfile);
</script>

<template>
	<div class="classes-page">
		<section class="hero">
			<div class="hero-copy">
				<p class="eyebrow">Private Instruction</p>
				<h1>Private instruction.</h1>
				<p>
					One-on-one programming, STEM, and Spanish lessons for students from grade school through adulthood.
					Sessions are built around concrete goals such as foundations, school support, project work, and
					deeper technical practice.
				</p>

				<div class="button-row">
					<a class="button-primary" href="https://classes.jacobdanderson.net" rel="noopener" target="_blank">
						Visit teaching site
					</a>
					<a class="button-secondary" :href="`mailto:${profile.email}`">Ask a question</a>
				</div>
			</div>

			<div class="rate-card section-panel">
				<span class="card-label">Standard lesson</span>
				<div class="price">
					<span class="amount">$40</span>
					<span class="details">per 50-minute lesson</span>
				</div>
				<p>Free consultation before the first lesson to discuss goals, schedule, and fit.</p>
				<p>Pay only for completed classes. Missed or canceled sessions are not billed.</p>
			</div>
		</section>

		<section class="grid">
			<article class="info-card section-panel">
				<span class="card-label">Lesson format</span>
				<h2>What ongoing lessons include</h2>
				<ul>
					<li>Weekly 50-minute sessions built around the student’s current goals.</li>
					<li>Projects, exercises, or review work between meetings when it is useful.</li>
					<li>Specific feedback and next steps after sessions.</li>
				</ul>
			</article>

			<article class="info-card section-panel">
				<span class="card-label">Subjects</span>
				<h2>What I teach</h2>
				<ul>
					<li>Programming fundamentals, web development, and game design.</li>
					<li>Embedded systems, circuits, and microcontroller projects.</li>
					<li>Spanish conversation and academic support.</li>
				</ul>
			</article>

			<article class="info-card section-panel">
				<span class="card-label">Getting started</span>
				<h2>How onboarding works</h2>
				<ul>
					<li>
						Reach out at
						<a :href="`mailto:${profile.email}`">{{ profile.email }}</a
						>.
					</li>
					<li>Share the student’s goals, experience level, and schedule preferences.</li>
					<li>We will set up a short consultation before the first lesson.</li>
				</ul>
			</article>
		</section>

		<section class="teaching-fit section-panel">
			<div>
				<span class="card-label">Good fit</span>
				<h2>Structured help without making the student dependent.</h2>
			</div>
			<p>
				The goal is not to replace classroom work or parent support. I help students build enough confidence,
				technical vocabulary, and repeatable practice habits that they can keep moving between lessons.
			</p>
			<a class="section-link" href="https://classes.jacobdanderson.net" rel="noopener" target="_blank">
				Review scheduling and tuition
			</a>
		</section>
	</div>
</template>

<style scoped>
.classes-page {
	display: flex;
	flex-direction: column;
	gap: 1.8rem;
}

.hero {
	display: grid;
	grid-template-columns: minmax(0, 1.25fr) minmax(280px, 0.75fr);
	gap: 1.2rem;
	align-items: start;
}

.hero-copy {
	display: flex;
	flex-direction: column;
	gap: 1.05rem;
}

.hero-copy h1 {
	font-size: 3.1rem;
	line-height: 1.06;
	max-width: none;
}

.hero-copy p,
.rate-card p,
.info-card ul {
	color: var(--color-text-muted);
	line-height: 1.76;
}

.rate-card,
.info-card {
	padding: var(--panel-padding);
	display: flex;
	flex-direction: column;
	gap: 1rem;
}

.card-label {
	color: var(--color-highlight);
	font-size: 0.76rem;
	font-weight: 700;
	letter-spacing: 0.12em;
	text-transform: uppercase;
}

.price {
	display: flex;
	align-items: baseline;
	gap: 0.7rem;
}

.amount {
	font-family: var(--font-display);
	font-size: clamp(2.8rem, 6vw, 4rem);
	line-height: 1;
	color: var(--color-accent-strong);
}

.details {
	color: var(--color-text-muted);
	font-size: 1rem;
	font-weight: 700;
}

.grid {
	display: grid;
	grid-template-columns: repeat(3, minmax(0, 1fr));
	gap: 1.1rem;
}

.info-card h2 {
	font-size: 1.42rem;
	line-height: 1.2;
}

.info-card ul {
	margin: 0;
	padding-left: 1.1rem;
	display: flex;
	flex-direction: column;
	gap: 0.6rem;
}

.info-card a {
	color: var(--color-accent);
	text-decoration: none;
}

.teaching-fit {
	display: grid;
	grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr) auto;
	gap: 1.2rem;
	align-items: center;
	padding: var(--panel-padding-roomy);
}

.teaching-fit h2 {
	font-size: 1.65rem;
	line-height: 1.16;
	margin-top: 0.45rem;
	max-width: 18ch;
}

.teaching-fit p {
	color: var(--color-text-muted);
	line-height: 1.74;
}

@media (max-width: 960px) {
	.hero,
	.grid,
	.teaching-fit {
		grid-template-columns: 1fr;
	}

	.hero-copy h1 {
		max-width: none;
	}
}

@media (max-width: 720px) {
	.hero-copy h1 {
		font-size: 2.35rem;
	}

	.rate-card,
	.info-card,
	.teaching-fit {
		padding: var(--panel-padding);
	}
}
</style>

<route lang="yaml">
meta:
    layout: default
    title: Teaching | Jacob Anderson
    description: Private lessons in programming, STEM, and Spanish, plus instructor training and onboarding details for Jacob Anderson's teaching practice.
</route>
