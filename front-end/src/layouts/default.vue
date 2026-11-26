<script setup lang="ts">
const route = useRoute();
</script>

<template>
	<a class="skip-link" href="#main-content">Skip to main content</a>
	<div class="site-shell">
		<TheHeader v-if="route.meta.standaloneGallery !== true" />
		<main
			id="main-content"
			class="site-main"
			:class="{ 'wide-gallery': route.meta.wideGallery === true }"
			tabindex="-1"
		>
			<RouterView />
		</main>
		<TheFooter v-if="route.meta.standaloneGallery !== true" />
	</div>
</template>

<style>
@media screen {
	.site-main:is(.wide-gallery, :has(.visitor-preview)) {
		width: min(1920px, calc(100% - 2 * clamp(10px, 1.25vw, 24px)));
		padding-top: clamp(1rem, 2.5vw, 2rem);
	}

	.site-main:is(.wide-gallery, :has(.visitor-preview)) .gallery-intro {
		margin: 0 8px 1rem;
	}

	.site-main:is(.wide-gallery, :has(.visitor-preview)) .gallery-intro .section-link::after {
		content: none;
	}
}
</style>

<style scoped>
.skip-link {
	position: absolute;
	top: 0.9rem;
	left: 1.25rem;
	z-index: 1200;
	padding: 0.7rem 1rem;
	border-radius: 999px;
	background: var(--color-accent-strong);
	color: var(--color-surface-strong);
	font-weight: 700;
	text-decoration: none;
	transform: translateY(-180%);
	transition: transform 0.2s ease;
}

.skip-link:focus-visible {
	transform: translateY(0);
}
</style>
