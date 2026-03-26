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
			<h1>Open to thoughtful conversations and well-scoped work.</h1>
			<p>
				If you would like to discuss a project, research collaboration,
				or private instruction, reach out directly. I generally respond
				within two business days.
			</p>
		</header>

		<section class="contact-grid">
			<article class="contact-card section-panel">
				<span class="card-label">Direct contact</span>
				<h2>Start the conversation</h2>
				<div class="detail-list">
					<div>
						<span class="detail-label">Email</span>
						<a :href="`mailto:${profile.email}`">{{
							profile.email
						}}</a>
					</div>
					<div>
						<span class="detail-label">Phone</span>
						<a :href="`tel:${profile.phone}`">{{
							profile.phone
						}}</a>
					</div>
					<div>
						<span class="detail-label">Location</span>
						<span>{{ profile.location }}</span>
					</div>
				</div>

				<div class="button-row">
					<a class="button-primary" :href="`mailto:${profile.email}`">
						Email Jacob
					</a>
					<RouterLink class="button-secondary" to="/classes">
						View teaching options
					</RouterLink>
				</div>
			</article>

			<article class="contact-card section-panel">
				<span class="card-label">Good fit</span>
				<h2>Best suited for</h2>
				<ul>
					<li>Embedded systems and technical product work.</li>
					<li>
						Research tooling, analysis workflows, and prototyping.
					</li>
					<li>Private programming, STEM, or Spanish instruction.</li>
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
	grid-template-columns: minmax(0, 1.2fr) minmax(280px, 0.8fr);
	gap: 1.2rem;
}

.contact-card {
	padding: 1.7rem;
	display: flex;
	flex-direction: column;
	gap: 1.15rem;
}

.card-label,
.detail-label {
	font-size: 0.76rem;
	font-weight: 700;
	letter-spacing: 0.12em;
	text-transform: uppercase;
	color: var(--color-highlight);
}

.contact-card h2 {
	font-size: 1.8rem;
	line-height: 1.12;
}

.detail-list {
	display: grid;
	gap: 1rem;
}

.detail-list div {
	display: flex;
	flex-direction: column;
	gap: 0.35rem;
}

.detail-list a,
.detail-list span:last-child {
	color: var(--color-text-muted);
	text-decoration: none;
	font-weight: 600;
}

ul {
	margin: 0;
	padding-left: 1.1rem;
	display: flex;
	flex-direction: column;
	gap: 0.6rem;
	color: var(--color-text-muted);
}

@media (max-width: 900px) {
	.contact-grid {
		grid-template-columns: 1fr;
	}
}

@media (max-width: 640px) {
	.contact-card {
		padding: 1.4rem;
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
