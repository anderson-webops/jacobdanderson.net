<script setup lang="ts">
defineProps<{ name: "star" | "eye" | "eye-off" | "trash" | "grip"; filled?: boolean }>();
</script>

<template>
	<svg
		aria-hidden="true"
		viewBox="0 0 24 24"
		width="22"
		height="22"
		fill="none"
		stroke="currentColor"
		stroke-width="1.7"
		stroke-linecap="round"
		stroke-linejoin="round"
	>
		<path
			v-if="name === 'star'"
			d="m12 2.4 2.9 6 6.6 1-4.8 4.7 1.2 6.6-5.9-3.1-5.9 3.1 1.2-6.6-4.8-4.7 6.6-1Z"
			:fill="filled ? 'currentColor' : 'none'"
		/>
		<g v-else-if="name === 'eye'">
			<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
			<circle cx="12" cy="12" r="3" />
		</g>
		<g v-else-if="name === 'eye-off'">
			<path
				d="m3 3 18 18M10 5.2l2-.2c6.5 0 10 7 10 7a20 20 0 0 1-3 3.9M6.2 6.7A21 21 0 0 0 2 12s3.5 7 10 7c1.7 0 3.3-.5 4.7-1.2M10 10a3 3 0 0 0 4 4"
			/>
		</g>
		<g v-else-if="name === 'trash'"><path d="M3.5 6.5h17M9 6V3.5h6V6M6 7l1 13.5h10L18 7M10 10v7M14 10v7" /></g>
		<path v-else d="M9 5h.01M15 5h.01M9 12h.01M15 12h.01M9 19h.01M15 19h.01" stroke-width="3.6" />
	</svg>
</template>
