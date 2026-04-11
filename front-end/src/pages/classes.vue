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
				<h1>Programming, STEM, and Spanish lessons tailored to the student and the goal.</h1>
				<p>
					I offer one-on-one instruction for students from grade school through adulthood, with lessons shaped
					around the learner’s goals, experience level, and preferred pace.
				</p>

				<div class="button-row">
					<a class="button-primary" href="https://classes.jacobdanderson.net" rel="noopener" target="_blank">
						Visit teaching site
					</a>
					<a class="button-secondary" :href="`mailto:${profile.email}`">Ask a question</a>
				</div>
			</div>

			<div class="rate-card section-panel">
				<span class="card-label">Lesson rate</span>
				<div class="price">
					<span class="amount">$40</span>
					<span class="details">standard session rate</span>
				</div>
				<p>Free consultation before the first session to discuss goals, scheduling, and fit.</p>
				<p>The teaching site handles scheduling, student accounts, and curriculum details.</p>
			</div>
		</section>

		<section class="grid">
			<article class="info-card section-panel">
				<span class="card-label">What students gain</span>
				<h2>Progress you can actually track</h2>
				<ul>
					<li>Project-based lessons that create concrete work products.</li>
					<li>Clear feedback after sessions and practical next steps.</li>
					<li>Instruction from an educator who also trains other instructors.</li>
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
				<h2>Simple onboarding</h2>
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
	</div>
</template>

<style scoped>
.classes-page {
	display: flex;
	flex-direction: column;
	gap: 2rem;
}

.hero {
	display: grid;
	grid-template-columns: minmax(0, 1.25fr) minmax(280px, 0.75fr);
	gap: 1.4rem;
	align-items: start;
}

.hero-copy {
	display: flex;
	flex-direction: column;
	gap: 1.2rem;
}

.hero-copy h1 {
	font-size: clamp(2.7rem, 6vw, 4.4rem);
	line-height: 0.96;
	max-width: 12ch;
}

.hero-copy p,
.rate-card p,
.info-card ul {
	color: var(--color-text-muted);
	line-height: 1.76;
}

.rate-card,
.info-card {
	padding: 1.55rem;
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
	gap: 1.2rem;
}

.info-card h2 {
	font-size: 1.58rem;
	line-height: 1.14;
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

@media (max-width: 960px) {
	.hero,
	.grid {
		grid-template-columns: 1fr;
	}

	.hero-copy h1 {
		max-width: none;
	}
}

@media (max-width: 720px) {
	.rate-card,
	.info-card {
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
