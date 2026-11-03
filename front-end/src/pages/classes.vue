<script lang="ts" setup>
import { computed } from "vue";
import { useMainStore } from "~/stores";

const store = useMainStore();
const profile = computed(() => store.userProfile);

const subjects = ["Programming", "Web development", "Game design", "Embedded systems", "Circuits", "Math", "Spanish"];
</script>

<template>
	<div class="classes-page">
		<section class="hero">
			<div class="hero-copy">
				<p class="eyebrow">Classes with Jacob</p>
				<h1>Programming, STEM, math & Spanish lessons</h1>
				<p>
					One-on-one lessons for students from grade school through adulthood, built around schoolwork,
					personal projects, and practical skills.
				</p>
				<ul class="tag-list" aria-label="Subjects">
					<li v-for="subject in subjects" :key="subject" class="tag">{{ subject }}</li>
				</ul>
				<div class="button-row">
					<a class="button-primary" href="https://classes.jacobdanderson.net" rel="noopener" target="_blank">
						Lesson details and scheduling
					</a>
					<a class="button-secondary" :href="`mailto:${profile.email}`">Ask a question</a>
				</div>
			</div>

			<div class="rate-card">
				<span class="label">Standard lesson</span>
				<p class="price">
					<span class="amount">$40</span>
					<span class="details">per 50-minute lesson</span>
				</p>
				<ul class="rate-terms">
					<li>Free consultation before the first lesson to discuss goals, schedule, and fit.</li>
					<li>Pay only for completed classes. Missed or canceled sessions are not billed.</li>
				</ul>
			</div>
		</section>

		<section class="steps-section" aria-labelledby="steps-heading">
			<div class="section-head">
				<h2 id="steps-heading">Getting started</h2>
			</div>
			<ol class="steps">
				<li>
					<h3>Reach out</h3>
					<p>
						Email <a :href="`mailto:${profile.email}`">{{ profile.email }}</a
						>.
					</p>
				</li>
				<li>
					<h3>Share goals</h3>
					<p>The student’s goals, experience level, and schedule preferences.</p>
				</li>
				<li>
					<h3>Meet briefly</h3>
					<p>A short consultation before the first weekly lesson.</p>
				</li>
			</ol>
		</section>

		<section class="format" aria-labelledby="format-heading">
			<h2 id="format-heading">How lessons work</h2>
			<p>
				Weekly 50-minute sessions built around current goals, with projects or review between meetings when
				useful and specific feedback after each session. The aim is independent problem-solving that keeps going
				between lessons.
			</p>
		</section>
	</div>
</template>

<style scoped>
.classes-page {
	display: flex;
	flex-direction: column;
	gap: var(--space-section);
}

.hero {
	display: grid;
	grid-template-columns: minmax(0, 1fr) minmax(0, 20rem);
	gap: 3rem;
	align-items: start;
}

.hero-copy {
	display: flex;
	flex-direction: column;
	gap: 1.1rem;
}

.hero-copy h1 {
	font-size: clamp(2.3rem, 5vw, 3.25rem);
	line-height: 1.08;
}

.hero-copy > p:not(.eyebrow) {
	color: var(--color-text-muted);
	font-size: 1.125rem;
	max-width: 54ch;
}

.hero-copy .button-row {
	margin-top: 0.5rem;
}

.rate-card {
	display: flex;
	flex-direction: column;
	gap: 0.9rem;
	padding: var(--panel-padding-roomy);
	border: 1px solid var(--color-border);
	border-radius: var(--radius-lg);
	background: var(--color-surface-strong);
	box-shadow: var(--shadow-card);
}

.price {
	display: flex;
	flex-wrap: wrap;
	align-items: baseline;
	gap: 0.3rem 0.6rem;
}

.amount {
	font-family: var(--font-display);
	font-size: clamp(2.8rem, 6vw, 3.5rem);
	font-weight: 700;
	line-height: 1;
	color: var(--color-text);
}

.details {
	color: var(--color-text-muted);
	font-weight: 600;
}

.rate-terms {
	display: flex;
	flex-direction: column;
	gap: 0.6rem;
	margin: 0;
	padding: 0.9rem 0 0;
	border-top: 1px solid var(--color-border);
	color: var(--color-text-muted);
	font-size: 0.95rem;
	list-style: none;
}

.steps-section {
	display: flex;
	flex-direction: column;
	gap: 1.5rem;
}

.steps {
	display: grid;
	grid-template-columns: repeat(3, minmax(0, 1fr));
	gap: 1.5rem;
	margin: 0;
	padding: 0;
	list-style: none;
	counter-reset: step;
}

.steps li {
	display: flex;
	flex-direction: column;
	gap: 0.4rem;
	counter-increment: step;
}

.steps li::before {
	content: counter(step);
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 2rem;
	height: 2rem;
	margin-bottom: 0.4rem;
	border-radius: 50%;
	background: var(--color-accent-soft);
	color: var(--color-accent);
	font-weight: 700;
}

.steps h3 {
	font-size: 1.1rem;
}

.steps p {
	color: var(--color-text-muted);
}

.steps a {
	color: var(--color-accent);
}

.format {
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
	padding: var(--panel-padding-roomy);
	border-radius: var(--radius-lg);
	background: var(--color-surface-accent);
}

.format h2 {
	font-size: 1.45rem;
}

.format p {
	color: var(--color-text-muted);
	max-width: 70ch;
}

@media (max-width: 860px) {
	.hero,
	.steps {
		grid-template-columns: 1fr;
	}
}
</style>

<route lang="yaml">
meta:
    layout: default
    title: Teaching | Jacob Anderson
    description: Private lessons in programming, STEM, math, and Spanish through Jacob Anderson's independent teaching practice.
</route>
