<script setup lang="ts">
import PhotoGallery from "~/components/PhotoGallery.vue";
</script>

<template>
	<header class="page-intro photo-intro">
		<RouterLink class="section-link" to="/extra">Extra</RouterLink>
		<h1>Top Photos</h1>
	</header>
	<PhotoGallery />
</template>

<style scoped>
.photo-intro {
	margin: 0 8px 1rem;
}
</style>

<route lang="yaml">
meta:
    layout: default
    wideGallery: true
    title: Top Photos | Jacob Anderson
    description: Jacob Anderson’s photos gallery.
</route>
