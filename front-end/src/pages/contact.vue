<script lang="ts" setup>
import { computed } from "vue";
import { useMainStore } from "~/stores";

const store = useMainStore();
const profile = computed(() => store.userProfile);
</script>

<template>
  <section class="page contact-page">
    <div class="item contact-card">
      <h1>Let's Connect</h1>
      <p>
        I love collaborating on thoughtful products, tackling complex engineering problems, and helping students discover a love
        for technology. Reach out directly using the details below.
      </p>
      <dl class="contact-list">
        <div>
          <dt>Email</dt>
          <dd><a :href="`mailto:${profile.email}`">{{ profile.email }}</a></dd>
        </div>
        <div>
          <dt>Phone</dt>
          <dd><a :href="`tel:${profile.phone}`">{{ profile.phone }}</a></dd>
        </div>
        <div>
          <dt>Location</dt>
          <dd>{{ profile.location }}</dd>
        </div>
      </dl>
      <RouterLink class="cta" to="/classes">Learn about my classes</RouterLink>
    </div>
  </section>
</template>

<style scoped>
.contact-page {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.contact-card {
  max-width: 640px;
  text-align: left;
  align-items: flex-start;
  gap: 20px;
}

.contact-card p {
  margin: 0;
  color: #475569;
  line-height: 1.6;
}

.contact-list {
  width: 100%;
  display: grid;
  gap: 16px;
  margin: 0;
}

.contact-list div {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.contact-list dt {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #64748b;
}

.contact-list dd {
  margin: 0;
  font-size: 1rem;
  color: #1f2937;
}

.contact-list a {
  color: #2563eb;
  text-decoration: none;
}

.contact-list a:hover,
.contact-list a:focus {
  text-decoration: underline;
}

.cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 20px;
  border-radius: 999px;
  background: linear-gradient(135deg, #2563eb, #0ea5e9);
  color: #fff;
  font-weight: 600;
  text-decoration: none;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.cta:hover,
.cta:focus {
  transform: translateY(-1px);
  box-shadow: 0 10px 20px rgba(14, 165, 233, 0.25);
}
</style>

<route lang="json">
{
  "meta": {
    "layout": "default"
  }
}
</route>
