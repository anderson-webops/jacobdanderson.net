<script lang="ts" setup>
import { computed } from "vue";
import { useMainStore } from "~/stores";

const store = useMainStore();
const teaching = computed(() => store.userProfile.teaching);
</script>

<template>
  <div class="teaching-page">
    <header class="page-header">
      <h1>1:1 Lessons for Curious Learners</h1>
      <p>
        I teach kids and teens how to turn ideas into working code, explore STEM fundamentals, and grow
        confident using Spanish in real-life contexts. Every session is tailored to their pace and
        interests.
      </p>
    </header>

    <section class="teaching-offer">
      <div class="teaching-offer__content">
        <h2>{{ teaching.headline }}</h2>
        <p>{{ teaching.summary }}</p>
        <ul>
          <li v-for="topic in teaching.topics" :key="topic">{{ topic }}</li>
        </ul>
        <p class="rate">{{ teaching.rate }}</p>
        <a class="btn" :href="teaching.ctaLink" target="_blank" rel="noopener">Schedule at classes.jacobdanderson.net</a>
      </div>
      <div class="teaching-offer__card">
        <h3>What parents can expect</h3>
        <ul>
          <li>Progress updates after each session</li>
          <li>Project-based curriculum to keep learners engaged</li>
          <li>Flexible scheduling across U.S. time zones</li>
        </ul>
      </div>
    </section>
  </div>
</template>

<style scoped>
.teaching-page {
  display: flex;
  flex-direction: column;
  gap: 3.5rem;
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

.teaching-offer {
  display: grid;
  gap: 2rem;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  align-items: start;
}

.teaching-offer__content {
  background: linear-gradient(135deg, rgba(62, 99, 221, 0.12), rgba(62, 99, 221, 0));
  border-radius: 24px;
  padding: 2.5rem;
  box-shadow: 0 20px 45px -32px rgba(15, 25, 55, 0.4);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.teaching-offer__content h2 {
  margin: 0;
}

.teaching-offer__content ul {
  margin: 0;
  padding-left: 1.1rem;
  display: grid;
  gap: 0.5rem;
}

.rate {
  font-size: 1.3rem;
  font-weight: 700;
  color: #3e63dd;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.85rem 1.75rem;
  border-radius: 999px;
  background: #3e63dd;
  color: #fff;
  font-weight: 600;
  text-decoration: none;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 30px -20px rgba(62, 99, 221, 0.7);
}

.teaching-offer__card {
  background: #fff;
  border-radius: 20px;
  padding: 2rem;
  border: 1px solid rgba(62, 99, 221, 0.12);
  box-shadow: 0 16px 34px -28px rgba(15, 25, 55, 0.3);
}

.teaching-offer__card h3 {
  margin-top: 0;
}

.teaching-offer__card ul {
  margin: 1rem 0 0;
  padding-left: 1.1rem;
  display: grid;
  gap: 0.6rem;
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
