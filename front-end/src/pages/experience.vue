<script lang="ts" setup>
import { computed } from "vue";
import { useMainStore } from "~/stores";

const store = useMainStore();
const experience = computed(() => store.userProfile.experience);
</script>

<template>
  <section class="page experience-page">
    <h1>Experience</h1>
    <div class="timeline">
      <article v-for="item in experience" :key="item.role + item.period" class="timeline-item item">
        <header>
          <div>
            <h2>{{ item.role }}</h2>
            <p class="organization">{{ item.organization }}</p>
          </div>
          <p class="meta">{{ item.period }} · {{ item.location }}</p>
        </header>
        <ul>
          <li v-for="highlight in item.highlights" :key="highlight">{{ highlight }}</li>
        </ul>
      </article>
    </div>
  </section>
</template>

<style scoped>
.experience-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.timeline {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.timeline-item {
  padding: 24px;
  align-items: flex-start;
  text-align: left;
  gap: 16px;
}

.timeline-item header {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.timeline-item h2 {
  margin: 0;
  text-align: left;
}

.organization {
  margin: 0;
  font-weight: 600;
  color: #1e293b;
}

.meta {
  margin: 0;
  font-size: 0.95rem;
  color: #64748b;
}

.timeline-item ul {
  margin: 0;
  padding-left: 20px;
  color: #475569;
  line-height: 1.6;
}

@media (min-width: 768px) {
  .timeline-item header {
    flex-direction: row;
    justify-content: space-between;
    align-items: baseline;
  }

  .organization {
    font-size: 1rem;
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
