<script lang="ts" setup>
import About from "~/pages/about.vue";
import Experience from "~/pages/experience.vue";
import Projects from "~/pages/projects.vue";

defineOptions({
	name: 'IndexPage',
})

const router = useRouter()
function go() {
	if (name.value)
		router.push(`/hi/${encodeURIComponent(name.value)}`)
}

const { t } = useI18n()
useHead({
	title: () => t('button.home'),
})
</script>

<template>
	<div class="page">
		<About class="about" />
		<div class="projects-experience">
			<Projects class="projects" />
			<Experience class="experience" />
		</div>
	</div>
</template>

<style scoped>
.about {
	width: 100%;
}

.projects-experience {
	display: flex;
	flex-direction: row;
	width: 100%;
}

.projects,
.experience {
	width: 50%;
}

.projects {
	margin-right: 10px;
}

@media (max-width: 600px) {
	.projects-experience {
		flex-direction: column;
	}

	.projects,
	.experience {
		width: 100%;
		margin: 0;
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
