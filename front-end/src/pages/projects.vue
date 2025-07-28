<script lang="ts" setup>
import { computed } from "vue";
import { useMainStore } from "~/stores";


const store = useMainStore();
const projects = computed(() => store.userProfile.projects);
</script>

<template>
  <div class="page">
    <h1>Projects</h1>
    <div v-for="(project, index) in projects" :key="index" class="item">
      <h2>{{ project.name }}</h2>
      <p>{{ project.description }}</p>
    </div>
  </div>
</template>

<style scoped></style>

<route lang="json">
{
"meta": {
"layout": "default"
}
}
</route>
