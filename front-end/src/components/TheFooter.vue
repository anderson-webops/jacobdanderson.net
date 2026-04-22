<script lang="ts" setup>
import { computed } from "vue";
import { useMainStore } from "~/stores";

const store = useMainStore();
const profile = computed(() => store.userProfile);

const internalLinks = [
	{ label: "About", to: "/about" },
	{ label: "Experience", to: "/experience" },
	{ label: "Projects", to: "/projects" },
	{ label: "Teaching", to: "/classes" },
	{ label: "Contact", to: "/contact" }
];
</script>

<template>
	<footer class="footer">
		<div class="footer-shell section-panel">
			<div class="footer-grid">
				<div class="footer-brand">
					<p class="eyebrow footer-eyebrow">Jacob Anderson</p>
					<h2>Computer engineer, cofounder, and educator.</h2>
					<p>
						Engineering work, research collaborations, and private lessons based in {{ profile.location }}.
					</p>
				</div>

				<div class="footer-column">
					<span class="footer-label">Navigate</span>
					<RouterLink v-for="link in internalLinks" :key="link.to" :to="link.to">
						{{ link.label }}
					</RouterLink>
				</div>

				<div class="footer-column">
					<span class="footer-label">Profiles</span>
					<a
						v-for="item in profile.profiles"
						:key="item.href"
						:href="item.href"
						rel="noopener"
						target="_blank"
					>
						{{ item.label }}
					</a>
				</div>

				<div class="footer-column">
					<span class="footer-label">Contact</span>
					<a :href="`mailto:${profile.email}`">{{ profile.email }}</a>
					<a :href="`tel:${profile.phone}`">{{ profile.phone }}</a>
					<span>{{ profile.location }}</span>
				</div>
			</div>

			<div class="footer-bottom">
				<p>© {{ new Date().getFullYear() }} Jacob Anderson. All rights reserved.</p>
			</div>
		</div>
	</footer>
</template>

<style scoped>
.footer {
	padding: 0 0 2rem;
}

.footer-shell {
	width: min(1140px, calc(100% - 3rem));
	margin: 0 auto;
	padding: 2.25rem;
}

.footer-grid {
	display: grid;
	grid-template-columns: minmax(0, 1.6fr) repeat(3, minmax(0, 0.82fr));
	gap: 2rem;
}

.footer-brand {
	display: flex;
	flex-direction: column;
	gap: 1rem;
	max-width: 34rem;
}

.footer-eyebrow {
	color: var(--color-accent);
}

.footer-brand h2 {
	font-size: clamp(1.9rem, 4vw, 2.8rem);
	line-height: 1.06;
}

.footer-brand p,
.footer-column span:last-child {
	color: var(--color-text-muted);
	line-height: 1.72;
}

.footer-column {
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
}

.footer-label {
	color: var(--color-highlight);
	font-size: 0.75rem;
	font-weight: 700;
	letter-spacing: 0.12em;
	text-transform: uppercase;
}

.footer-column a,
.footer-column span:last-child {
	font-weight: 600;
	text-decoration: none;
}

.footer-bottom {
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: 1rem;
	margin-top: 2rem;
	padding-top: 1.25rem;
	border-top: 1px solid var(--color-border);
}

.footer-bottom p {
	color: var(--color-text-muted);
	font-size: 0.92rem;
}

@media (max-width: 960px) {
	.footer-grid {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}
}

@media (max-width: 768px) {
	.footer-shell {
		width: min(1140px, calc(100% - 1.5rem));
		padding: 1.8rem 1.35rem;
	}

	.footer-grid {
		grid-template-columns: 1fr;
	}

	.footer-bottom {
		flex-direction: column;
		align-items: flex-start;
	}
}
</style>
