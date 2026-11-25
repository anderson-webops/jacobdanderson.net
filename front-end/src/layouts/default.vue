<script setup lang="ts">
const route = useRoute();
</script>

<template>
	<a class="skip-link" href="#main-content">Skip to main content</a>
	<div class="site-shell">
		<TheHeader />
		<main
			id="main-content"
			class="site-main"
			:class="{ 'wide-gallery': route.meta.wideGallery === true }"
			tabindex="-1"
		>
			<RouterView />
		</main>
		<TheFooter />
	</div>
</template>

<style scoped>
@media screen {
	.site-main.wide-gallery {
		width: min(1920px, calc(100% - 2 * clamp(10px, 1.25vw, 24px)));
		padding-top: clamp(1rem, 2.5vw, 2rem);
	}

	.wide-gallery :deep(.gallery-intro) {
		margin: 0 8px 1rem;
	}

	.wide-gallery :deep(.gallery-intro .section-link::after) {
		content: none;
	}
}

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
