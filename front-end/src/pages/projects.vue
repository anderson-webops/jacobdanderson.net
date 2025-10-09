<script lang="ts" setup>
import { computed } from "vue";
import { useMainStore } from "~/stores";

const store = useMainStore();
const projects = computed(() => store.userProfile.projects);
</script>

<template>
  <section class="page projects-page">
    <h1>Projects</h1>
    <div class="projects-grid">
      <article v-for="project in projects" :key="project.name" class="project-card item">
        <header>
          <h2>{{ project.name }}</h2>
          <p class="meta">{{ project.period }}</p>
        </header>
        <p class="summary">{{ project.summary }}</p>
        <ul>
          <li v-for="highlight in project.highlights" :key="highlight">{{ highlight }}</li>
        </ul>
      </article>
    </div>
  </section>
</template>

<style scoped>
.projects-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.project-card {
  align-items: flex-start;
  text-align: left;
  gap: 16px;
  padding: 24px;
}

.project-card header {
  width: 100%;
}

.project-card h2 {
  margin: 0;
  text-align: left;
}

.meta {
  margin: 4px 0 0;
  font-size: 0.95rem;
  color: #64748b;
}

.summary {
  margin: 0;
  color: #475569;
  line-height: 1.6;
}

.project-card ul {
  margin: 0;
  padding-left: 20px;
  color: #475569;
}
</style>

<route lang="json">
{
  "meta": {
    "layout": "default"
  }
}
</route>
