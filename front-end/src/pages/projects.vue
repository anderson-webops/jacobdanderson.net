<script lang="ts" setup>
import { computed } from "vue";
import { useMainStore } from "~/stores";

const store = useMainStore();
const projects = computed(() => store.userProfile.projects);
</script>

<template>
  <div class="page">
    <h1>Projects</h1>
    <div class="projects-grid">
      <article v-for="(project, index) in projects" :key="index" class="project-card">
        <div class="project-card__header">
          <h2>{{ project.name }}</h2>
          <span class="project-card__timeframe">{{ project.timeframe }}</span>
        </div>
        <p class="project-card__description">{{ project.description }}</p>
        <ul v-if="project.tech?.length" class="project-card__tags">
          <li v-for="tag in project.tech" :key="tag">{{ tag }}</li>
        </ul>
      </article>
    </div>
  </div>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.projects-grid {
  display: grid;
  gap: 2rem;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
}

.project-card {
  background: #ffffff;
  border-radius: 22px;
  padding: 2rem;
  box-shadow: 0 15px 32px rgba(15, 23, 42, 0.08);
  border: 1px solid rgba(45, 212, 191, 0.18);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.project-card__header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 0.75rem;
}

.project-card__timeframe {
  font-weight: 600;
  color: #0f766e;
}

.project-card__description {
  margin: 0;
  color: #374151;
  line-height: 1.6;
}

.project-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.project-card__tags li {
  padding: 0.35rem 0.75rem;
  background: rgba(236, 253, 245, 0.9);
  color: #0f766e;
  border-radius: 999px;
  font-size: 0.85rem;
  border: 1px solid rgba(45, 212, 191, 0.35);
}
</style>

<route lang="json">
{
  "meta": {
    "layout": "default"
  }
}
</route>
