<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";

const isExpanded = ref(false);
const route = useRoute();

const links = [
	{ name: "Home", path: "/" },
	{ name: "About", path: "/about" },
	{ name: "Experience", path: "/experience" },
	{ name: "Projects", path: "/projects" },
	{ name: "Teaching", path: "/classes" },
	{ name: "Contact", path: "/contact" }
];

const activePath = computed(() => route.path);

function isLinkActive(path: string) {
	if (path === "/") return activePath.value === "/";

	return activePath.value.startsWith(path);
}

function toggleMenu() {
	isExpanded.value = !isExpanded.value;
}

function closeMenu() {
	isExpanded.value = false;
}

watch(
	() => route.path,
	() => {
		isExpanded.value = false;
	}
);
</script>

<template>
	<header class="site-header">
		<div class="shell">
			<nav aria-label="Primary" class="nav">
				<RouterLink class="brand" to="/" @click="closeMenu">
					<div class="brand-mark">JA</div>
					<div class="brand-copy">
						<span class="brand-name">Jacob Anderson</span>
						<span class="brand-meta"
							>Computer Engineer • Cofounder • Educator</span
						>
					</div>
				</RouterLink>

				<button
					:aria-expanded="isExpanded"
					aria-controls="primary-nav"
					aria-label="Toggle navigation"
					class="hamburger"
					type="button"
					@click="toggleMenu"
				>
					<span :class="{ open: isExpanded }" />
					<span :class="{ open: isExpanded }" />
					<span :class="{ open: isExpanded }" />
				</button>

				<div
					id="primary-nav"
					:class="{ expanded: isExpanded }"
					class="nav-panel"
				>
					<ul class="links">
						<li v-for="link in links" :key="link.path">
							<RouterLink
								:class="{ active: isLinkActive(link.path) }"
								:to="link.path"
								@click="closeMenu"
							>
								{{ link.name }}
							</RouterLink>
						</li>
					</ul>

					<RouterLink
						class="nav-cta"
						to="/contact"
						@click="closeMenu"
					>
						Get in touch
					</RouterLink>
				</div>
			</nav>
		</div>
	</header>
</template>

<style scoped>
.site-header {
	position: sticky;
	top: 0;
	z-index: 30;
	padding: 1rem 0 0;
}

.shell {
	width: min(1120px, calc(100% - 3rem));
	margin: 0 auto;
}

.nav {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 1.25rem;
	padding: 0.9rem 1.1rem;
	border: 1px solid rgba(17, 29, 43, 0.1);
	background: rgba(255, 252, 247, 0.76);
	border-radius: 999px;
	backdrop-filter: blur(18px);
	box-shadow: 0 12px 30px rgba(17, 29, 43, 0.08);
}

.brand {
	display: flex;
	align-items: center;
	gap: 0.75rem;
	text-decoration: none;
	min-width: 0;
}

.brand-mark {
	width: 2.85rem;
	height: 2.85rem;
	border-radius: 50%;
	display: grid;
	place-items: center;
	font-family: var(--font-display);
	font-size: 1.05rem;
	font-weight: 700;
	letter-spacing: 0.08em;
	color: var(--color-surface-strong);
	background: linear-gradient(135deg, #17364d, #345f7a);
	box-shadow: 0 12px 24px rgba(23, 54, 77, 0.22);
}

.brand-copy {
	display: flex;
	flex-direction: column;
	min-width: 0;
}

.brand-name {
	font-size: 1rem;
	font-weight: 800;
	letter-spacing: 0.02em;
	color: var(--color-text);
}

.brand-meta {
	font-size: 0.74rem;
	letter-spacing: 0.12em;
	text-transform: uppercase;
	color: var(--color-text-muted);
	white-space: nowrap;
}

.nav-panel {
	display: flex;
	align-items: center;
	gap: 1rem;
}

.links {
	display: flex;
	align-items: center;
	gap: 0.4rem;
	list-style: none;
	margin: 0;
	padding: 0;
}

.links li a {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	font-weight: 600;
	color: var(--color-text-muted);
	text-decoration: none;
	padding: 0.65rem 0.95rem;
	border-radius: 999px;
}

.links li a:hover {
	background: rgba(33, 74, 104, 0.08);
	color: var(--color-accent);
}

.links li a.active {
	background: rgba(23, 54, 77, 0.92);
	color: var(--color-surface-strong);
	box-shadow: 0 10px 22px rgba(23, 54, 77, 0.18);
}

.nav-cta {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	padding: 0.7rem 1.15rem;
	border-radius: 999px;
	border: 1px solid rgba(17, 29, 43, 0.12);
	background: rgba(255, 255, 255, 0.88);
	color: var(--color-accent-strong);
	font-weight: 700;
	text-decoration: none;
	white-space: nowrap;
}

.nav-cta:hover {
	border-color: rgba(23, 54, 77, 0.22);
	background: rgba(255, 255, 255, 0.96);
	transform: translateY(-1px);
}

.hamburger {
	display: none;
	flex-direction: column;
	gap: 0.35rem;
	background: rgba(255, 255, 255, 0.82);
	border: 1px solid rgba(17, 29, 43, 0.1);
	border-radius: 999px;
	cursor: pointer;
	padding: 0.75rem;
}

.hamburger span {
	width: 20px;
	height: 2px;
	background: var(--color-text);
	border-radius: 999px;
	transition:
		transform 0.3s ease,
		opacity 0.3s ease;
}

.hamburger span.open:nth-child(1) {
	transform: translateY(6px) rotate(45deg);
}

.hamburger span.open:nth-child(2) {
	opacity: 0;
}

.hamburger span.open:nth-child(3) {
	transform: translateY(-6px) rotate(-45deg);
}

@media (max-width: 768px) {
	.shell {
		width: min(1120px, calc(100% - 1.5rem));
	}

	.nav {
		border-radius: 24px;
		padding: 0.95rem 1rem;
		position: relative;
	}

	.hamburger {
		display: flex;
	}

	.brand-meta {
		white-space: normal;
	}

	.nav-panel {
		position: absolute;
		top: calc(100% + 0.7rem);
		left: 0;
		right: 0;
		flex-direction: column;
		align-items: stretch;
		background: rgba(255, 252, 247, 0.98);
		border: 1px solid rgba(17, 29, 43, 0.1);
		border-radius: 24px;
		padding: 1rem;
		gap: 1rem;
		display: none;
		box-shadow: 0 18px 40px rgba(17, 29, 43, 0.12);
	}

	.nav-panel.expanded {
		display: flex;
	}

	.links {
		flex-direction: column;
		align-items: stretch;
	}

	.links li a {
		width: 100%;
		justify-content: flex-start;
	}

	.nav-cta {
		width: 100%;
	}
}

@media (max-width: 560px) {
	.brand {
		gap: 0.65rem;
	}

	.brand-mark {
		width: 2.55rem;
		height: 2.55rem;
	}

	.brand-name {
		font-size: 0.94rem;
	}
}
</style>
