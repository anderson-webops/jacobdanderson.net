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
      type: "image/svg+xml",
      href: () => (isDark.value ? "/favicon-dark.svg" : "/favicon.svg")
    }
  ]
});
</script>

<template>
  <RouterView />
</template>
