<script lang="ts" setup>
import { nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import GalleryPublisher from "~/components/GalleryPublisher.vue";
import ProjectVisibilityControls from "~/components/ProjectVisibilityControls.vue";

const signedIn = ref(false);
const busy = ref(false);
const ready = ref(false);
const error = ref("");
const username = ref("");
const password = ref<HTMLInputElement>();
const heading = ref<HTMLElement>();
const view = ref<"photos" | "drawings" | "projects">("photos");
let authorization = "";
let controller = new AbortController();
let expires = 0;
let timer: ReturnType<typeof setTimeout> | undefined;

function clearAccess() {
	controller.abort();
	controller = new AbortController();
	clearTimeout(timer);
	authorization = "";
	expires = 0;
	signedIn.value = false;
	busy.value = false;
	error.value = "";
	if (password.value) password.value.value = "";
}

function signOut(message = "") {
	clearAccess();
	error.value = message;
	void nextTick(() => heading.value?.focus());
}

const adminFetch: typeof fetch = async (path, init = {}) => {
	if (
		typeof path !== "string" ||
		!/^\/api\/admin\/(?:access|(?:gallery|projects)\/[a-z0-9-]+|gallery\/photos\/[a-f0-9]{24}\/favorite)$/.test(
			path
		)
	) {
		throw new Error("Invalid admin path");
	}
	if (!authorization || Date.now() >= expires) {
		signOut("Please sign in again.");
		throw new Error("Sign-in expired");
	}
	const headers = new Headers(init.headers);
	headers.set("Authorization", authorization);
	const response = await fetch(path, {
		...init,
		cache: "no-store",
		credentials: "omit",
		redirect: "error",

		mode: "same-origin",
		headers,
		signal: controller.signal
	});
	if (signedIn.value && [401, 403].includes(response.status)) signOut("Please sign in again.");
	return response;
};

async function signIn() {
	if (busy.value || !password.value) return;
	clearTimeout(timer);
	const signal = controller.signal;
	error.value = "";
	busy.value = true;
	try {
		if (username.value.includes(":")) throw new Error("Invalid username");
		const bytes = new TextEncoder().encode(`${username.value}:${password.value.value}`);
		authorization = `Basic ${btoa(String.fromCharCode(...bytes))}`;
		password.value.value = "";
		expires = Date.now() + 15 * 60_000;
		const response = await adminFetch("/api/admin/access");
		if (signal.aborted) return;
		if (response.status !== 204) {
			signOut(
				[401, 403].includes(response.status)
					? "Check your username and password."
					: response.status === 429
						? "Too many attempts. Try again shortly."
						: "Sign-in is unavailable. Try again shortly."
			);
			return;
		}
		signedIn.value = true;
		view.value = "photos";
		timer = setTimeout(signOut, Math.max(0, expires - Date.now()), "Please sign in again.");
		await nextTick();
		heading.value?.focus();
	} catch {
		if (!signal.aborted) signOut("Couldn’t sign in. Check your details and try again.");
	} finally {
		if (!signal.aborted) busy.value = false;
	}
}
onMounted(() => {
	ready.value = true;
	window.addEventListener("pagehide", clearAccess);
});
onBeforeUnmount(() => {
	window.removeEventListener("pagehide", clearAccess);
	clearAccess();
});
</script>

<template>
	<section v-if="!signedIn" class="sign-in section-panel">
		<h1 ref="heading" tabindex="-1">Admin sign-in</h1>
		<form method="post" action="/admin" @submit.prevent="signIn">
			<label
				>Username<input v-model="username" name="username" autocomplete="username" maxlength="128" required
			/></label>
			<label
				>Password<input
					ref="password"
					name="password"
					type="password"
					autocomplete="current-password"
					maxlength="512"
					required
			/></label>
			<p v-if="error" role="alert">{{ error }}</p>
			<button class="button-primary" :disabled="!ready || busy">{{ busy ? "Signing in…" : "Sign in" }}</button>
		</form>
	</section>
	<div v-else class="workspace">
		<header>
			<h1 ref="heading" tabindex="-1">Site admin</h1>
			<button class="secondary" type="button" @click="signOut()">Sign out</button>
		</header>
		<div class="switcher" role="group" aria-label="Manage">
			<button
				v-for="option in ['photos', 'drawings', 'projects'] as const"
				:key="option"
				type="button"
				:aria-pressed="view === option"
				@click="view = option"
			>
				{{ { photos: "Photos", drawings: "Drawings", projects: "Projects" }[option] }}
			</button>
		</div>
		<ProjectVisibilityControls v-if="view === 'projects'" :admin-fetch="adminFetch" />
		<GalleryPublisher v-else :key="view" :gallery="view" :admin-fetch="adminFetch" />
	</div>
</template>

<style scoped>
.sign-in {
	max-width: 26rem;
	margin: clamp(1rem, 6vh, 5rem) auto;
	padding: clamp(1.25rem, 4vw, 2.5rem);
}
.sign-in h1 {
	font-size: 2.25rem;
	margin-bottom: 1.5rem;
}
.sign-in form,
.sign-in label,
.workspace {
	display: grid;
	gap: 1rem;
}
.sign-in label {
	gap: 0.35rem;
	font-weight: 650;
}
.sign-in input {
	min-width: 0;
	border: 1px solid var(--color-text-muted);
	border-radius: 0.4rem;
	padding: 0.65rem;
	font: inherit;
	background: var(--color-surface);
}
.workspace header,
.switcher {
	display: flex;
	align-items: center;
	gap: 0.6rem;
	flex-wrap: wrap;
}
.workspace header {
	justify-content: space-between;
}
.switcher button,
.secondary {
	border: 1px solid var(--color-text-muted);
	border-radius: 2rem;
	padding: 0.5rem 1rem;
}
.switcher [aria-pressed="true"] {
	color: white;
	background: #17364d;
}
</style>

<route lang="yaml">
meta:
    layout: default
    title: Site Admin | Jacob Anderson
    description: Gallery and project administration.
    robots: noindex,nofollow
</route>
