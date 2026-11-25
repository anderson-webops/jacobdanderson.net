<template>
	<div class="extra-page">
		<header class="page-intro">
			<h1>Extra</h1>
		</header>

		<nav aria-label="Galleries">
			<ul class="bullet-list">
				<li><RouterLink class="section-link" to="/extra/photos">Top Photos</RouterLink></li>
				<li><RouterLink class="section-link" to="/extra/drawings">Top Drawings</RouterLink></li>
			</ul>
		</nav>

		<section aria-labelledby="games-heading">
			<h2 id="games-heading">Games</h2>
			<ul class="bullet-list">
				<li><a class="section-link" href="https://chess.jacobdanderson.net/">Chess</a></li>
				<li><a class="section-link" href="https://zilch.jacobdanderson.net/">Zilch</a></li>
			</ul>
		</section>

		<section aria-labelledby="strategy-heading">
			<h2 id="strategy-heading">Strategy &amp; tips</h2>
			<ul class="bullet-list">
				<li><a class="section-link" href="https://incangold.jacobdanderson.net/">Incan Gold strategy</a></li>
				<li><a class="section-link" href="https://liarsdice.jacobdanderson.net/">Liar’s Dice strategy</a></li>
			</ul>
		</section>
	</div>
</template>

<style scoped>
.extra-page {
	display: grid;
	gap: 1.75rem;
}

.extra-page h2 {
	margin-bottom: 0.6rem;
}
</style>

<route lang="yaml">
meta:
    layout: default
    title: Extra | Jacob Anderson
    description: Games, strategy, photos, and drawings by Jacob Anderson.
</route>
