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
		closeMenu();
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
						<span class="brand-meta">Engineering • Teaching</span>
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

				<div id="primary-nav" :class="{ expanded: isExpanded }" class="nav-panel">
					<ul class="links">
						<li v-for="link in links" :key="link.path">
							<RouterLink :class="{ active: isLinkActive(link.path) }" :to="link.path" @click="closeMenu">
								{{ link.name }}
							</RouterLink>
						</li>
					</ul>
				</div>
			</nav>
		</div>
	</header>
</template>

<style scoped>
.site-header {
	padding: 1rem 0 0;
}

.shell {
	width: min(var(--content-width), calc(100% - 3rem));
	margin: 0 auto;
}

.nav {
	display: grid;
	grid-template-columns: auto 1fr;
	align-items: center;
	gap: 0.85rem 1.2rem;
	padding: 0.85rem 1rem;
	border: 1px solid var(--color-border);
	background: rgba(255, 253, 250, 0.92);
	border-radius: var(--radius-xl);
	box-shadow: var(--shadow-card);
}

.brand {
	display: flex;
	align-items: center;
	gap: 0.72rem;
	min-width: 0;
	text-decoration: none;
}

.brand-mark {
	width: 2.65rem;
	height: 2.65rem;
	border-radius: 15px;
	display: grid;
	place-items: center;
	font-family: var(--font-display);
	font-size: 0.98rem;
	font-weight: 700;
	letter-spacing: 0.08em;
	color: var(--color-surface-strong);
	background: linear-gradient(145deg, #17364d, #33546e);
	box-shadow: 0 8px 18px rgba(22, 52, 75, 0.14);
}

.brand-copy {
	display: flex;
	flex-direction: column;
	gap: 0.14rem;
	min-width: 0;
}

.brand-name {
	color: var(--color-text);
	font-size: 0.98rem;
	font-weight: 800;
	letter-spacing: 0.01em;
}

.brand-meta {
	color: var(--color-text-muted);
	font-size: 0.68rem;
	letter-spacing: 0.12em;
	text-transform: uppercase;
	white-space: nowrap;
}

.nav-panel {
	display: flex;
	align-items: center;
	justify-content: flex-end;
	min-width: 0;
}

.links {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	justify-content: flex-end;
	gap: 0.2rem;
	list-style: none;
	margin: 0;
	padding: 0;
}

.links a {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	padding: 0.56rem 0.82rem;
	border-radius: 12px;
	color: var(--color-text-muted);
	font-weight: 600;
	text-decoration: none;
}

.links a:hover {
	background: var(--color-accent-soft);
	color: var(--color-accent-strong);
}

.links a.active {
	background: rgba(33, 70, 97, 0.1);
	color: var(--color-accent-strong);
}

.hamburger {
	display: none;
	align-items: center;
	justify-content: center;
	flex-direction: column;
	gap: 0.32rem;
	width: 2.7rem;
	height: 2.7rem;
	border: 1px solid var(--color-border);
	border-radius: 12px;
	background: rgba(255, 255, 255, 0.88);
	cursor: pointer;
}

.hamburger span {
	width: 18px;
	height: 2px;
	border-radius: 999px;
	background: var(--color-text);
	transition:
		transform 0.28s ease,
		opacity 0.28s ease;
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

@media (max-width: 900px) {
	.brand-meta {
		display: none;
	}
}

@media (max-width: 768px) {
	.shell {
		width: min(var(--content-width), calc(100% - 1.5rem));
	}

	.nav {
		grid-template-columns: auto auto;
		position: relative;
	}

	.hamburger {
		display: inline-flex;
		justify-self: end;
	}

	.nav-panel {
		display: none;
		position: absolute;
		top: calc(100% + 0.55rem);
		left: 0;
		right: 0;
		padding: 0.85rem;
		border: 1px solid var(--color-border);
		background: rgba(255, 253, 250, 0.98);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-soft);
	}

	.nav-panel.expanded {
		display: block;
	}

	.links {
		flex-direction: column;
		align-items: stretch;
	}

	.links a {
		justify-content: flex-start;
	}
}
</style>
