<script lang="ts" setup>
import { computed } from "vue";
import { useMainStore } from "~/stores";

const store = useMainStore();
const profile = computed(() => store.userProfile);
</script>

<template>
	<footer class="footer">
		<div class="footer-shell">
			<div class="footer-grid">
				<div class="brand-block">
					<p class="eyebrow footer-eyebrow">Jacob Anderson</p>
					<h2>
						Engineering work with clear communication and dependable
						execution.
					</h2>
					<p>
						Based in {{ profile.location }} and available for
						product engineering, research collaboration, and private
						instruction.
					</p>
				</div>

				<div class="footer-column">
					<span class="label">Contact</span>
					<a :href="`mailto:${profile.email}`">{{ profile.email }}</a>
					<a :href="`tel:${profile.phone}`">{{ profile.phone }}</a>
				</div>

				<div class="footer-column">
					<span class="label">Explore</span>
					<RouterLink to="/experience">Experience</RouterLink>
					<RouterLink to="/projects">Projects</RouterLink>
					<a
						href="https://classes.jacobdanderson.net"
						rel="noopener"
						target="_blank"
					>
						Teaching site
					</a>
					<a
						href="https://github.com/Jacoba1100254352"
						rel="noopener"
						target="_blank"
					>
						GitHub
					</a>
				</div>
			</div>

			<div class="footer-bottom">
				<p>
					© {{ new Date().getFullYear() }} Jacob Anderson. All rights
					reserved.
				</p>
				<RouterLink class="footer-link" to="/contact">
					Start a conversation
				</RouterLink>
			</div>
		</div>
	</footer>
</template>

<style scoped>
.footer {
	padding: 0 0 2rem;
}

.footer-shell {
	width: min(1120px, calc(100% - 3rem));
	margin: 0 auto;
	padding: 2.5rem;
	background: linear-gradient(180deg, #17364d, #10273a);
	color: rgba(255, 251, 245, 0.92);
	border: 1px solid rgba(255, 255, 255, 0.08);
	border-radius: 32px;
	box-shadow: 0 24px 50px rgba(16, 39, 58, 0.2);
}

.footer-grid {
	display: grid;
	grid-template-columns: minmax(0, 1.8fr) repeat(2, minmax(0, 1fr));
	gap: 2rem;
}

.brand-block {
	display: flex;
	flex-direction: column;
	gap: 1rem;
	max-width: 32rem;
}

.footer-eyebrow {
	color: rgba(191, 213, 231, 0.9);
}

.footer-eyebrow::before {
	background: rgba(191, 213, 231, 0.45);
}

.brand-block h2 {
	font-size: clamp(1.8rem, 4vw, 2.6rem);
	line-height: 1.08;
	color: #fffaf3;
}

.brand-block p {
	color: rgba(226, 232, 240, 0.82);
	line-height: 1.75;
}

.label {
	font-size: 0.75rem;
	font-weight: 700;
	letter-spacing: 0.08em;
	text-transform: uppercase;
	color: rgba(191, 213, 231, 0.7);
}

.footer-column {
	display: flex;
	flex-direction: column;
	gap: 0.8rem;
}

a {
	color: #f8f4ec;
	text-decoration: none;
	font-weight: 600;
}

a:hover {
	color: #d7e6f2;
}

.footer-bottom {
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: 1rem;
	margin-top: 2rem;
	padding-top: 1.5rem;
	border-top: 1px solid rgba(255, 255, 255, 0.12);
}

.footer-bottom p {
	font-size: 0.9rem;
	color: rgba(226, 232, 240, 0.72);
}

.footer-link {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	padding: 0.8rem 1.2rem;
	border-radius: 999px;
	background: rgba(255, 255, 255, 0.12);
	border: 1px solid rgba(255, 255, 255, 0.14);
}

.footer-link:hover {
	background: rgba(255, 255, 255, 0.18);
}

@media (max-width: 640px) {
	.footer-shell {
		width: min(1120px, calc(100% - 1.5rem));
		padding: 2rem 1.35rem;
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
