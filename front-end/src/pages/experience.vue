<script lang="ts" setup>
import { computed } from "vue";
import { useMainStore } from "~/stores";

const store = useMainStore();
const patentExperience = computed(() => store.userProfile.experience.filter(item => item.category === "patent"));
const engineeringExperience = computed(() =>
	store.userProfile.experience.filter(item => item.category === "engineering")
);
const instructionAndLeadershipExperience = computed(() =>
	store.userProfile.experience.filter(item => item.category === "instruction" || item.category === "leadership")
);
</script>

<template>
	<div class="experience-page">
		<header class="page-intro">
			<p class="eyebrow">Experience</p>
			<h1>Patent work grounded in engineering practice.</h1>
			<p>
				My current role at Meunier Carlin & Curfman builds on hands-on experience in engineering, research,
				product development, technical operations, and instruction.
			</p>
		</header>

		<section class="section-block">
			<div class="section-top">
				<div>
					<p class="eyebrow">Current Role</p>
					<h2>Patent & technical work</h2>
				</div>
			</div>

			<div class="timeline primary-timeline">
				<article
					v-for="(item, index) in patentExperience"
					:key="index"
					class="entry section-panel current-entry"
				>
					<div class="entry-meta">
						<span class="entry-organization">{{ item.organization }}</span>
						<span class="entry-timeframe">{{ item.timeframe }}</span>
					</div>
					<h3>{{ item.title }}</h3>
					<p class="entry-location">{{ item.location }}</p>
					<p class="entry-summary">{{ item.summary }}</p>
					<ul>
						<li v-for="(highlight, highlightIndex) in item.highlights" :key="highlightIndex">
							{{ highlight }}
						</li>
					</ul>
					<p class="role-boundary">
						This site describes my professional background only. Patent work is performed through MCC under
						attorney supervision.
					</p>
				</article>
			</div>
		</section>

		<section class="section-block">
			<div class="section-top">
				<div>
					<p class="eyebrow">Engineering & Research</p>
					<h2>Technical and product roles</h2>
				</div>
			</div>

			<div class="timeline">
				<article v-for="(item, index) in engineeringExperience" :key="index" class="entry section-panel">
					<div class="entry-meta">
						<span class="entry-organization">{{ item.organization }}</span>
						<span class="entry-timeframe">{{ item.timeframe }}</span>
					</div>
					<h3>{{ item.title }}</h3>
					<p class="entry-location">{{ item.location }}</p>
					<p class="entry-summary">{{ item.summary }}</p>
					<ul>
						<li v-for="(highlight, highlightIndex) in item.highlights" :key="highlightIndex">
							{{ highlight }}
						</li>
					</ul>
				</article>
			</div>
		</section>

		<section class="section-block">
			<div class="section-top">
				<div>
					<p class="eyebrow">Instruction & Leadership</p>
					<h2>Teaching and additional experience</h2>
				</div>
			</div>

			<div class="timeline">
				<article
					v-for="(item, index) in instructionAndLeadershipExperience"
					:key="index"
					class="entry section-panel"
				>
					<div class="entry-meta">
						<span class="entry-organization">{{ item.organization }}</span>
						<span class="entry-timeframe">{{ item.timeframe }}</span>
					</div>
					<h3>{{ item.title }}</h3>
					<p class="entry-location">{{ item.location }}</p>
					<p class="entry-summary">{{ item.summary }}</p>
					<ul>
						<li v-for="(highlight, highlightIndex) in item.highlights" :key="highlightIndex">
							{{ highlight }}
						</li>
					</ul>
				</article>
			</div>
		</section>
	</div>
</template>

<style scoped>
.experience-page {
	display: flex;
	flex-direction: column;
	gap: 1.85rem;
}

.section-block {
	display: flex;
	flex-direction: column;
	gap: 1.1rem;
}

.section-top h2 {
	font-size: 2rem;
	margin-top: 0.55rem;
}

.timeline {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 1.1rem;
}

.primary-timeline {
	grid-template-columns: 1fr;
}

.current-entry {
	border-color: rgba(33, 70, 97, 0.24);
	box-shadow: 0 18px 44px rgba(22, 52, 75, 0.11);
}

.entry {
	padding: var(--panel-padding);
	display: flex;
	flex-direction: column;
	gap: 0.9rem;
}

.entry-meta {
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: 0.9rem;
}

.entry-organization {
	color: var(--color-highlight);
	font-size: 0.76rem;
	font-weight: 700;
	letter-spacing: 0.12em;
	text-transform: uppercase;
}

.entry-timeframe {
	color: var(--color-accent);
	font-size: 0.92rem;
	font-weight: 700;
}

.entry h3 {
	font-size: 1.42rem;
	line-height: 1.2;
}

.entry-location,
.entry-summary,
.entry ul,
.role-boundary {
	color: var(--color-text-muted);
	line-height: 1.72;
}

.entry-location {
	font-weight: 600;
}

.entry ul {
	margin: 0;
	padding-left: 1.1rem;
	display: flex;
	flex-direction: column;
	gap: 0.55rem;
}

.role-boundary {
	margin: 0;
	padding-top: 0.85rem;
	border-top: 1px solid var(--color-border);
	font-size: 0.92rem;
}

@media (max-width: 900px) {
	.timeline {
		grid-template-columns: 1fr;
	}
}

@media (max-width: 640px) {
	.section-top h2 {
		font-size: 1.75rem;
	}

	.entry {
		padding: var(--panel-padding);
	}

	.entry-meta {
		flex-direction: column;
		align-items: flex-start;
	}
}
</style>

<route lang="yaml">
meta:
    layout: default
    title: Experience | Jacob Anderson
    description: Patent, engineering, research, product, operations, and instructional experience for Jacob Anderson, led by his current Patent Technical Specialist role at Meunier Carlin & Curfman.
</route>
