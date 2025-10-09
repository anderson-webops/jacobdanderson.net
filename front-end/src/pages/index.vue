<script lang="ts" setup>
import { computed } from "vue";
import { useMainStore } from "~/stores";
import About from "~/pages/about.vue";

const store = useMainStore();
const profile = computed(() => store.userProfile);
const featuredExperiences = computed(() => profile.value.experiences.slice(0, 2));
const featuredProjects = computed(() => profile.value.projects.slice(0, 3));
const teaching = computed(() => profile.value.teaching);
</script>

<template>
  <div class="home">
    <About condensed class="home__about" />

    <section class="home__section">
      <h2>Recent Highlights</h2>
      <div class="home__grid">
        <article
          v-for="(item, index) in featuredExperiences"
          :key="index"
          class="home__card"
        >
          <h3>{{ item.role }}</h3>
          <p class="home__card-subtitle">
            {{ item.company }} • {{ item.timeframe }}
          </p>
          <ul>
            <li v-for="highlight in item.highlights" :key="highlight">{{ highlight }}</li>
          </ul>
        </article>
        <article class="home__card">
          <h3>Now Teaching</h3>
          <p class="home__card-subtitle">
            Personalized lessons for ages 7–18
          </p>
          <ul>
            <li v-for="area in teaching.focusAreas" :key="area">{{ area }}</li>
          </ul>
          <p class="home__cta">
            ${{ teaching.rate }} per lesson ·
            <RouterLink class="home__cta-link" to="/classes">See how I teach</RouterLink>
          </p>
        </article>
      </div>
    </section>

    <section class="home__section">
      <h2>Selected Projects</h2>
      <div class="home__projects">
        <article
          v-for="(project, index) in featuredProjects"
          :key="index"
          class="home__project-card"
        >
          <header>
            <h3>{{ project.name }}</h3>
            <span>{{ project.timeframe }}</span>
          </header>
          <p>{{ project.description }}</p>
          <ul v-if="project.tech?.length">
            <li v-for="tag in project.tech" :key="tag">{{ tag }}</li>
          </ul>
        </article>
      </div>
      <RouterLink class="home__link" to="/projects">View the full project gallery →</RouterLink>
    </section>
  </div>
</template>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.home__section {
  background: #ffffff;
  border-radius: 24px;
  padding: 2.5rem;
  box-shadow: 0 18px 36px rgba(15, 23, 42, 0.08);
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.home__section h2 {
  margin: 0;
  color: #0f172a;
}

.home__grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}

.home__card {
  background: rgba(236, 253, 245, 0.75);
  border-radius: 20px;
  padding: 1.75rem;
  border: 1px solid rgba(45, 212, 191, 0.25);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.home__card h3 {
  margin: 0;
  color: #0f766e;
}

.home__card-subtitle {
  margin: 0;
  color: #1f2937;
  font-weight: 600;
}

.home__card ul {
  margin: 0;
  padding-left: 1.1rem;
  color: #374151;
  display: grid;
  gap: 0.35rem;
}

.home__cta {
  margin: 0;
  color: #0f172a;
  font-weight: 600;
}

.home__cta-link {
  color: #0f766e;
}

.home__cta-link:hover,
.home__cta-link:focus {
  text-decoration: underline;
}

.home__projects {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}

.home__project-card {
  padding: 1.75rem;
  border-radius: 20px;
  border: 1px solid rgba(45, 212, 191, 0.25);
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 15px 30px rgba(15, 23, 42, 0.08);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.home__project-card header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 0.75rem;
}

.home__project-card header span {
  color: #0f766e;
  font-weight: 600;
}

.home__project-card p {
  margin: 0;
  color: #374151;
  line-height: 1.6;
}

.home__project-card ul {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.home__project-card li {
  padding: 0.35rem 0.65rem;
  border-radius: 999px;
  background: rgba(236, 253, 245, 0.9);
  color: #0f766e;
  border: 1px solid rgba(45, 212, 191, 0.3);
  font-size: 0.85rem;
}

.home__link {
  align-self: flex-end;
  color: #0f766e;
  font-weight: 600;
  text-decoration: none;
}

.home__link:hover,
.home__link:focus {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .home__section {
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
