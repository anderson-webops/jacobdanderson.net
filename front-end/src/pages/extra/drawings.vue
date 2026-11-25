<script setup lang="ts">
import MediaGallery from "~/components/MediaGallery.vue";
</script>

<template>
	<header class="page-intro gallery-intro">
		<RouterLink class="section-link" to="/extra"
			><span aria-hidden="true">←</span> Galleries &amp; games</RouterLink
		>
		<h1>Top Drawings</h1>
	</header>
	<MediaGallery key="drawings" gallery="drawings" />
</template>

<route lang="yaml">
meta:
    layout: default
    wideGallery: true
    title: Top Drawings | Jacob Anderson
    description: Jacob Anderson’s drawings gallery.
</route>
