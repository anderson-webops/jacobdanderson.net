<script lang="ts" setup>
import { computed } from "vue";
import { useMainStore } from "~/stores";

const store = useMainStore();
const experience = computed(() => store.userProfile.experiences);
</script>

<template>
  <div class="page">
    <h1>Experience</h1>
    <div v-for="(item, index) in experience" :key="index" class="experience-card">
      <div class="experience-card__header">
        <div>
          <h2>{{ item.role }}</h2>
          <p class="experience-card__company">{{ item.company }} • {{ item.location }}</p>
        </div>
        <span class="experience-card__timeframe">{{ item.timeframe }}</span>
      </div>
      <ul class="experience-card__highlights">
        <li v-for="highlight in item.highlights" :key="highlight">{{ highlight }}</li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.experience-card {
  background: #ffffff;
  border-radius: 24px;
  padding: 2rem;
  box-shadow: 0 18px 36px rgba(15, 23, 42, 0.08);
  border: 1px solid rgba(45, 212, 191, 0.18);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.experience-card__header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.experience-card__company {
  margin: 0;
  font-weight: 600;
  color: #1f2937;
}

.experience-card__timeframe {
  font-weight: 600;
  color: #0f766e;
}

.experience-card__highlights {
  margin: 0;
  padding-left: 1.2rem;
  color: #374151;
  display: grid;
  gap: 0.5rem;
}
</style>

<route lang="json">
{
  "meta": {
    "layout": "default"
  }
}
</route>
