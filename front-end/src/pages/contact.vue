<script lang="ts" setup>
import { computed } from "vue";
import { useMainStore } from "~/stores";

const store = useMainStore();
const profile = computed(() => store.userProfile);
const teachingProfile = computed(() => profile.value.profiles.find(item => item.label === "Teaching site")!);
</script>

<template>
	<div class="contact-page">
		<header class="page-intro">
			<h1>Contact Jacob</h1>
			<p>Email me about professional connections, engineering or research, or private lessons.</p>
		</header>
		<section class="contact-card section-panel" aria-label="Contact details">
			<a class="email-address" :href="`mailto:${profile.email}`">{{ profile.email }}</a>
			<p>{{ profile.location }} · I usually respond within two business days.</p>
			<div class="button-row">
				<a class="button-primary" :href="`mailto:${profile.email}`">Email Jacob</a>
			</div>
			<a class="section-link" :href="teachingProfile.href" rel="noopener" target="_blank">
				Lesson details and scheduling
			</a>
		</section>
		<p class="contact-guidance">
			Tell me what you’d like to discuss. For lessons, sharing the subject, goals, and availability helps us get
			started.
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
	gap: 1.4rem;
	max-width: 720px;
}

.contact-card {
	padding: var(--panel-padding-roomy);
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	gap: 0.85rem;
}

.email-address {
	color: var(--color-accent);
	font-size: 1.15rem;
	font-weight: 700;
	overflow-wrap: anywhere;
}

.contact-card p,
.contact-guidance,
.professional-boundary {
	color: var(--color-text-muted);
	line-height: 1.72;
	max-width: var(--text-measure);
}

.professional-boundary {
	border-top: 1px solid var(--color-border-strong);
	padding-top: 1rem;
	font-size: 0.92rem;
}

@media (max-width: 720px) {
	.contact-card {
		padding: var(--panel-padding);
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
