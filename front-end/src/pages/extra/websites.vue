<script setup lang="ts">
const groups = {
	"Portfolio and galleries": [
		"jacobdanderson.net",
		"drawings.jacobdanderson.net",
		"music.jacobdanderson.net",
		"photos.jacobdanderson.net",
		"kyapup.com"
	],
	"Teaching and study": [
		"avasan.org",
		"classes.jacobdanderson.net",
		"cs.avasan.org",
		"math.avasan.org",
		"scheduler.classes.jacobdanderson.net",
		"civpro.jacobdanderson.net",
		"courselab.jacobdanderson.net",
		"learningstudio.jacobdanderson.net",
		"patentpractice.jacobdanderson.net",
		"thetutorlyfe.com"
	],
	"Games and strategy": [
		"chess.jacobdanderson.net",
		"cookies.jacobdanderson.net",
		"coup.jacobdanderson.net",
		"incangold.jacobdanderson.net",
		"liarsdice.jacobdanderson.net",
		"zilch.jacobdanderson.net"
	],
	"Arts and history": [
		"dvanderson.net",
		"mariettaviolinwithcarla.com",
		"retrozetrocomics.com",
		"therestoration.jacobdanderson.net",
		"versetwo.org"
	],
	"Organizations and tools": [
		"agroindustriatorca.com",
		"audiot.ai",
		"ballotclarity.org",
		"cofoundry.jacobdanderson.net",
		"isthereconsensus.org",
		"np-servicerequest.org",
		"operationopportunity.jacobdanderson.net",
		"stridewithus.co"
	]
};
</script>

<template>
	<div>
		<RouterLink class="section-link" to="/extra">← Galleries, music &amp; games</RouterLink>
		<h1>Websites I’ve built</h1>
		<section v-for="(sites, heading) in groups" :key="heading">
			<h2>{{ heading }}</h2>
			<ul>
				<li v-for="site in sites" :key="site">
					<a :href="`https://${site}/`">{{ site }}</a>
				</li>
			</ul>
		</section>
	</div>
</template>

<style scoped>
h1,
section {
	margin-top: 1.5rem;
}
ul {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(min(100%, 19rem), 1fr));
	column-gap: 2rem;
}
li {
	border-bottom: 1px solid var(--color-border);
}
li a {
	display: block;
	padding: 0.7rem 0;
	overflow-wrap: anywhere;
}
</style>

<route lang="yaml">
meta:
    layout: default
    title: Websites I’ve Built | Jacob Anderson
    description: Personal websites and sites built for others by Jacob Anderson.
</route>
