<script lang="ts" setup>
import type { Gallery } from "~/utils/gallery";
import { nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import GalleryPage from "~/components/GalleryPage.vue";
import GalleryPublisher from "~/components/GalleryPublisher.vue";
import ProjectVisibilityControls from "~/components/ProjectVisibilityControls.vue";
import { probeAdminGateway } from "~/utils/adminGateway";

const props = defineProps<{ collection?: Gallery }>();
const signedIn = ref(false);
const busy = ref(false);
const ready = ref(false);
const error = ref("");
const username = ref("");
const password = ref<HTMLInputElement>();
const heading = ref<HTMLElement>();
const view = ref<Gallery | "projects">(props.collection ?? "photos");
const previewing = ref(false);
const previewButton = ref<HTMLButtonElement>();
const returnButton = ref<HTMLButtonElement>();
const gateway = ref<"basic" | "login" | "unavailable">("basic");
let csrf = "";
let editorY = 0;
async function swapPreview(show: boolean) {
	if (show) editorY = window.scrollY;
	previewing.value = show;
	await nextTick();
	window.scrollTo({ top: show ? 0 : editorY, behavior: "instant" });
	(show ? returnButton.value : previewButton.value)?.focus({ preventScroll: true });
}
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
	csrf = "";
	previewing.value = false;
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
	if (typeof path !== "string") throw new Error("Invalid admin path");
	const gallery =
		/^\/api\/admin\/gallery\/(photos|drawings)(?:\/hidden(?:\/[a-f0-9]{24}|\?before=[a-f0-9]{24})?|\/[a-f0-9]{24}\/(?:favorite|visibility|move|rename|delete))?$/.exec(
			path
		);
	const permitted =
		path === "/api/admin/access" ||
		(gallery && (!props.collection || gallery[1] === props.collection)) ||
		(!props.collection && /^\/api\/admin\/projects\/[a-z0-9-]+$/.test(path));
	if (!permitted) throw new Error("Invalid admin path");
	if ((!authorization && !csrf) || Date.now() >= expires) {
		signOut("Please sign in again.");
		throw new Error("Sign-in expired");
	}
	const headers = new Headers(init.headers);
	if (authorization) headers.set("Authorization", authorization);
	else if (!["GET", "HEAD"].includes((init.method || "GET").toUpperCase())) headers.set("X-Portfolio-CSRF", csrf);
	const response = await fetch(path, {
		...init,
		cache: "no-store",
		credentials: csrf ? "same-origin" : "omit",
		redirect: "error",

		mode: "same-origin",
		headers,
		signal: controller.signal
	});
	if (signedIn.value && [401, 403].includes(response.status)) signOut("Please sign in again.");
	return response;
};

async function signIn() {
	if (!ready.value || gateway.value !== "basic" || busy.value || !password.value) return;
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
		view.value = props.collection ?? "photos";
		timer = setTimeout(signOut, Math.max(0, expires - Date.now()), "Please sign in again.");
		await nextTick();
		heading.value?.focus();
	} catch {
		if (!signal.aborted) signOut("Couldn’t sign in. Check your details and try again.");
	} finally {
		if (!signal.aborted) busy.value = false;
	}
}
async function detectGateway() {
	ready.value = false;
	const signal = controller.signal;
	const state = await probeAdminGateway(window.location.origin, signal);
	if (signal.aborted) return;
	if (state.mode === "session") {
		csrf = state.csrf;
		gateway.value = "login";
		signedIn.value = true;
		expires = Date.now() + 15 * 60_000;
		timer = setTimeout(signOut, 15 * 60_000, "Please sign in again.");
	} else {
		gateway.value = state.mode;
	}
	ready.value = true;
}
async function logout() {
	if (busy.value) return;
	if (csrf) {
		busy.value = true;
		try {
			const response = await fetch("/api/admin/logout", {
				method: "POST",
				headers: { "X-Portfolio-CSRF": csrf },
				credentials: "same-origin",
				mode: "same-origin",
				redirect: "error",
				cache: "no-store",
				signal: controller.signal
			});
			if (response.status !== 204) throw new Error();
		} catch {
			error.value = "Couldn’t confirm sign-out. Try again.";
			return;
		} finally {
			busy.value = false;
		}
	}
	signOut();
}
function restore(event: PageTransitionEvent) {
	if (event.persisted) void detectGateway();
}
onMounted(() => {
	void detectGateway();
	window.addEventListener("pageshow", restore);
	window.addEventListener("pagehide", clearAccess);
});
onBeforeUnmount(() => {
	window.removeEventListener("pagehide", clearAccess);
	window.removeEventListener("pageshow", restore);
	clearAccess();
});
</script>

<template>
	<section v-if="!signedIn" class="sign-in section-panel">
		<h1 ref="heading" tabindex="-1">Admin sign-in</h1>
		<a v-if="gateway === 'login'" class="button-primary" href="/api/admin/login">Sign in</a>
		<button v-else-if="gateway === 'unavailable'" type="button" @click="detectGateway">Retry sign-in</button>
		<form v-else method="post" action="/admin" @submit.prevent="signIn">
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
	<template v-else>
		<div v-show="!previewing" class="workspace">
			<header>
				<h1 ref="heading" tabindex="-1">
					{{ collection ? (collection === "photos" ? "Manage photos" : "Manage drawings") : "Site admin" }}
				</h1>
				<div class="switcher">
					<button
						v-if="view !== 'projects'"
						ref="previewButton"
						class="secondary"
						type="button"
						data-visitor
						@click="swapPreview(true)"
					>
						View as visitor
					</button>
					<button class="secondary" type="button" :disabled="busy" @click="logout">Sign out</button>
				</div>
			</header>
			<p v-if="error" role="alert">{{ error }}</p>
			<div v-if="!collection" class="switcher" role="group" aria-label="Manage">
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
		<section v-if="previewing && view !== 'projects'" class="visitor-preview">
			<button ref="returnButton" class="secondary" type="button" data-editor @click="swapPreview(false)">
				Back to editing
			</button>
			<GalleryPage :gallery="view" :standalone="Boolean(collection)" />
		</section>
	</template>
</template>

<style scoped>
.visitor-preview > button {
	margin: 0 0 1rem 8px;
}
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
