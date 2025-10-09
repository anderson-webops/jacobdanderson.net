<script lang="ts" setup>
import { computed } from "vue";
import { useMainStore } from "~/stores";

const store = useMainStore();
const experience = computed(() => store.userProfile.experience);
</script>

<template>
  <div class="experience-page">
    <header class="page-header">
      <h1>Experience</h1>
      <p>
        A snapshot of the research, product, and teaching roles where I've blended hardware intuition,
        software craftsmanship, and mentorship.
      </p>
    </header>
    <div class="timeline">
      <article v-for="item in experience" :key="item.title" class="timeline__item">
        <div class="timeline__marker" />
        <div class="timeline__content">
          <h2>{{ item.title }}</h2>
          <p class="meta">{{ item.organization }} · {{ item.timeframe }}</p>
          <p class="summary">{{ item.summary }}</p>
          <ul>
            <li v-for="highlight in item.highlights" :key="highlight">{{ highlight }}</li>
          </ul>
        </div>
      </article>
    </div>
  </div>
</template>

<style scoped>
.experience-page {
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

.timeline {
  position: relative;
  display: grid;
  gap: 2.5rem;
}

.timeline::before {
  content: "";
  position: absolute;
  top: 0;
  left: 16px;
  width: 2px;
  height: 100%;
  background: linear-gradient(180deg, rgba(62, 99, 221, 0.6), rgba(62, 99, 221, 0));
}

.timeline__item {
  display: grid;
  grid-template-columns: 40px 1fr;
  gap: 1.5rem;
}

.timeline__marker {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 3px solid #fff;
  background: #3e63dd;
  box-shadow: 0 0 0 4px rgba(62, 99, 221, 0.2);
  margin-top: 0.4rem;
}

.timeline__content {
  background: #fff;
  border-radius: 20px;
  padding: 1.75rem;
  border: 1px solid rgba(62, 99, 221, 0.12);
  box-shadow: 0 18px 36px -28px rgba(15, 25, 55, 0.35);
}

.timeline__content h2 {
  margin: 0 0 0.35rem;
}

.timeline__content .meta {
  margin: 0;
  color: #6b7280;
  font-weight: 600;
}

.timeline__content .summary {
  margin: 1rem 0;
  color: #374151;
  line-height: 1.6;
}

.timeline__content ul {
  margin: 0;
  padding-left: 1.2rem;
  display: grid;
  gap: 0.5rem;
  color: #374151;
}

@media (max-width: 640px) {
  .timeline::before {
    left: 12px;
  }

  .timeline__item {
    grid-template-columns: 30px 1fr;
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
