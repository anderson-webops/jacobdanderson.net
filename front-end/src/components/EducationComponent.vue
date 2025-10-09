<script lang="ts" setup>
import { computed } from "vue";
import { useMainStore } from "~/stores";

const educationStore = useMainStore();
const education = computed(() => educationStore.$state.userProfile.education);
</script>

<template>
  <div>
    <h2>Education</h2>
    <div v-for="(item, index) in education" :key="index" class="education-card">
      <div class="education-card__header">
        <h3>{{ item.degree }}</h3>
        <span class="education-card__timeframe">{{ item.timeframe }}</span>
      </div>
      <p class="education-card__institution">{{ item.institution }}</p>
      <p class="education-card__details">{{ item.details }}</p>
      <ul v-if="item.highlights?.length" class="education-card__highlights">
        <li v-for="highlight in item.highlights" :key="highlight">{{ highlight }}</li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.education-card {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.75rem;
  border-radius: 20px;
  border: 1px solid rgba(45, 212, 191, 0.25);
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 12px 26px rgba(15, 23, 42, 0.08);
  margin-bottom: 1.5rem;
}

.education-card__header {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
  justify-content: space-between;
}

.education-card__timeframe {
  font-weight: 600;
  color: #0f766e;
}

.education-card__institution {
  font-weight: 600;
  color: #1f2937;
}

.education-card__details {
  margin: 0;
  color: #4b5563;
  line-height: 1.6;
}

.education-card__highlights {
  margin: 0;
  padding-left: 1.2rem;
  color: #374151;
  display: grid;
  gap: 0.4rem;
}
</style>
