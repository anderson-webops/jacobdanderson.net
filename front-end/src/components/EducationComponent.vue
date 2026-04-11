<script lang="ts" setup>
import { computed } from "vue";
import { useMainStore } from "~/stores";

const store = useMainStore();
const education = computed(() => store.userProfile.education);
</script>

<template>
	<section class="education">
		<div class="section-head">
			<div>
				<p class="eyebrow">Education</p>
				<h2>Academic background</h2>
			</div>
		</div>

		<div class="education-grid">
			<article v-for="(item, index) in education" :key="index" class="education-card section-panel">
				<div class="card-top">
					<span class="card-label">Program</span>
					<span class="timeframe">{{ item.timeframe }}</span>
				</div>
				<h3>{{ item.program }}</h3>
				<p class="institution">{{ item.institution }}</p>
				<ul>
					<li v-for="(highlight, highlightIndex) in item.highlights" :key="highlightIndex">
						{{ highlight }}
					</li>
				</ul>
			</article>
		</div>
	</section>
</template>

<style scoped>
.education {
	display: flex;
	flex-direction: column;
	gap: 1.35rem;
}

.section-head h2 {
	font-size: clamp(1.9rem, 3.5vw, 2.35rem);
	margin-top: 0.55rem;
}

.education-grid {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 1.2rem;
}

.education-card {
	padding: 1.55rem;
	display: flex;
	flex-direction: column;
	gap: 0.95rem;
}

.card-top {
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

.timeframe {
	color: var(--color-accent);
	font-size: 0.92rem;
	font-weight: 700;
}

.education-card h3 {
	font-size: 1.5rem;
	line-height: 1.15;
}

.institution,
.education-card ul {
	color: var(--color-text-muted);
	line-height: 1.72;
}

.institution {
	font-weight: 600;
}

.education-card ul {
	margin: 0;
	padding-left: 1.1rem;
	display: flex;
	flex-direction: column;
	gap: 0.55rem;
}

@media (max-width: 860px) {
	.education-grid {
		grid-template-columns: 1fr;
	}
}

@media (max-width: 640px) {
	.education-card {
		padding: 1.4rem;
	}

	.card-top {
		flex-direction: column;
		align-items: flex-start;
	}
}
</style>
