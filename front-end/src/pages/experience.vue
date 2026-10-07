<script lang="ts" setup>
import { computed } from "vue";
import { useMainStore } from "~/stores";

const store = useMainStore();
const patentExperience = computed(() => store.userProfile.experience.filter(item => item.category === "patent"));
const engineeringExperience = computed(() =>
	store.userProfile.experience.filter(item => item.category === "engineering")
);
const additionalExperience = computed(() =>
	store.userProfile.experience.filter(item => item.category === "instruction" || item.category === "leadership")
);
</script>

<template>
	<div class="experience-page">
		<header class="page-intro">
			<h1>Professional experience</h1>
		</header>
		<section class="section-block" aria-labelledby="current-heading">
			<h2 id="current-heading">Current role</h2>
			<ExperienceEntry
				v-for="item in patentExperience"
				:key="item.organization"
				:item="item"
				class="current-entry"
			/>
			<p class="role-boundary">
				Patent work is performed through Meunier Carlin & Curfman under attorney supervision. This personal site
				describes my background, not an offer of legal or patent services.
			</p>
		</section>
		<section class="section-block" aria-labelledby="engineering-heading">
			<h2 id="engineering-heading">Engineering, research & product work</h2>
			<div class="timeline">
				<ExperienceEntry
					v-for="item in engineeringExperience"
					:key="`${item.organization}-${item.title}`"
					:item="item"
				/>
			</div>
		</section>
		<section class="section-block" aria-labelledby="additional-heading">
			<h2 id="additional-heading">Teaching & additional experience</h2>
			<div class="additional-experience">
				<ExperienceEntry
					v-for="item in additionalExperience"
					:key="`${item.organization}-${item.title}`"
					:item="item"
					compact
				/>
			</div>
		</section>
	</div>
</template>

<style scoped>
.experience-page,
.section-block {
	display: flex;
	flex-direction: column;
}

.experience-page {
	gap: 2rem;
}

.section-block {
	gap: 1rem;
}

.section-block h2 {
	font-size: 2rem;
	line-height: 1.2;
}

.timeline {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 1.1rem;
	align-items: start;
}

.current-entry {
	border-color: rgba(33, 70, 97, 0.24);
	box-shadow: 0 18px 44px rgba(22, 52, 75, 0.11);
}

.additional-experience,
.role-boundary {
	max-width: 76ch;
}

.role-boundary {
	color: var(--color-text-muted);
	font-size: 0.92rem;
	line-height: 1.72;
}

@media (max-width: 900px) {
	.timeline {
		grid-template-columns: 1fr;
	}
}

@media (max-width: 640px) {
	.section-block h2 {
		font-size: 1.75rem;
	}
}
</style>

<route lang="yaml">
meta:
    layout: default
    title: Experience | Jacob Anderson
    description: Jacob Anderson's current MCC role and experience in engineering, research, product development, technical operations, and instruction.
</route>
