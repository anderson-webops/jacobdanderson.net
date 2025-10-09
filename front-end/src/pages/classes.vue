<script lang="ts" setup>
import { computed } from "vue";
import { useMainStore } from "~/stores";

const store = useMainStore();
const teaching = computed(() => store.userProfile.teaching);
const profile = computed(() => store.userProfile);
</script>

<template>
  <div class="page classes">
    <section class="classes__hero">
      <h1>1:1 Lessons with Jacob</h1>
      <p>
        I help students build confidence in programming, STEM foundations, and Spanish through engaging,
        project-based lessons tailored to their goals.
      </p>
      <a :href="teaching.link" class="classes__cta" target="_blank" rel="noopener">
        Book a lesson at classes.jacobdanderson.net
      </a>
    </section>

    <section class="classes__grid">
      <article class="classes__card">
        <h2>What I Teach</h2>
        <ul>
          <li v-for="area in teaching.focusAreas" :key="area">{{ area }}</li>
        </ul>
      </article>
      <article class="classes__card">
        <h2>How It Works</h2>
        <ul>
          <li>Live, one-on-one sessions for students ages 7–18.</li>
          <li>Customized weekly or bi-weekly meeting cadence.</li>
          <li>Hands-on projects that make complex ideas approachable.</li>
        </ul>
      </article>
      <article class="classes__card">
        <h2>Rates &amp; Availability</h2>
        <p class="classes__rate">${{ teaching.rate }} per 50-minute lesson</p>
        <ul>
          <li>Weeknight and Saturday sessions available.</li>
          <li>Flexible scheduling for academic calendars.</li>
          <li>Progress updates sent to parents after every lesson.</li>
        </ul>
      </article>
    </section>

    <section class="classes__testimonial">
      <h2>Why families enjoy working with me</h2>
      <p>
        As an Instructor Success Trainer at Juni Learning, I coach instructors on delivering memorable,
        student-centered lessons. I bring that same energy to each session, blending technical depth with
        patience and bilingual communication when needed.
      </p>
      <div class="classes__contact">
        <span>Email me at</span>
        <a :href="`mailto:${profile.email}`">{{ profile.email }}</a>
        <span>or call</span>
        <a :href="`tel:${profile.phone}`">{{ profile.phone }}</a>
      </div>
    </section>
  </div>
</template>

<style scoped>
.classes {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.classes__hero {
  background: linear-gradient(135deg, rgba(13, 148, 136, 0.15), rgba(20, 184, 166, 0.3));
  border-radius: 28px;
  padding: 3rem;
  box-shadow: 0 20px 44px rgba(15, 23, 42, 0.12);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  text-align: left;
}

.classes__hero h1 {
  margin: 0;
}

.classes__hero p {
  margin: 0;
  font-size: 1.05rem;
  color: #0f172a;
  line-height: 1.7;
}

.classes__cta {
  align-self: flex-start;
  background: #0f766e;
  color: #ffffff;
  padding: 0.85rem 1.5rem;
  border-radius: 999px;
  font-weight: 600;
  text-decoration: none;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.classes__cta:hover,
.classes__cta:focus {
  transform: translateY(-2px);
  box-shadow: 0 12px 22px rgba(15, 118, 110, 0.2);
}

.classes__grid {
  display: grid;
  gap: 1.75rem;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}

.classes__card {
  background: #ffffff;
  border-radius: 24px;
  padding: 2.25rem;
  box-shadow: 0 18px 36px rgba(15, 23, 42, 0.08);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.classes__card ul {
  margin: 0;
  padding-left: 1.2rem;
  color: #374151;
  display: grid;
  gap: 0.45rem;
}

.classes__rate {
  margin: 0;
  font-weight: 700;
  color: #0f766e;
}

.classes__testimonial {
  background: #ffffff;
  border-radius: 24px;
  padding: 2.5rem;
  box-shadow: 0 18px 36px rgba(15, 23, 42, 0.08);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.classes__testimonial p {
  margin: 0;
  color: #374151;
  line-height: 1.7;
}

.classes__contact {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 0.75rem;
  align-items: center;
  color: #0f172a;
  font-weight: 600;
}

.classes__contact a {
  color: #0f766e;
}

@media (max-width: 768px) {
  .classes__hero {
    padding: 2.25rem;
  }

  .classes__card {
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
