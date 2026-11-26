<script setup lang="ts">
import GalleryPage from "~/components/GalleryPage.vue";
</script>

<template>
	<GalleryPage gallery="photos" />
</template>

<route lang="yaml">
meta:
    layout: default
    wideGallery: true
    title: Top Photos | Jacob Anderson
    description: Jacob Anderson’s photos gallery.
</route>
