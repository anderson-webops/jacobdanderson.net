<script lang="ts" setup>
import { computed } from "vue";
import { useMainStore } from "~/stores";

const store = useMainStore();
const profile = computed(() => store.userProfile);
</script>

<template>
	<div class="contact-page">
		<header class="page-intro">
			<p class="eyebrow">Contact</p>
			<h1>Open to well-scoped work, thoughtful collaborations, and instruction inquiries.</h1>
			<p>
				If you would like to discuss a project, research collaboration, or private lessons, reach out directly.
				I generally respond within two business days.
			</p>
		</header>

		<section class="contact-grid">
			<article class="contact-card section-panel">
				<span class="card-label">Direct contact</span>
				<h2>Start the conversation</h2>

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
					<RouterLink class="button-secondary" to="/classes">View teaching details</RouterLink>
				</div>
			</article>

			<article class="contact-card section-panel">
				<span class="card-label">Best suited for</span>
				<h2>Typical engagements</h2>
				<ul>
					<li>Embedded systems, prototyping, and technical product work.</li>
					<li>Research tooling, analysis pipelines, and engineering support.</li>
					<li>Private programming, STEM, and Spanish instruction.</li>
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
	grid-template-columns: minmax(0, 1.2fr) minmax(300px, 0.8fr);
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
	grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
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

@media (max-width: 900px) {
	.contact-grid {
		grid-template-columns: 1fr;
	}
}

@media (max-width: 640px) {
	.contact-card {
		padding: 1.45rem;
	}

	.detail-grid {
		grid-template-columns: 1fr;
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
