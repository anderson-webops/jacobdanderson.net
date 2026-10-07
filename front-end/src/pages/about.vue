<script lang="ts" setup>
import { computed } from "vue";
import { useMainStore } from "~/stores";

const store = useMainStore();
const profile = computed(() => store.userProfile);
</script>

<template>
	<div class="about-page">
		<section class="about-layout">
			<header class="page-intro">
				<h1>About Jacob</h1>
				<p>
					I’m a computer engineer and Patent Technical Specialist at Meunier Carlin & Curfman in the Atlanta
					area. I support patent attorneys with technical analysis and application preparation under attorney
					supervision.
				</p>
			</header>
			<img
				class="portrait-image"
				src="/images/jacob-anderson.jpg"
				alt="Portrait of Jacob Anderson"
				fetchpriority="high"
				height="1200"
				width="1200"
			/>
			<div class="about-copy">
				<p>
					My engineering work has involved circuit simulation, sensing hardware, embedded systems, and
					software. At BYU, I contributed to glucose-monitoring research and the OSCRE radiation-effects
					simulation framework, co-authoring its ISCAS 2025 paper. I also helped deliver an industrial drill
					monitoring demo for Epiroc.
				</p>
				<p>
					Outside my firm role, I work on technical operations at AudioT and teach through Classes with Jacob.
					My teaching builds on four years of instruction and instructor coaching at Juni Learning. Earlier
					product work includes co-founding the Stride search-and-rescue device concept.
				</p>
				<div class="profile-links">
					<template v-for="item in profile.profiles" :key="item.href">
						<RouterLink v-if="item.href.startsWith('/')" :to="item.href">{{ item.label }}</RouterLink>
						<a v-else :href="item.href" rel="noopener" target="_blank">{{ item.label }}</a>
					</template>
				</div>
			</div>
		</section>
		<EducationComponent compact />
	</div>
</template>

<style scoped>
.about-page {
	display: flex;
	flex-direction: column;
	gap: 2.35rem;
}

.about-layout {
	display: grid;
	grid-template-columns: minmax(0, 1.25fr) minmax(0, 0.82fr);
	grid-template-areas: "intro portrait" "story portrait";
	gap: 1rem 1.7rem;
	align-items: start;
}

.page-intro {
	grid-area: intro;
}

.about-copy {
	grid-area: story;
	display: flex;
	flex-direction: column;
	gap: 1rem;
	min-width: 0;
}

.about-copy > p {
	color: var(--color-text-muted);
	line-height: 1.75;
	max-width: var(--text-measure);
}

.portrait-image {
	grid-area: portrait;
	width: 100%;
	aspect-ratio: 4 / 5;
	height: auto;
	object-fit: cover;
	object-position: center 40%;
	border-radius: 24px;
	border: 1px solid rgba(255, 255, 255, 0.72);
	box-shadow: var(--shadow-card);
}

.profile-links {
	display: flex;
	flex-wrap: wrap;
	gap: 0.6rem 1.2rem;
}

.profile-links a {
	color: var(--color-accent);
	font-weight: 700;
	text-decoration: none;
}

@media (max-width: 960px) {
	.about-layout {
		grid-template-columns: 1fr;
		grid-template-areas: "intro" "portrait" "story";
	}

	.portrait-image {
		max-width: 360px;
		aspect-ratio: 1;
	}
}
</style>

<route lang="yaml">
meta:
    layout: default
    title: About | Jacob Anderson
    description: Jacob Anderson's computer engineering background, patent technical work at MCC, research, education, and teaching.
</route>
