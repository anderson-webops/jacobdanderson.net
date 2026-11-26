<script setup lang="ts">
import type { Gallery } from "~/utils/gallery";
import MediaGallery from "./MediaGallery.vue";

defineProps<{ gallery: Gallery; standalone?: boolean }>();
</script>

<template>
	<header class="page-intro gallery-intro">
		<a v-if="standalone" class="section-link" href="https://jacobdanderson.net/extra">
			<span aria-hidden="true">←</span> Galleries &amp; games
		</a>
		<RouterLink v-else class="section-link" to="/extra">
			<span aria-hidden="true">←</span> Galleries &amp; games
		</RouterLink>
		<h1>{{ gallery === "photos" ? "Top Photos" : "Top Drawings" }}</h1>
	</header>
	<MediaGallery :key="gallery" :gallery="gallery" />
</template>
