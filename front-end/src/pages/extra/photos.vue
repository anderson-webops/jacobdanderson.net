<script setup lang="ts">
import MediaGallery from "~/components/MediaGallery.vue";
</script>

<template>
	<header class="page-intro gallery-intro">
		<RouterLink class="section-link" to="/extra">Extra</RouterLink>
		<h1>Top Photos</h1>
	</header>
	<MediaGallery key="photos" gallery="photos" />
</template>

<route lang="yaml">
meta:
    layout: default
    wideGallery: true
    title: Top Photos | Jacob Anderson
    description: Jacob Anderson’s photos gallery.
</route>
