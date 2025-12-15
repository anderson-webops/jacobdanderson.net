<script setup lang="ts">
import { api } from "@/api";
import { useAppStore } from "@/stores/app";

const app = useAppStore();
const email = ref("");
const password = ref("");

async function handleSubmit() {
	try {
		const response = await api.post(
			"/accounts/login",
			{
				email: email.value,
				password: password.value
			},
			{ withCredentials: true }
		);

		if (response?.data?.currentUser) {
			app.setCurrentUser(response.data.currentUser);
		}
		app.setLoginBlock(false);
		// eslint-disable-next-line unused-imports/no-unused-vars
	} catch (err) {
		// Keep modal open on failure; surface errors via UI when available.
	}
}
</script>

<template>
	<div class="loginForm modal" :class="{ showLogin: app.loginBlock }">
		<form @submit.prevent="handleSubmit">
			<input id="uname" v-model="email" type="email" />
			<input id="psw1" v-model="password" type="password" />
			<button type="submit">Login</button>
		</form>
	</div>
</template>
