<script lang="ts" setup>
import type { ExperienceRecord } from "~/stores";
import { computed } from "vue";

const props = withDefaults(
	defineProps<{
		item: ExperienceRecord;
		compact?: boolean;
		reference?: boolean;
		collapsible?: boolean;
		open?: boolean;
	}>(),
	{ compact: false, reference: false, collapsible: false, open: false }
);

const place = computed(() => props.item.location || props.item.workFormat);
const showSummary = computed(() => props.collapsible || props.reference || !props.item.highlights.length);
// Saying how much is inside lets readers decide whether to open it.
const highlightLabel = computed(() => {
	const count = props.item.highlights.length;
	return `Show ${count} ${count === 1 ? "highlight" : "highlights"}`;
});
</script>

<template>
	<article class="experience-entry" :class="{ 'compact-entry': compact }">
		<p class="entry-time">{{ item.timeframe }}</p>
		<div class="entry-body">
			<header class="entry-heading">
				<h3>{{ item.title }}</h3>
				<p class="entry-organization">
					{{ item.organization }}<span v-if="place" class="entry-place"> · {{ place }}</span>
				</p>
				<p v-if="item.progression" class="entry-progression">{{ item.progression }}</p>
			</header>
			<p v-if="showSummary" class="entry-summary">{{ item.summary }}</p>
			<details v-if="collapsible && item.highlights.length" class="disclosure" :open="open">
				<summary tabindex="0">
					<span class="when-closed">{{ highlightLabel }}</span
					><span class="when-open">Hide highlights</span>
				</summary>
				<ul class="bullet-list">
					<li v-for="highlight in item.highlights" :key="highlight">{{ highlight }}</li>
				</ul>
			</details>
			<ul v-else-if="item.highlights.length" class="bullet-list">
				<li v-for="highlight in item.highlights" :key="highlight">{{ highlight }}</li>
			</ul>
		</div>
	</article>
</template>

<style scoped>
.experience-entry {
	display: grid;
	grid-template-columns: var(--date-column) minmax(0, 1fr);
	gap: 0.35rem 2rem;
	padding: 1.6rem 0;
	border-top: 1px solid var(--color-border);
	min-width: 0;
}

.experience-entry:first-child {
	border-top: 0;
}

.entry-time {
	padding-top: 0.2rem;
	color: var(--color-text-subtle);
	font-size: 0.875rem;
	font-variant-numeric: tabular-nums;
	line-height: 1.5;
}

.entry-body {
	display: flex;
	flex-direction: column;
	gap: 0.7rem;
	min-width: 0;
}

.entry-heading {
	display: flex;
	flex-direction: column;
	gap: 0.15rem;
}

.entry-heading h3 {
	font-size: 1.15rem;
	line-height: 1.35;
}

.entry-organization {
	color: var(--color-accent);
	font-weight: 600;
}

.entry-place,
.entry-progression {
	color: var(--color-text-subtle);
	font-weight: 400;
}

.entry-progression {
	font-size: 0.9rem;
}

.entry-summary {
	color: var(--color-text-muted);
	max-width: var(--text-measure);
}

.experience-entry .bullet-list {
	max-width: var(--text-measure);
}

.disclosure .bullet-list {
	margin-top: 0.75rem;
}

.compact-entry {
	padding: 1.15rem 0;
}

.compact-entry .entry-body {
	gap: 0.5rem;
}

@media (max-width: 640px) {
	.experience-entry {
		grid-template-columns: 1fr;
	}

	.entry-time {
		padding-top: 0;
	}
}

@media print {
	.experience-entry {
		break-inside: avoid;
		grid-template-columns: 8.5rem minmax(0, 1fr);
		gap: 0.25rem 1.25rem;
		padding: 0.6rem 0;
	}
}
</style>
