<script lang="ts" setup>
// https://github.com/vueuse/head
// you can use this to manipulate the document head in any components,
// they will be rendered correctly in the html results with vite-ssg
const siteUrl = "https://jacobdanderson.net";
const socialImageUrl = `${siteUrl}/images/jacob-anderson.jpg`;
const apiRoutePattern = /^\/api(?:\/|$)/;
const route = useRoute();
const summaryDescription =
	"Jacob Anderson is a computer engineer, cofounder, and educator working across embedded systems, research tooling, and private instruction.";
const defaultTitle = "Jacob Anderson";
const defaultPageDescription =
	"Professional portfolio for Jacob Anderson covering engineering work, research tooling, publications, and private instruction.";
const routeTitle = computed(() =>
	typeof route.meta.title === "string" && route.meta.title.length ? route.meta.title : defaultTitle
);
const routeDescription = computed(() =>
	typeof route.meta.description === "string" && route.meta.description.length
		? route.meta.description
		: defaultPageDescription
);
const robotsContent = computed(() =>
	apiRoutePattern.test(route.path)
		? "noindex,nofollow"
		: "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1"
);
const canonicalUrl = computed(() => new URL(route.path || "/", `${siteUrl}/`).toString());
const structuredData = computed(() => {
	const person = {
		"@context": "https://schema.org",
		"@type": "Person",
		description: summaryDescription,
		email: "mailto:jacobdanderson@gmail.com",
		image: socialImageUrl,
		jobTitle: "Computer Engineer, Cofounder, and Educator",
		name: "Jacob Anderson",
		sameAs: ["https://github.com/Jacoba1100254352", "https://classes.jacobdanderson.net"],
		url: siteUrl
	};
	const page = {
		"@context": "https://schema.org",
		"@type": "WebPage",
		description: routeDescription.value,
		name: routeTitle.value,
		url: canonicalUrl.value
	};

	if (route.path === "/") {
		return [
			person,
			{
				"@context": "https://schema.org",
				"@type": "WebSite",
				description: defaultPageDescription,
				name: "Jacob Anderson",
				url: siteUrl
			},
			page
		];
	}

	return [person, page];
});

useHead(
	() =>
		({
			title: routeTitle.value,
			meta: [
				{
					name: "description",
					content: routeDescription.value
				},
				{
					property: "og:title",
					content: routeTitle.value
				},
				{
					property: "og:description",
					content: routeDescription.value
				},
				{
					property: "og:type",
					content: "website"
				},
				{
					property: "og:site_name",
					content: "Jacob Anderson"
				},
				{
					property: "og:locale",
					content: "en_US"
				},
				{
					property: "og:url",
					content: canonicalUrl.value
				},
				{
					property: "og:image",
					content: socialImageUrl
				},
				{
					property: "og:image:alt",
					content: "Portrait of Jacob Anderson"
				},
				{
					name: "twitter:card",
					content: "summary"
				},
				{
					name: "twitter:title",
					content: routeTitle.value
				},
				{
					name: "twitter:description",
					content: routeDescription.value
				},
				{
					name: "twitter:image",
					content: socialImageUrl
				},
				{
					name: "twitter:image:alt",
					content: "Portrait of Jacob Anderson"
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
					type: "image/svg+xml",
					href: "/icons/site-icon.svg"
				},
				{
					rel: "manifest",
					href: "/site.webmanifest"
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
								"data-website-id": "2458e9b0-8758-42da-bf9b-d03167f78954"
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
