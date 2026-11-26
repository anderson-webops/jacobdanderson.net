<script setup lang="ts">
const galleries = [
	{ title: "Top Photos", path: "/extra/photos", cover: "/images/gallery-photos.svg" },
	{ title: "Top Drawings", path: "/extra/drawings", cover: "/images/gallery-drawings.svg" },
	{ title: "Music", path: "/extra/music", cover: "/images/music-sleeve.svg" }
];

const collections = [
	{
		id: "games",
		title: "Games",
		links: [
			{ title: "Chess", href: "https://chess.jacobdanderson.net/" },
			{ title: "Zilch", href: "https://zilch.jacobdanderson.net/" }
		]
	},
	{
		id: "strategy",
		title: "Strategy guides",
		links: [
			{ title: "Incan Gold", href: "https://incangold.jacobdanderson.net/" },
			{ title: "Liar’s Dice", href: "https://liarsdice.jacobdanderson.net/" }
		]
	}
];
</script>

<template>
	<div class="explore-page">
		<header class="page-intro">
			<h1>Galleries, music &amp; games</h1>
		</header>

		<nav aria-label="Galleries and music">
			<ul class="gallery-links">
				<li v-for="gallery in galleries" :key="gallery.path">
					<RouterLink class="gallery-card" :to="gallery.path">
						<img :src="gallery.cover" alt="" width="768" height="336" />
						<span class="gallery-label">
							{{ gallery.title }}
							<span class="link-arrow" aria-hidden="true">→</span>
						</span>
					</RouterLink>
				</li>
			</ul>
		</nav>

		<div class="collection-grid">
			<section v-for="collection in collections" :key="collection.id" :aria-labelledby="collection.id">
				<h2 :id="collection.id">{{ collection.title }}</h2>
				<ul class="collection-links">
					<li v-for="link in collection.links" :key="link.href">
						<a :href="link.href">
							{{ link.title }}
							<span class="link-arrow" aria-hidden="true">↗</span>
						</a>
					</li>
				</ul>
			</section>
		</div>
	</div>
</template>

<style scoped>
.explore-page {
	display: grid;
	gap: clamp(1.5rem, 4vw, 2.75rem);
}

.gallery-links,
.collection-grid {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: clamp(0.9rem, 2.5vw, 1.65rem);
}

.gallery-links {
	grid-template-columns: repeat(3, minmax(0, 1fr));
}

.gallery-card {
	display: block;
	color: var(--color-text);
	border: 1px solid var(--color-border-strong);
	border-radius: var(--radius-lg);
	background: var(--color-surface-strong);
	box-shadow: var(--shadow-card);
	text-decoration: none;
}

.gallery-card img {
	display: block;
	width: 100%;
	height: auto;
	object-fit: cover;
	aspect-ratio: 768 / 336;
	border-radius: calc(var(--radius-lg) - 1px) calc(var(--radius-lg) - 1px) 0 0;
}

.gallery-label,
.collection-links a {
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: 1rem;
}

.gallery-label {
	padding: 0.85rem clamp(0.85rem, 2vw, 1.25rem);
	font-family: var(--font-display);
	font-size: clamp(1.25rem, 2vw, 1.6rem);
	line-height: 1.25;
}

.link-arrow {
	color: var(--color-accent);
	font-family: var(--font-body);
	font-size: 1rem;
}

.gallery-card:hover {
	border-color: var(--color-accent);
}

.gallery-card:hover .gallery-label,
.collection-links a:hover {
	color: var(--color-accent);
}

.collection-grid h2 {
	margin-bottom: 0.6rem;
	font-size: 1.35rem;
}

.collection-links {
	border-top: 1px solid var(--color-border-strong);
}

.collection-links a {
	min-height: 48px;
	padding: 0.45rem 0.2rem;
	border-bottom: 1px solid var(--color-border);
	color: var(--color-text);
	font-weight: 600;
	text-decoration: none;
}

@media (max-width: 600px) {
	.gallery-links,
	.collection-grid {
		grid-template-columns: minmax(0, 1fr);
	}

	.collection-grid {
		row-gap: 1.5rem;
	}
}
</style>

<route lang="yaml">
meta:
    layout: default
    title: Galleries, Music & Games | Jacob Anderson
    description: Jacob Anderson’s photography, drawings, music, browser games, and strategy guides.
</route>
