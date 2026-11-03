<script lang="ts" setup>
import { computed, ref } from "vue";
import { useMainStore } from "~/stores";

const store = useMainStore();
const profile = computed(() => store.userProfile);
const teachingProfile = computed(() => profile.value.profiles.find(item => item.label === "Teaching site")!);
const copyStatus = ref("");

async function copyEmail() {
	try {
		await navigator.clipboard.writeText(profile.value.email);
		copyStatus.value = "Copied";
	} catch {
		copyStatus.value = "Copy unavailable";
	}
}
</script>

<template>
	<div class="contact-page">
		<header class="page-intro">
			<h1>Contact Jacob</h1>
			<p>Email me about professional connections, engineering or research, or private lessons.</p>
		</header>
		<section class="contact-card" aria-label="Contact details">
			<a class="email-address" :href="`mailto:${profile.email}`">{{ profile.email }}</a>
			<p>{{ profile.location }} · I usually respond within two business days.</p>
			<div class="button-row">
				<a class="button-primary" :href="`mailto:${profile.email}`">Email Jacob</a>
				<button class="button-secondary" type="button" @click="copyEmail">Copy address</button>
				<span class="copy-status" role="status">{{ copyStatus }}</span>
			</div>
		</section>
		<p class="contact-guidance">
			For lessons, sharing the subject, goals, and availability helps us get started.
			<a :href="teachingProfile.href" rel="noopener" target="_blank">Lesson details</a>
		</p>
		<p class="professional-boundary">
			My patent-related work is performed through Meunier Carlin & Curfman under attorney supervision. This
			personal site is not an offer of legal or patent services.
		</p>
	</div>
</template>

<style scoped>
.contact-page {
	display: flex;
	flex-direction: column;
	gap: 2rem;
	max-width: 680px;
}

.contact-card {
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	gap: 0.75rem;
	padding: var(--panel-padding-roomy);
	border: 1px solid var(--color-border);
	border-radius: var(--radius-lg);
	background: var(--color-surface-strong);
	box-shadow: var(--shadow-card);
}

.email-address {
	color: var(--color-text);
	font-family: var(--font-display);
	font-size: clamp(1.35rem, 4vw, 1.9rem);
	font-weight: 700;
	line-height: 1.25;
	overflow-wrap: anywhere;
	text-decoration: none;
}

.email-address:hover {
	color: var(--color-accent);
}

.contact-card p {
	color: var(--color-text-muted);
}

.contact-card .button-row {
	align-items: center;
	margin-top: 0.5rem;
}

.copy-status {
	color: var(--color-text-subtle);
	font-size: 0.9rem;
}

.contact-guidance,
.professional-boundary {
	color: var(--color-text-muted);
	max-width: var(--text-measure);
}

.contact-guidance a {
	color: var(--color-accent);
	font-weight: 600;
}

.professional-boundary {
	padding-top: 1.25rem;
	border-top: 1px solid var(--color-border);
	color: var(--color-text-subtle);
	font-size: 0.9rem;
}

@media (max-width: 520px) {
	.contact-card {
		align-items: stretch;
	}
}
</style>

<route lang="yaml">
meta:
    layout: default
    title: Contact | Jacob Anderson
    description: Email Jacob Anderson about professional connections, engineering and research, or private lessons.
</route>
