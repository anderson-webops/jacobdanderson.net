<script lang="ts" setup>
import { computed } from "vue";
import { useMainStore } from "~/stores";

const store = useMainStore();
const profile = computed(() => store.userProfile);
</script>

<template>
  <div class="page contact">
    <section class="contact__card">
      <h1>Connect with Jacob</h1>
      <p>
        I enjoy collaborating on research-driven engineering, embedded systems, and meaningful learning
        opportunities. The fastest way to reach me is by email, and I am happy to schedule a call.
      </p>

      <div class="contact__details">
        <div>
          <span>Email</span>
          <a :href="`mailto:${profile.email}`">{{ profile.email }}</a>
        </div>
        <div>
          <span>Phone</span>
          <a :href="`tel:${profile.phone}`">{{ profile.phone }}</a>
        </div>
        <div>
          <span>Location</span>
          <p>{{ profile.location }}</p>
        </div>
      </div>

      <RouterLink class="contact__cta" to="/classes">
        Interested in private lessons? Explore my teaching approach →
      </RouterLink>
    </section>
  </div>
</template>

<style scoped>
.contact {
  display: flex;
  justify-content: center;
}

.contact__card {
  background: #ffffff;
  border-radius: 24px;
  padding: 3rem;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.1);
  max-width: 720px;
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
  text-align: left;
}

.contact__card p {
  margin: 0;
  color: #374151;
  line-height: 1.7;
}

.contact__details {
  display: grid;
  gap: 1.25rem;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.contact__details span {
  display: block;
  font-weight: 600;
  color: #0f766e;
  margin-bottom: 0.25rem;
}

.contact__details a,
.contact__details p {
  margin: 0;
  color: #1f2937;
}

.contact__cta {
  align-self: flex-start;
  font-weight: 600;
  color: #0f766e;
  text-decoration: none;
}

.contact__cta:hover,
.contact__cta:focus {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .contact__card {
    padding: 2.25rem;
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
