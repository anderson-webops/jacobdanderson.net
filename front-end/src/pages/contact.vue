<script lang="ts" setup>
import { computed } from "vue";
import { useMainStore } from "~/stores";

const store = useMainStore();
const profile = computed(() => store.userProfile);
const resumeRequest = computed(() => profile.value.profiles[2]);
</script>

<template>
	<div class="contact-page">
		<header class="page-intro">
			<p class="eyebrow">Contact</p>
			<h1>Engineering engagements, research collaborations, and private lessons.</h1>
			<p>Email is the fastest way to reach me. I usually respond within two business days.</p>
		</header>

		<section class="contact-grid">
			<article class="contact-card section-panel">
				<span class="card-label">Direct contact</span>
				<h2>Email and location</h2>

				<div class="detail-grid">
					<div>
						<span class="detail-label">Email</span>
						<a :href="`mailto:${profile.email}`">{{ profile.email }}</a>
					</div>
					<div>
						<span class="detail-label">Phone</span>
						<a :href="`tel:${profile.phone}`">{{ profile.phone }}</a>
					</div>
					<div>
						<span class="detail-label">Location</span>
						<span>{{ profile.location }}</span>
					</div>
				</div>

				<div class="button-row">
					<a class="button-primary" :href="`mailto:${profile.email}`">Email Jacob</a>
					<a class="button-secondary" :href="resumeRequest.href">Request résumé</a>
				</div>
			</article>

			<article class="contact-card section-panel">
				<span class="card-label">Engineering work</span>
				<h2>What to include in an inquiry</h2>
				<ul>
					<li>The product, system, or research context you are working in.</li>
					<li>The technical scope: embedded work, telemetry, tooling, or related software.</li>
					<li>Timing, stakeholders, and any constraints that matter early.</li>
				</ul>
			</article>

			<article class="contact-card section-panel">
				<span class="card-label">Teaching</span>
				<h2>What helps on the teaching side</h2>
				<ul>
					<li>Share the student’s goals, subject area, and rough experience level.</li>
					<li>Include preferred schedule windows and whether you want ongoing or short-term support.</li>
					<li>
						For scheduling and lesson logistics, you can also use the
						<a href="https://classes.jacobdanderson.net" rel="noopener" target="_blank">teaching site</a>.
					</li>
				</ul>
			</article>
		</section>
	</div>
</template>

<style scoped>
.contact-page {
	display: flex;
	flex-direction: column;
	gap: 2rem;
}

.contact-grid {
	display: grid;
	grid-template-columns: repeat(3, minmax(0, 1fr));
	gap: 1.2rem;
}

.contact-card {
	padding: 1.65rem;
	display: flex;
	flex-direction: column;
	gap: 1rem;
}

.card-label,
.detail-label {
	color: var(--color-highlight);
	font-size: 0.76rem;
	font-weight: 700;
	letter-spacing: 0.12em;
	text-transform: uppercase;
}

.contact-card h2 {
	font-size: 1.7rem;
	line-height: 1.14;
}

.detail-grid {
	display: grid;
	grid-template-columns: 1fr;
	gap: 1rem;
}

.detail-grid div {
	display: flex;
	flex-direction: column;
	gap: 0.3rem;
	min-width: 0;
}

.detail-grid a,
.detail-grid span:last-child,
.contact-card ul {
	color: var(--color-text-muted);
	line-height: 1.72;
	text-decoration: none;
}

.detail-grid a,
.detail-grid span:last-child {
	display: block;
	font-weight: 600;
	overflow-wrap: anywhere;
}

.contact-card ul {
	margin: 0;
	padding-left: 1.1rem;
	display: flex;
	flex-direction: column;
	gap: 0.6rem;
}

.contact-card ul a {
	color: var(--color-accent);
	text-decoration: none;
}

@media (max-width: 960px) {
	.contact-grid {
		grid-template-columns: 1fr;
	}
}

@media (max-width: 640px) {
	.contact-card {
		padding: 1.45rem;
	}
}
</style>

<route lang="yaml">
meta:
    layout: default
</route>
