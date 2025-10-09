<script lang="ts" setup>
import { computed } from "vue";
import { useMainStore } from "~/stores";

const store = useMainStore();
const projects = computed(() => store.userProfile.projects);
</script>

<template>
  <div class="projects-page">
    <header>
      <h1>Projects</h1>
      <p>
        Selected initiatives that highlight my approach to embedded systems, research tooling, and user-focused
        product development.
      </p>
    </header>

    <section class="grid">
      <article v-for="(project, index) in projects" :key="index" class="project-card">
        <header>
          <h2>{{ project.name }}</h2>
          <span class="timeframe">{{ project.timeframe }}</span>
        </header>
        <p class="description">{{ project.description }}</p>
        <ul>
          <li v-for="(highlight, highlightIndex) in project.highlights" :key="highlightIndex">
            {{ highlight }}
          </li>
        </ul>
      </article>
    </section>
  </div>
</template>

<style scoped>
.projects-page {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  padding: 2rem 0 4rem;
}

header {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

h1 {
  margin: 0;
  font-size: clamp(2rem, 5vw, 3rem);
  color: #0f172a;
}

header p {
  margin: 0;
  color: #334155;
  max-width: 720px;
  line-height: 1.65;
}

.grid {
  display: grid;
  gap: 1.8rem;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
}

.project-card {
  background: #ffffff;
  border-radius: 18px;
  padding: 1.75rem;
  box-shadow: 0 16px 32px rgba(15, 23, 42, 0.08);
  border: 1px solid rgba(148, 163, 184, 0.18);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.project-card header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 0.5rem;
}

h2 {
  margin: 0;
  font-size: 1.4rem;
  color: #0f172a;
}

.timeframe {
  font-weight: 600;
  color: #2563eb;
  font-size: 0.95rem;
}

.description {
  margin: 0;
  color: #334155;
}

ul {
  margin: 0;
  padding-left: 1.1rem;
  color: #475569;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

@media (max-width: 640px) {
  .project-card {
    padding: 1.4rem;
  }
}
</style>

<route lang="json">
{
  "meta": {
    "layout": "default"
  }
}
</route>
