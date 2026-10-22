<script lang="ts" setup>
import { computed } from "vue";
import { useMainStore } from "~/stores";

const store = useMainStore();
const profile = computed(() => store.userProfile);
const externalProfiles = computed(() => profile.value.profiles.filter(item => !item.href.startsWith("/")));
</script>

<template>
	<footer class="footer">
		<div class="footer-shell">
			<div class="footer-identity">
				<p class="footer-name">{{ profile.name }}</p>
				<p class="footer-note">
					{{ profile.location }}. Patent work is performed through Meunier Carlin & Curfman under attorney
					supervision.
				</p>
			</div>
			<nav aria-label="Elsewhere" class="footer-links">
				<a :href="`mailto:${profile.email}`">Email</a>
				<a v-for="item in externalProfiles" :key="item.href" :href="item.href" rel="noopener" target="_blank">
					{{ item.label }}
				</a>
			</nav>
		</div>
		<p class="footer-copyright">© {{ new Date().getFullYear() }} Jacob Anderson</p>
	</footer>
</template>

<style scoped>
.footer {
	width: min(var(--content-width), calc(100% - 3rem));
	margin: 0 auto;
	padding: 2rem 0 2.25rem;
	border-top: 1px solid var(--color-border);
}

.footer-shell {
	display: flex;
	flex-wrap: wrap;
	align-items: flex-start;
	justify-content: space-between;
	gap: 1.25rem 2rem;
}

.footer-identity {
	display: flex;
	flex-direction: column;
	gap: 0.3rem;
	max-width: 34rem;
}

.footer-name {
	font-weight: 700;
}

.footer-note,
.footer-copyright {
	color: var(--color-text-subtle);
	font-size: 0.9rem;
	line-height: 1.6;
}

.footer-links {
	display: flex;
	flex-wrap: wrap;
	gap: 0.5rem 1.25rem;
}

.footer-links a {
	color: var(--color-text-muted);
	font-size: 0.95rem;
	font-weight: 600;
	text-decoration: none;
}

.footer-links a:hover {
	color: var(--color-accent);
}

.footer-copyright {
	margin-top: 1.25rem;
}

@media (max-width: 768px) {
	.footer {
		width: min(var(--content-width), calc(100% - 2rem));
	}
}

@media print {
	.footer {
		display: none;
	}
}
</style>
