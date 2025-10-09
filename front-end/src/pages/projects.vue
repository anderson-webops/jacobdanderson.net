<script lang="ts" setup>
import { computed } from "vue";
import { useMainStore } from "~/stores";

const store = useMainStore();
const projects = computed(() => store.userProfile.projects);
</script>

<template>
  <div class="projects-page">
    <header class="page-header">
      <h1>Projects</h1>
      <p>
        A selection of hands-on builds, research tools, and long-term initiatives that showcase how I
        translate ideas into reliable systems.
      </p>
    </header>
    <div class="projects-grid">
      <article v-for="project in projects" :key="project.name" class="project">
        <div class="project__head">
          <h2>{{ project.name }}</h2>
          <span class="meta">{{ project.timeframe }}</span>
        </div>
        <p>{{ project.description }}</p>
      </article>
    </div>
  </div>
</template>

<style scoped>
.projects-page {
  display: flex;
  flex-direction: column;
  gap: 3rem;
  padding-bottom: 4rem;
}

.page-header h1 {
  font-size: clamp(2.2rem, 4vw, 3rem);
  margin-bottom: 1rem;
}

.page-header p {
  max-width: 60ch;
  color: #4b5563;
  font-size: 1.1rem;
  line-height: 1.7;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.5rem;
}

.project {
  background: #fff;
  border-radius: 20px;
  padding: 1.75rem;
  border: 1px solid rgba(62, 99, 221, 0.1);
  box-shadow: 0 16px 34px -28px rgba(15, 25, 55, 0.3);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.project__head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 1rem;
}

.project__head h2 {
  margin: 0;
}

.meta {
  font-size: 0.85rem;
  color: #6b7280;
  font-weight: 600;
}

.project p {
  margin: 0;
  color: #374151;
}
</style>

<route lang="json">
{
  "meta": {
    "layout": "default"
  }
}
</route>
