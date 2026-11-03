<script lang="ts" setup>
import { computed } from "vue";
import { useMainStore } from "~/stores";

withDefaults(defineProps<{ compact?: boolean }>(), { compact: false });
const store = useMainStore();
const education = computed(() => store.userProfile.education);
</script>

<template>
	<section class="education" aria-labelledby="education-heading">
		<div class="section-head">
			<h2 id="education-heading">Education</h2>
		</div>

		<div class="education-list">
			<article v-for="(item, index) in education" :key="index" class="education-card">
				<p class="timeframe">{{ item.timeframe }}</p>
				<div class="education-body">
					<h3>{{ item.program }}</h3>
					<p class="institution">{{ item.institution }}</p>
					<ul v-if="!compact" class="bullet-list">
						<li v-for="(highlight, highlightIndex) in item.highlights" :key="highlightIndex">
							{{ highlight }}
						</li>
					</ul>
				</div>
			</article>
		</div>
	</section>
</template>

<style scoped>
.education {
	display: flex;
	flex-direction: column;
}

.education-list {
	display: flex;
	flex-direction: column;
}

.education-card {
	display: grid;
	grid-template-columns: var(--date-column) minmax(0, 1fr);
	gap: 0.35rem 2rem;
	padding: 1.4rem 0;
	border-bottom: 1px solid var(--color-border);
}

.timeframe {
	padding-top: 0.15rem;
	color: var(--color-text-subtle);
	font-size: 0.875rem;
	font-variant-numeric: tabular-nums;
}

.education-body {
	display: flex;
	flex-direction: column;
	gap: 0.3rem;
	min-width: 0;
}

.education-card h3 {
	font-size: 1.1rem;
	line-height: 1.35;
}

.institution {
	color: var(--color-text-muted);
}

.education-card .bullet-list {
	margin-top: 0.5rem;
}

@media (max-width: 640px) {
	.education-card {
		grid-template-columns: 1fr;
	}
}
</style>
