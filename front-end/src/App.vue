<script lang="ts" setup>
// https://github.com/vueuse/head
// you can use this to manipulate the document head in any components,
// they will be rendered correctly in the html results with vite-ssg
const siteUrl = "https://jacobdanderson.net";
const apiRoutePattern = /^\/api(?:\/|$)/;
const route = useRoute();
const summaryDescription =
	"Jacob Anderson is a computer engineer, cofounder, and educator focused on embedded systems, research tooling, and dependable technical execution.";
const pageDescription =
	"Professional portfolio for Jacob Anderson covering engineering work, research tooling, publications, and private instruction.";
const robotsContent = computed(() =>
	apiRoutePattern.test(route.path)
		? "noindex,nofollow"
		: "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1"
);
const canonicalUrl = computed(() => new URL(route.path || "/", `${siteUrl}/`).toString());
const structuredData = computed(() => [
	{
		"@context": "https://schema.org",
		"@type": "Person",
		description: summaryDescription,
		jobTitle: "Computer Engineer",
		name: "Jacob Anderson",
		url: siteUrl
	},
	{
		"@context": "https://schema.org",
		"@type": "WebSite",
		description: pageDescription,
		name: "Jacob Anderson",
		url: siteUrl
	}
]);

useHead(
	() =>
		({
			title: "Jacob Anderson",
			meta: [
				{
					name: "description",
					content: summaryDescription
				},
				{
					property: "og:title",
					content: "Jacob Anderson"
				},
				{
					property: "og:description",
					content: pageDescription
				},
				{
					property: "og:type",
					content: "website"
				},
				{
					property: "og:url",
					content: canonicalUrl.value
				},
				{
					name: "twitter:card",
					content: "summary"
				},
				{
					name: "twitter:title",
					content: "Jacob Anderson"
				},
				{
					name: "twitter:description",
					content: pageDescription
				},
				{
					name: "robots",
					content: robotsContent.value
				},
				{
					name: "theme-color",
					content: "#17364d"
				}
			],
			link: [
				{
					rel: "icon",
					type: "image/x-icon",
					href: "https://jacobdanderson.s3.us-east-1.amazonaws.com/Favicons/favicons+Logo+Bo+Light/favicon.ico"
				},
				{
					rel: "icon",
					type: "image/png",
					sizes: "32x32",
					href: "https://jacobdanderson.s3.amazonaws.com/Favicons/favicons+Logo+Bo+Light/favicon-32x32.png"
				},
				{
					rel: "icon",
					type: "image/png",
					sizes: "16x16",
					href: "https://jacobdanderson.s3.amazonaws.com/Favicons/favicons+Logo+Bo+Light/favicon-16x16.png"
				},
				{
					rel: "apple-touch-icon",
					sizes: "180x180",
					href: "https://jacobdanderson.s3.amazonaws.com/Favicons/favicons+Logo+Bo+Light/apple-touch-icon.png"
				},
				{
					rel: "canonical",
					href: canonicalUrl.value
				}
			],
			script: [
				...(import.meta.env.PROD
					? [
							{
								defer: true,
								src: "https://analytics.jacobdanderson.net/script.js",
								"data-website-id": "19f6cd2d-77d7-408e-9bb4-a5c38ce46bdc"
							}
						]
					: []),
				...structuredData.value.map((entry, index) => ({
					innerHTML: JSON.stringify(entry),
					key: `ld-json-${index}`,
					type: "application/ld+json"
				}))
			]
		}) as any
);
</script>

<template>
	<RouterView />
</template>
