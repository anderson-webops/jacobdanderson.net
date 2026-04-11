<script lang="ts" setup>
// https://github.com/vueuse/head
// you can use this to manipulate the document head in any components,
// they will be rendered correctly in the html results with vite-ssg
useHead({
	title: "Jacob Anderson",
	meta: [
		{
			name: "description",
			content:
				"Jacob Anderson is a computer engineer, cofounder, and educator focused on embedded systems, research tooling, and dependable technical execution."
		},
		{
			property: "og:title",
			content: "Jacob Anderson"
		},
		{
			property: "og:description",
			content:
				"Professional portfolio for Jacob Anderson covering engineering work, research tooling, publications, and private instruction."
		},
		{
			property: "og:type",
			content: "website"
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
		}
		/*				{
          rel: 'icon',
          type: 'image/svg+xml',
          href: () => preferredDark.value ? '/favicon-dark.svg': '/favicon.svg',
        }, */
	],
	script: import.meta.env.PROD
		? [
				{
					defer: true,
					src: "https://analytics.jacobdanderson.net/script.js",
					"data-website-id": "19f6cd2d-77d7-408e-9bb4-a5c38ce46bdc"
				}
			]
		: []
});
</script>

<template>
	<RouterView />
</template>
