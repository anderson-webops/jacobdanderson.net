<script lang="ts" setup>
import { computed } from "vue";
import { useMainStore } from "~/stores";

const store = useMainStore();
const profile = computed(() => store.userProfile);
const workingLanguages = computed(() =>
	profile.value.skills.languagesSpoken
		.filter(item => !item.includes("(elementary)"))
		.map(item => item.replace(/\s*\(.*\)$/, ""))
);
</script>

<template>
	<div class="about-page">
		<section class="about-layout">
			<div class="about-main">
				<header class="page-intro">
					<h1>About Jacob</h1>
					<p>
						I’m a computer engineer and Patent Technical Specialist at Meunier Carlin & Curfman, supporting
						patent attorneys with technical analysis and application preparation under attorney supervision.
					</p>
				</header>
				<div class="about-copy">
					<section aria-labelledby="engineering-heading">
						<h2 id="engineering-heading">Engineering</h2>
						<p>
							My engineering work spans circuit simulation, sensing hardware, embedded systems, and
							software. At BYU I contributed to glucose-monitoring research and the OSCRE
							radiation-effects simulation framework, co-authoring its ISCAS 2025 paper, and helped
							deliver an industrial drill monitoring demo for Epiroc.
						</p>
					</section>
					<section aria-labelledby="beyond-heading">
						<h2 id="beyond-heading">Beyond the firm</h2>
						<p>
							I work on technical operations at AudioT and teach through Classes with Jacob, building on
							four years of instruction and instructor coaching at Juni Learning. Earlier product work
							includes co-founding the Stride search-and-rescue device concept.
						</p>
					</section>
				</div>
			</div>
			<aside class="about-aside" aria-label="Quick facts">
				<img
					class="portrait-image"
					src="/images/jacob-anderson.jpg"
					alt="Portrait of Jacob Anderson"
					fetchpriority="high"
					height="1200"
					width="1200"
				/>
				<dl class="facts">
					<div>
						<dt class="label">Based in</dt>
						<dd>{{ profile.location }}</dd>
					</div>
					<div>
						<dt class="label">Languages</dt>
						<dd>{{ workingLanguages.join(", ") }}</dd>
					</div>
					<div>
						<dt class="label">Elsewhere</dt>
						<dd class="profile-links">
							<template v-for="item in profile.profiles" :key="item.href">
								<RouterLink v-if="item.href.startsWith('/')" :to="item.href">Résumé</RouterLink>
								<a v-else :href="item.href" rel="noopener" target="_blank">{{ item.label }}</a>
							</template>
						</dd>
					</div>
				</dl>
			</aside>
		</section>
		<EducationComponent compact />
	</div>
</template>

<style scoped>
.about-page {
	display: flex;
	flex-direction: column;
	gap: var(--space-section);
}

.about-layout {
	display: grid;
	grid-template-columns: minmax(0, 1fr) minmax(0, 17rem);
	gap: 3.5rem;
	align-items: start;
}

.about-main {
	display: flex;
	flex-direction: column;
	gap: 2.5rem;
	min-width: 0;
}

.about-copy {
	display: flex;
	flex-direction: column;
	gap: 2rem;
}

.about-copy section {
	display: flex;
	flex-direction: column;
	gap: 0.6rem;
}

.about-copy h2 {
	font-size: 1.35rem;
	line-height: 1.3;
}

.about-copy p {
	color: var(--color-text-muted);
	max-width: var(--text-measure);
}

.about-aside {
	position: sticky;
	top: 6rem;
	display: flex;
	flex-direction: column;
	gap: 1.5rem;
}

.portrait-image {
	width: 100%;
	aspect-ratio: 4 / 5;
	height: auto;
	object-fit: cover;
	object-position: center 35%;
	border-radius: var(--radius-xl);
	box-shadow: var(--shadow-soft);
}

.facts {
	display: flex;
	flex-direction: column;
	gap: 1rem;
	margin: 0;
}

.facts div {
	display: flex;
	flex-direction: column;
	gap: 0.2rem;
}

.facts dd {
	margin: 0;
	color: var(--color-text-muted);
	font-size: 0.95rem;
}

.profile-links {
	display: flex;
	flex-wrap: wrap;
	gap: 0.25rem 1rem;
}

.profile-links a {
	color: var(--color-accent);
	font-weight: 600;
	text-decoration: none;
}

.profile-links a:hover {
	text-decoration: underline;
}

@media (max-width: 860px) {
	.about-layout {
		grid-template-columns: 1fr;
		gap: 2.5rem;
	}

	.about-aside {
		position: static;
		display: grid;
		grid-template-columns: 8rem minmax(0, 1fr);
		align-items: start;
	}

	.portrait-image {
		aspect-ratio: 1;
		border-radius: 50%;
	}
}

@media (max-width: 420px) {
	.about-aside {
		grid-template-columns: 1fr;
	}

	.portrait-image {
		width: 7rem;
	}
}
</style>

<route lang="yaml">
meta:
    layout: default
    title: About | Jacob Anderson
    description: Jacob Anderson's computer engineering background, patent technical work at MCC, research, education, and teaching.
</route>
