<script lang="ts" setup>
import { computed } from "vue";
import { useMainStore } from "~/stores";

const store = useMainStore();
const profile = computed(() => store.userProfile);
</script>

<template>
	<div class="classes-page">
		<section class="hero section-panel">
			<div class="hero-copy">
				<p class="eyebrow">Private Instruction</p>
				<h1>
					Programming, STEM, and Spanish lessons built around each
					student.
				</h1>
				<p>
					I offer one-on-one instruction for students ages 7 to 18,
					with lessons tailored to the learner’s goals, experience
					level, and preferred pace.
				</p>

				<div class="price">
					<span class="amount">$40</span>
					<span class="details">per 60-minute lesson</span>
				</div>

				<div class="button-row">
					<a
						class="button-primary"
						href="https://classes.jacobdanderson.net"
						rel="noopener"
						target="_blank"
					>
						Visit teaching site
					</a>
					<a
						class="button-secondary"
						:href="`mailto:${profile.email}`"
					>
						Ask a question
					</a>
				</div>
			</div>

			<div class="hero-side">
				<span class="card-label">Best for</span>
				<ul>
					<li>Students who learn best through hands-on projects.</li>
					<li>Families looking for structured technical coaching.</li>
					<li>
						Beginners and intermediate learners who need clear
						guidance.
					</li>
				</ul>
			</div>
		</section>

		<section class="grid">
			<article class="info-card section-panel">
				<span class="card-label">What students gain</span>
				<h2>Progress you can actually see</h2>
				<ul>
					<li>
						Project-based lessons that build real portfolio pieces.
					</li>
					<li>
						Clear progress tracking and feedback after every
						session.
					</li>
					<li>
						Instruction from an educator who also trains other
						instructors.
					</li>
				</ul>
			</article>

			<article class="info-card section-panel">
				<span class="card-label">Subjects</span>
				<h2>What I teach</h2>
				<ul>
					<li>
						Programming fundamentals, web development, and game
						design.
					</li>
					<li>
						Embedded systems, circuits, and microcontroller
						projects.
					</li>
					<li>Spanish conversation and academic support.</li>
				</ul>
			</article>

			<article class="info-card section-panel">
				<span class="card-label">Getting started</span>
				<h2>Simple onboarding</h2>
				<ul>
					<li>
						Email me at
						<a :href="`mailto:${profile.email}`">{{
							profile.email
						}}</a
						>.
					</li>
					<li>Share your student’s goals and preferred schedule.</li>
					<li>
						We will set up a free consultation before the first
						session.
					</li>
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
	grid-template-columns: minmax(0, 1.2fr) minmax(280px, 0.8fr);
	gap: 1.5rem;
	padding: 2.4rem;
}

.hero-copy {
	display: flex;
	flex-direction: column;
	gap: 1.2rem;
}

.hero-copy h1 {
	font-size: clamp(2.5rem, 6vw, 4.2rem);
	line-height: 0.98;
	max-width: 12ch;
}

.hero-copy p {
	color: var(--color-text-muted);
	line-height: 1.75;
	max-width: 42rem;
}

.price {
	display: flex;
	align-items: baseline;
	gap: 0.75rem;
}

.amount {
	font-family: var(--font-display);
	font-size: clamp(2.8rem, 6vw, 4rem);
	line-height: 1;
	color: var(--color-accent-strong);
}

.details {
	font-size: 1rem;
	font-weight: 700;
	color: var(--color-text-muted);
}

.hero-side,
.info-card {
	padding: 1.5rem;
	border-radius: 20px;
	background: rgba(255, 255, 255, 0.68);
	border: 1px solid rgba(17, 29, 43, 0.08);
	display: flex;
	flex-direction: column;
	gap: 1rem;
}

.hero-side ul,
.info-card ul {
	margin: 0;
	padding-left: 1.1rem;
	display: flex;
	flex-direction: column;
	gap: 0.6rem;
	color: var(--color-text-muted);
}

.card-label {
	font-size: 0.76rem;
	font-weight: 700;
	letter-spacing: 0.12em;
	text-transform: uppercase;
	color: var(--color-highlight);
}

.grid {
	display: grid;
	grid-template-columns: repeat(3, minmax(0, 1fr));
	gap: 1.2rem;
}

.info-card h2 {
	font-size: 1.6rem;
	line-height: 1.12;
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
	.hero {
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
