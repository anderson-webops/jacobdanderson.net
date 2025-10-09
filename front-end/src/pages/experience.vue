<script lang="ts" setup>
import { computed } from "vue";
import { useMainStore } from "~/stores";

const store = useMainStore();
const experiences = computed(() => store.userProfile.experience);
</script>

<template>
  <div class="experience-page">
    <header>
      <h1>Experience</h1>
      <p>
        A snapshot of the roles where I've applied embedded systems, software engineering, and instructional
        design to real-world problems.
      </p>
    </header>

    <section class="timeline">
      <article v-for="(item, index) in experiences" :key="index" class="entry">
        <div class="meta">
          <span class="timeframe">{{ item.timeframe }}</span>
          <span class="location">{{ item.location }}</span>
        </div>
        <h2>{{ item.title }}</h2>
        <p class="organization">{{ item.organization }}</p>
        <ul>
          <li v-for="(highlight, highlightIndex) in item.highlights" :key="highlightIndex">
            {{ highlight }}
          </li>
        </ul>
      </article>
    </section>
  </div>
</template>

<style scoped>
.experience-page {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  padding: 2rem 0 4rem;
}

header {
  text-align: left;
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

.timeline {
  display: grid;
  gap: 1.75rem;
}

.entry {
  background: #ffffff;
  border-radius: 18px;
  padding: 1.75rem;
  box-shadow: 0 16px 32px rgba(15, 23, 42, 0.08);
  border: 1px solid rgba(148, 163, 184, 0.18);
}

.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  font-size: 0.9rem;
  color: #2563eb;
  font-weight: 600;
}

h2 {
  margin: 0.5rem 0 0;
  color: #0f172a;
}

.organization {
  margin: 0.35rem 0 1rem;
  font-weight: 600;
  color: #1d4ed8;
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
  .entry {
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
