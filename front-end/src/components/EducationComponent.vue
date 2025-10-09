<script lang="ts" setup>
import { computed } from "vue";
import { useMainStore } from "~/stores";

const educationStore = useMainStore();
const education = computed(() => educationStore.userProfile.education);
</script>

<template>
  <div class="item education-card">
    <h2>Education</h2>
    <ul>
      <li v-for="(item, index) in education" :key="`${item.degree}-${index}`">
        <h3>{{ item.degree }}</h3>
        <p class="institution">{{ item.institution }}</p>
        <p class="meta">{{ item.description }}</p>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.education-card {
  align-items: flex-start;
  text-align: left;
  gap: 16px;
}

.education-card ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 16px;
}

.education-card li {
  border-left: 3px solid #2563eb;
  padding-left: 16px;
}

.education-card h3 {
  margin: 0;
  color: #1e293b;
  font-size: 1.05rem;
}

.institution {
  margin: 4px 0;
  font-weight: 600;
  color: #334155;
}

.meta {
  margin: 0;
  color: #64748b;
  font-size: 0.95rem;
}
</style>
