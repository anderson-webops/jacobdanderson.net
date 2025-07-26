<script lang="ts" setup>
import { computed } from "vue";
import { useMainStore } from "~/stores"; // Ensure this points to your configured Pinia store

const store = useMainStore();
const about = computed(() => store.userProfile.about); // Accessing 'about' directly from the Pinia store
</script>

<template>
	<div class="page">
		<img
			v-if="$route.path === '/'" alt="Jacob Anderson Logo" class="logo"
			src="https://jacobdanderson.s3.amazonaws.com/images/Logo 2 Saywa.png"
		>
		<img
			v-if="$route.path !== '/'" alt="Profile Picture" class="profile-pic"
			src="https://jacobdanderson.s3.amazonaws.com/images/Jacob_Anderson.jpg"
		>
		<div class="item">
			<h1>About Me</h1>
			<p>{{ about }}</p>
		</div>
		
		<!-- Do not show Education Component on home page -->
		<EducationComponent v-if="$route.path !== '/'" />
	</div>
</template>

<style scoped>
.logo {
	display: block;
	width: 150px; /* Adjust size as needed */
	height: auto;
	margin: 0 auto 20px;
}

.profile-pic {
	display: block;
	border-radius: 50%;
	width: 150px;
	height: 150px;
	object-fit: cover;
	margin: 20px auto;
}
</style>

<route lang="json">
{
"meta": {
"layout": "default"
}
}
</route>
