<script lang="ts" setup>
import type { ExperienceRecord } from "~/stores";

defineProps<{
	item: ExperienceRecord;
	compact?: boolean;
	reference?: boolean;
}>();
</script>

<template>
	<article class="experience-entry" :class="{ 'section-panel': !compact, 'compact-entry': compact }">
		<header class="entry-heading">
			<h3>{{ item.title }}</h3>
			<div class="entry-meta">
				<span class="entry-organization">{{ item.organization }}</span>
				<span class="entry-timeframe">{{ item.timeframe }}</span>
			</div>
			<p v-if="item.location" class="entry-location">{{ item.location }}</p>
			<p v-if="item.workFormat" class="entry-location">Work format: {{ item.workFormat }}</p>
			<p v-if="item.progression" class="entry-progression">{{ item.progression }}</p>
		</header>
		<p v-if="reference || !item.highlights.length" class="entry-summary">{{ item.summary }}</p>
		<ul v-if="item.highlights.length">
			<li v-for="highlight in item.highlights" :key="highlight">{{ highlight }}</li>
		</ul>
	</article>
</template>

<style scoped>
.experience-entry {
	padding: var(--panel-padding);
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
	min-width: 0;
}

.entry-heading {
	display: flex;
	flex-direction: column;
	gap: 0.4rem;
}

.entry-heading h3 {
	font-size: 1.42rem;
	line-height: 1.2;
}

.entry-meta {
	display: flex;
	flex-wrap: wrap;
	align-items: baseline;
	justify-content: space-between;
	gap: 0.25rem 1rem;
}

.entry-organization {
	color: var(--color-accent);
	font-weight: 700;
}

.entry-timeframe,
.entry-location,
.entry-progression {
	color: var(--color-text-muted);
	font-size: 0.92rem;
}

.entry-summary,
.experience-entry ul {
	color: var(--color-text-muted);
	line-height: 1.72;
	max-width: var(--text-measure);
}

.experience-entry ul {
	margin: 0;
	padding-left: 1.1rem;
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
}

.compact-entry {
	padding: 1rem 0;
	border-top: 1px solid var(--color-border-strong);
}

@media print {
	.experience-entry {
		break-inside: avoid;
		box-shadow: none;
	}
}
</style>
