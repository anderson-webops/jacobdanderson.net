<script setup lang="ts">
import GalleryGrid from "~/components/GalleryGrid.vue";
</script>

<template>
	<div class="page-intro">
		<RouterLink class="section-link" to="/extra">Extra</RouterLink>
		<h1>Top Drawings</h1>
		<GalleryGrid gallery="drawings" />
	</div>
</template>

<route lang="yaml">
meta:
    layout: default
    title: Top Drawings | Jacob Anderson
    description: Jacob Anderson’s drawings gallery.
</route>
