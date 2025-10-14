<script lang="ts" setup>
import { computed } from "vue";
import { useMainStore } from "~/stores";

const store = useMainStore();
const profile = computed(() => store.userProfile);
</script>

<template>
	<div class="classes-page">
		<section class="hero">
			<h1>1:1 lessons for curious learners</h1>
			<p>
				I teach custom programming, STEM, and Spanish lessons for
				students ages 7–18. Each session is personalized to your
				learner's goals, whether that's building their first game,
				diving into robotics, or strengthening conversational Spanish.
			</p>
			<div class="price">
				<span class="amount">$40</span>
				<span class="details">per 60-minute lesson</span>
			</div>
			<a
				class="cta"
				href="https://classes.jacobdanderson.net"
				rel="noopener"
				target="_blank"
			>
				Visit classes.jacobdanderson.net →
			</a>
		</section>

		<section class="grid">
			<article>
				<h2>What students gain</h2>
				<ul>
					<li>
						Project-based lessons that build real portfolio pieces.
					</li>
					<li>
						Clear progress tracking and feedback after every
						session.
					</li>
					<li>
						Expert guidance from an educator who trains other
						instructors.
					</li>
				</ul>
			</article>
			<article>
				<h2>Subjects I teach</h2>
				<ul>
					<li>
						Programming fundamentals, web development, and game
						design.
					</li>
					<li>
						Embedded systems concepts, circuits, and microcontroller
						projects.
					</li>
					<li>Spanish conversation and academic support.</li>
				</ul>
			</article>
			<article>
				<h2>How to get started</h2>
				<ul>
					<li>
						Email me at
						<a :href="`mailto:${profile.email}`">{{
							profile.email
						}}</a
						>.
					</li>
					<li>
						Share a few goals for your student and preferred
						schedule.
					</li>
					<li>
						We'll set up a free consultation to tailor the lesson
						plan.
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
	gap: 3rem;
	padding: 2rem 0 4rem;
}

.hero {
	background: linear-gradient(
		145deg,
		rgba(59, 130, 246, 0.14),
		rgba(14, 165, 233, 0.1)
	);
	border-radius: 24px;
	padding: 3rem;
	box-shadow: 0 24px 48px rgba(37, 99, 235, 0.18);
	display: flex;
	flex-direction: column;
	gap: 1.5rem;
	color: #0f172a;
}

.hero h1 {
	margin: 0;
	font-size: clamp(2.2rem, 5vw, 3.2rem);
}

.hero p {
	margin: 0;
	line-height: 1.7;
	max-width: 720px;
}

.price {
	display: flex;
	align-items: baseline;
	gap: 0.75rem;
	font-weight: 700;
}

.amount {
	font-size: clamp(2.4rem, 4vw, 3.1rem);
	color: #1d4ed8;
}

.details {
	font-size: 1rem;
	color: #0f172a;
}

.cta {
	align-self: flex-start;
	background: #1d4ed8;
	color: #ffffff;
	padding: 0.85rem 1.8rem;
	border-radius: 999px;
	font-weight: 600;
	text-decoration: none;
	box-shadow: 0 16px 32px rgba(29, 78, 216, 0.25);
	transition:
		transform 0.2s ease,
		box-shadow 0.2s ease;
}

.cta:hover {
	transform: translateY(-2px);
	box-shadow: 0 20px 36px rgba(29, 78, 216, 0.28);
}

.grid {
	display: grid;
	gap: 1.8rem;
	grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}

article {
	background: #ffffff;
	border-radius: 18px;
	padding: 1.8rem;
	box-shadow: 0 16px 32px rgba(15, 23, 42, 0.08);
	border: 1px solid rgba(148, 163, 184, 0.18);
	display: flex;
	flex-direction: column;
	gap: 1rem;
}

article h2 {
	margin: 0;
	color: #0f172a;
}

article ul {
	margin: 0;
	padding-left: 1.1rem;
	color: #475569;
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
}

article a {
	color: #2563eb;
	text-decoration: none;
}

@media (max-width: 768px) {
	.hero {
		padding: 2.2rem;
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
