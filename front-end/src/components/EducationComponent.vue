<script lang="ts" setup>
import { computed } from "vue";
import { useMainStore } from "~/stores";

const educationStore = useMainStore();
const education = computed(() => educationStore.userProfile.education);
</script>

<template>
  <section class="education">
    <h2>Education</h2>
    <div v-for="(item, index) in education" :key="index" class="education-card">
      <header>
        <h3>{{ item.program }}</h3>
        <span class="timeframe">{{ item.timeframe }}</span>
      </header>
      <p class="institution">{{ item.institution }}</p>
      <ul>
        <li v-for="(highlight, highlightIndex) in item.highlights" :key="highlightIndex">
          {{ highlight }}
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.education {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.education-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.06);
  border: 1px solid rgba(148, 163, 184, 0.2);
  text-align: left;
}

.education-card header {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.education-card h3 {
  font-size: 1.15rem;
  margin: 0;
  color: #0f172a;
}

.timeframe {
  font-size: 0.9rem;
  font-weight: 600;
  color: #2563eb;
}

.institution {
  margin: 0.75rem 0;
  font-weight: 600;
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
  .education-card {
    padding: 1.2rem;
  }
}
</style>
