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
			<div class="footer-top">
				<p class="footer-note">
					Engineering engagements, research collaborations, and private instruction based in
					{{ profile.location }}.
				</p>
				<nav aria-label="Footer" class="footer-nav">
					<RouterLink v-for="link in internalLinks" :key="link.to" :to="link.to">
						{{ link.label }}
					</RouterLink>
				</nav>
			</div>

			<div class="footer-bottom">
				<div class="footer-links">
					<template v-for="item in profile.profiles" :key="item.href">
						<RouterLink v-if="item.href.startsWith('/')" :to="item.href">
							{{ item.label }}
						</RouterLink>
						<a v-else :href="item.href" rel="noopener" target="_blank">
							{{ item.label }}
						</a>
					</template>
					<a :href="`mailto:${profile.email}`">{{ profile.email }}</a>
				</div>
				<p>© {{ new Date().getFullYear() }} Jacob Anderson. All rights reserved.</p>
			</div>
		</div>
	</footer>
</template>

<style scoped>
.footer {
	padding: 0 0 1.7rem;
}

.footer-shell {
	width: min(var(--content-width), calc(100% - 3rem));
	margin: 0 auto;
	padding: 1.45rem 1.6rem;
}

.footer-top {
	display: grid;
	grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
	gap: 1.25rem;
	align-items: center;
}

.footer-note {
	color: var(--color-text-muted);
	line-height: 1.7;
	max-width: 38rem;
}

.footer-nav,
.footer-links {
	display: flex;
	flex-wrap: wrap;
	gap: 0.75rem 1rem;
}

.footer-nav {
	justify-content: flex-end;
}

.footer-nav a,
.footer-links a {
	font-weight: 600;
	text-decoration: none;
}

.footer-bottom {
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: 1rem;
	margin-top: 1.15rem;
	padding-top: 1rem;
	border-top: 1px solid var(--color-border);
}

.footer-bottom p {
	color: var(--color-text-muted);
	font-size: 0.92rem;
}

@media (max-width: 960px) {
	.footer-top {
		grid-template-columns: 1fr;
	}

	.footer-nav {
		justify-content: flex-start;
	}
}

@media (max-width: 768px) {
	.footer-shell {
		width: min(var(--content-width), calc(100% - 1.5rem));
		padding: 1.35rem 1.2rem;
	}

	.footer-bottom {
		flex-direction: column;
		align-items: flex-start;
	}
}
</style>
