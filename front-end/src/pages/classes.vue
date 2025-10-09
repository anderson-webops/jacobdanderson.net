<script lang="ts" setup>
import { computed } from "vue";
import { useMainStore } from "~/stores";

const store = useMainStore();
const teaching = computed(() => store.userProfile.teaching);
</script>

<template>
  <section class="page classes-page">
    <div class="item classes-card">
      <h1>Classes for Kids & Teens</h1>
      <p class="intro">{{ teaching.blurb }}</p>
      <p class="rate">{{ teaching.rate }}</p>
      <ul>
        <li v-for="offering in teaching.offerings" :key="offering">{{ offering }}</li>
      </ul>
      <a :href="teaching.link" class="cta" target="_blank" rel="noopener">Book a lesson</a>
    </div>
  </section>
</template>

<style scoped>
.classes-page {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.classes-card {
  max-width: 680px;
  align-items: flex-start;
  text-align: left;
  gap: 20px;
}

.intro {
  margin: 0;
  color: #475569;
  line-height: 1.6;
}

.rate {
  margin: 0;
  font-weight: 600;
  color: #0f172a;
}

.classes-card ul {
  margin: 0;
  padding-left: 20px;
  color: #475569;
}

.cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 24px;
  border-radius: 12px;
  background: linear-gradient(135deg, #10b981, #14b8a6);
  color: #fff;
  font-weight: 600;
  text-decoration: none;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.cta:hover,
.cta:focus {
  transform: translateY(-1px);
  box-shadow: 0 12px 22px rgba(20, 184, 166, 0.25);
}
</style>

<route lang="json">
{
  "meta": {
    "layout": "default"
  }
}
</route>
