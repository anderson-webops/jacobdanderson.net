<script lang="ts" setup>
// https://github.com/vueuse/head
// you can use this to manipulate the document head in any components,
// they will be rendered correctly in the html results with vite-ssg
useHead({
	title: "Jacob Anderson",
	meta: [
		{
			name: "Personal Website",
			content: "This is the personal website of Jacob Anderson"
		},
		{
			name: "theme-color",
			content: () => (isDark.value ? "#00aba9" : "#ffffff")
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
	]
});
</script>

<template>
	<RouterView />
</template>
