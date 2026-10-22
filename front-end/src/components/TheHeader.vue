<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";

const isExpanded = ref(false);
const route = useRoute();

const links = [
	{ name: "About", path: "/about" },
	{ name: "Experience", path: "/experience" },
	{ name: "Projects", path: "/projects" },
	{ name: "Teaching", path: "/classes" },
	{ name: "Contact", path: "/contact" }
];

const activePath = computed(() => route.path);

function isLinkActive(path: string) {
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
	<header class="site-header" @keydown.esc="closeMenu">
		<div class="shell">
			<nav aria-label="Primary" class="nav">
				<RouterLink class="brand" to="/" @click="closeMenu">
					<img
						class="brand-mark"
						src="/images/original-logos/logo-bo-light.png"
						alt=""
						height="688"
						width="686"
					/>
					<span class="brand-name">Jacob Anderson</span>
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
							<RouterLink
								:aria-current="isLinkActive(link.path) ? 'page' : undefined"
								:class="{ active: isLinkActive(link.path) }"
								:to="link.path"
								@click="closeMenu"
							>
								{{ link.name }}
							</RouterLink>
						</li>
					</ul>
					<RouterLink
						:aria-current="isLinkActive('/resume') ? 'page' : undefined"
						class="resume-link"
						to="/resume"
						@click="closeMenu"
					>
						Résumé
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
	z-index: 100;
	background: var(--color-header);
	border-bottom: 1px solid var(--color-border);
	backdrop-filter: saturate(1.4) blur(12px);
	-webkit-backdrop-filter: saturate(1.4) blur(12px);
}

.shell {
	width: min(var(--content-width), calc(100% - 3rem));
	margin: 0 auto;
}

.nav {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 1rem;
	min-height: 4rem;
}

.brand {
	display: flex;
	align-items: center;
	gap: 0.65rem;
	min-width: 0;
	text-decoration: none;
}

.brand-mark {
	width: 2.1rem;
	height: 2.1rem;
	border-radius: 10px;
	object-fit: cover;
	background: #ffffff;
}

.brand-name {
	color: var(--color-text);
	font-size: 1rem;
	font-weight: 700;
	letter-spacing: 0.005em;
	white-space: nowrap;
}

.nav-panel {
	display: flex;
	align-items: center;
	gap: 0.75rem;
	min-width: 0;
}

.links {
	display: flex;
	align-items: center;
	gap: 0.15rem;
	list-style: none;
	margin: 0;
	padding: 0;
}

.links a {
	position: relative;
	display: inline-flex;
	align-items: center;
	padding: 0.5rem 0.7rem;
	border-radius: 8px;
	color: var(--color-text-muted);
	font-size: 0.95rem;
	font-weight: 550;
	text-decoration: none;
}

.links a:hover {
	color: var(--color-text);
}

.links a.active {
	color: var(--color-text);
}

.links a.active::after {
	content: "";
	position: absolute;
	left: 0.7rem;
	right: 0.7rem;
	bottom: 0.2rem;
	height: 2px;
	border-radius: 2px;
	background: var(--color-accent);
}

.resume-link {
	display: inline-flex;
	align-items: center;
	min-height: 2.3rem;
	padding: 0 1rem;
	border: 1px solid var(--color-border-strong);
	border-radius: 999px;
	color: var(--color-text);
	font-size: 0.92rem;
	font-weight: 650;
	text-decoration: none;
}

.resume-link:hover,
.resume-link[aria-current="page"] {
	border-color: var(--color-accent);
	color: var(--color-accent);
}

.hamburger {
	display: none;
	align-items: center;
	justify-content: center;
	flex-direction: column;
	gap: 0.3rem;
	width: 2.75rem;
	height: 2.75rem;
	border: 1px solid var(--color-border);
	border-radius: 10px;
	background: transparent;
	cursor: pointer;
}

.hamburger span {
	width: 18px;
	height: 2px;
	border-radius: 999px;
	background: var(--color-text);
	transition:
		transform 0.25s ease,
		opacity 0.25s ease;
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

@media (max-width: 820px) {
	.shell {
		width: min(var(--content-width), calc(100% - 2rem));
	}

	.nav {
		position: relative;
	}

	.hamburger {
		display: inline-flex;
	}

	.nav-panel {
		display: none;
		position: absolute;
		top: calc(100% + 0.5rem);
		left: 0;
		right: 0;
		flex-direction: column;
		align-items: stretch;
		gap: 0.5rem;
		padding: 0.6rem;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		background: var(--color-surface-strong);
		box-shadow: var(--shadow-soft);
	}

	.nav-panel.expanded {
		display: flex;
	}

	.links {
		flex-direction: column;
		align-items: stretch;
	}

	.links a {
		padding: 0.75rem 0.85rem;
		font-size: 1rem;
	}

	.links a.active {
		background: var(--color-accent-soft);
	}

	.links a.active::after {
		display: none;
	}

	.resume-link {
		justify-content: center;
		min-height: 2.75rem;
	}
}

@media print {
	.site-header {
		display: none;
	}
}
</style>
