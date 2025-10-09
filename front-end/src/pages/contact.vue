<script lang="ts" setup>
import { computed } from "vue";
import { useMainStore } from "~/stores";

const store = useMainStore();
const profile = computed(() => store.userProfile);
</script>

<template>
  <div class="contact-page">
    <section class="card">
      <h1>Let's connect</h1>
      <p>
        I'd love to talk about embedded systems projects, research collaborations, or custom lessons for your
        student. Reach out directly and I'll respond within two business days.
      </p>
      <div class="info-grid">
        <div>
          <span class="label">Email</span>
          <a :href="`mailto:${profile.email}`">{{ profile.email }}</a>
        </div>
        <div>
          <span class="label">Phone</span>
          <a :href="`tel:${profile.phone}`">{{ profile.phone }}</a>
        </div>
        <div>
          <span class="label">Location</span>
          <span>{{ profile.location }}</span>
        </div>
      </div>
      <RouterLink class="cta" to="/classes">Learn about private lessons →</RouterLink>
    </section>
  </div>
</template>

<style scoped>
.contact-page {
  display: flex;
  justify-content: center;
  padding: 3rem 0 5rem;
}

.card {
  background: #ffffff;
  border-radius: 24px;
  padding: 2.5rem;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.12);
  border: 1px solid rgba(148, 163, 184, 0.2);
  max-width: 640px;
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}

h1 {
  margin: 0;
  font-size: clamp(2rem, 4vw, 3rem);
  color: #0f172a;
}

p {
  margin: 0;
  color: #334155;
  line-height: 1.65;
}

.info-grid {
  display: grid;
  gap: 1rem;
}

.info-grid div {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  color: #1f2937;
}

.label {
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #64748b;
  letter-spacing: 0.08em;
}

a {
  color: #2563eb;
  text-decoration: none;
}

.cta {
  font-weight: 600;
  color: #1d4ed8;
  text-decoration: none;
}

@media (max-width: 640px) {
  .card {
    padding: 2rem;
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
