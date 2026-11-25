<script setup lang="ts">
import GalleryGrid from "~/components/GalleryGrid.vue";
</script>

<template>
	<div class="page-intro">
		<RouterLink class="section-link" to="/extra">Extra</RouterLink>
		<h1>Top Photos</h1>
		<GalleryGrid gallery="photos" />
	</div>
</template>

<route lang="yaml">
meta:
    layout: default
    title: Top Photos | Jacob Anderson
    description: Jacob Anderson’s photos gallery.
</route>
