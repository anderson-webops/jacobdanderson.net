<script lang="ts" setup>
import About from "~/pages/about.vue";
import Experience from "~/pages/experience.vue";
import Projects from "~/pages/projects.vue";
</script>

<template>
  <section class="page home-page">
    <About class="about" />
    <div class="section-grid">
      <Projects class="projects" />
      <Experience class="experience" />
    </div>
    <div class="item classes-highlight">
      <h2>Personalized Lessons for Kids & Teens</h2>
      <p>
        I teach one-on-one programming, STEM, and Spanish lessons designed to build confidence and spark curiosity. Each session
        is $40 and tailored to your student's goals.
      </p>
      <RouterLink class="cta" to="/classes">See what's included</RouterLink>
    </div>
  </section>
</template>

<style scoped>
.home-page {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.section-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 20px;
}

.about,
.projects,
.experience {
  width: 100%;
}

.classes-highlight {
  align-items: flex-start;
  text-align: left;
  gap: 16px;
}

.classes-highlight p {
  margin: 0;
  color: #475569;
  line-height: 1.6;
}

.cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 24px;
  border-radius: 12px;
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  color: #fff;
  font-weight: 600;
  text-decoration: none;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.cta:hover,
.cta:focus {
  transform: translateY(-1px);
  box-shadow: 0 12px 22px rgba(124, 58, 237, 0.25);
}

@media (max-width: 720px) {
  .section-grid {
    grid-template-columns: 1fr;
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
