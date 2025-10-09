<script lang="ts" setup>
import { computed } from "vue";
import { useMainStore } from "~/stores";

const store = useMainStore();
const contact = computed(() => store.userProfile.contact);
</script>

<template>
  <div class="contact-page">
    <header class="page-header">
      <h1>Let's Connect</h1>
      <p>
        I'm always open to collaborating on impactful engineering projects, research partnerships, and
        youth-focused learning opportunities. Reach out and let's start a conversation.
      </p>
    </header>
    <div class="contact-cards">
      <article class="card">
        <h2>Email</h2>
        <a :href="`mailto:${contact.email}`">{{ contact.email }}</a>
      </article>
      <article class="card">
        <h2>Phone</h2>
        <a :href="`tel:${contact.phone}`">{{ contact.phone }}</a>
      </article>
      <article class="card">
        <h2>Location</h2>
        <p>{{ contact.location }}</p>
      </article>
    </div>
  </div>
</template>

<style scoped>
.contact-page {
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

.contact-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
}

.card {
  background: #fff;
  border-radius: 20px;
  padding: 1.75rem;
  border: 1px solid rgba(62, 99, 221, 0.12);
  box-shadow: 0 16px 34px -28px rgba(15, 25, 55, 0.3);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  align-items: flex-start;
}

.card a,
.card p {
  margin: 0;
  font-size: 1.1rem;
  color: #1f2937;
  text-decoration: none;
}

.card a:hover {
  color: #3e63dd;
}
</style>

<route lang="json">
{
  "meta": {
    "layout": "default"
  }
}
</route>
