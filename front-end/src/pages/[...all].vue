<template>
	<div class="not-found-page">
		<header class="page-intro">
			<h1>Page not found</h1>
			<p>This link may have changed. Return home or explore another section.</p>
			<div class="button-row">
				<RouterLink class="button-primary" to="/">Return home</RouterLink>
			</div>
		</header>

		<section class="not-found-card section-panel">
			<div>
				<h2>Explore the site</h2>
			</div>
			<div class="route-list">
				<RouterLink to="/projects">Projects</RouterLink>
				<RouterLink to="/classes">Teaching</RouterLink>
				<RouterLink to="/contact">Contact</RouterLink>
			</div>
		</section>
	</div>
</template>

<style scoped>
.not-found-page {
	display: flex;
	flex-direction: column;
	gap: 1.8rem;
}

.not-found-card {
	padding: var(--panel-padding-roomy);
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: 1.2rem;
}

.not-found-card h2 {
	font-size: 1.42rem;
	line-height: 1.2;
	margin-top: 0.25rem;
}

.card-label {
	color: var(--color-highlight);
	font-size: 0.76rem;
	font-weight: 700;
	letter-spacing: 0.12em;
	text-transform: uppercase;
}

.route-list {
	display: flex;
	flex-wrap: wrap;
	gap: 0.7rem;
	justify-content: flex-end;
}

.route-list a {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	min-height: 2.75rem;
	padding: 0 1rem;
	border: 1px solid var(--color-border-strong);
	border-radius: 999px;
	color: var(--color-accent);
	font-weight: 700;
	text-decoration: none;
}

.route-list a:hover {
	background: var(--color-accent-soft);
	border-color: rgba(33, 70, 97, 0.22);
}

@media (max-width: 720px) {
	.not-found-card {
		align-items: flex-start;
		flex-direction: column;
	}

	.route-list {
		justify-content: flex-start;
	}
}
</style>

<route lang="yaml">
meta:
    layout: default
    title: Page not found | Jacob Anderson
    description: The requested page could not be found on Jacob Anderson's portfolio site.
</route>
