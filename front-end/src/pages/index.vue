<script lang="ts" setup>
import { computed } from "vue";
import { useMainStore } from "~/stores";

const store = useMainStore();
const profile = computed(() => store.userProfile);
const featuredExperience = computed(() => profile.value.experience.slice(0, 2));
const featuredProjects = computed(() => profile.value.projects.slice(0, 2));
</script>

<template>
  <div class="home">
    <section class="hero">
      <div class="hero__content">
        <p class="hero__kicker">Computer Engineer · Educator · Builder</p>
        <h1>{{ profile.name }}</h1>
        <p class="hero__summary">
          {{ profile.about }}
        </p>
        <div class="hero__cta">
          <a class="btn primary" href="/teaching">Book a Lesson</a>
          <a class="btn secondary" :href="`mailto:${profile.contact.email}`">Let's Collaborate</a>
        </div>
        <div class="hero__contact">
          <div>
            <span class="label">Email</span>
            <a :href="`mailto:${profile.contact.email}`">{{ profile.contact.email }}</a>
          </div>
          <div>
            <span class="label">Phone</span>
            <a :href="`tel:${profile.contact.phone}`">{{ profile.contact.phone }}</a>
          </div>
          <div>
            <span class="label">Location</span>
            <p>{{ profile.contact.location }}</p>
          </div>
        </div>
      </div>
      <div class="hero__badge">
        <img
          alt="Portrait of Jacob Anderson"
          src="https://jacobdanderson.s3.amazonaws.com/images/Jacob_Anderson.jpg"
        />
        <ul class="hero__tags">
          <li v-for="language in profile.languages" :key="language">{{ language }}</li>
        </ul>
      </div>
    </section>

    <section class="section">
      <header class="section__header">
        <h2>Highlighted Experience</h2>
        <RouterLink class="section__link" to="/experience">View full experience</RouterLink>
      </header>
      <div class="card-grid">
        <article v-for="item in featuredExperience" :key="item.title" class="card">
          <div class="card__heading">
            <h3>{{ item.title }}</h3>
            <p class="card__meta">{{ item.organization }} · {{ item.timeframe }}</p>
          </div>
          <p class="card__summary">{{ item.summary }}</p>
          <ul class="card__list">
            <li v-for="highlight in item.highlights" :key="highlight">
              {{ highlight }}
            </li>
          </ul>
        </article>
      </div>
    </section>

    <section class="section">
      <header class="section__header">
        <h2>Recent Projects</h2>
        <RouterLink class="section__link" to="/projects">See all projects</RouterLink>
      </header>
      <div class="card-grid">
        <article v-for="project in featuredProjects" :key="project.name" class="card">
          <div class="card__heading">
            <h3>{{ project.name }}</h3>
            <p class="card__meta">{{ project.timeframe }}</p>
          </div>
          <p class="card__summary">{{ project.description }}</p>
        </article>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  gap: 4rem;
  padding: 2rem 0 4rem;
}

.hero {
  display: grid;
  gap: 2.5rem;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  align-items: center;
  background: linear-gradient(135deg, #f5f5ff 0%, #eef5ff 40%, #ffffff 100%);
  border-radius: 24px;
  padding: 3rem;
  box-shadow: 0 25px 60px -30px rgba(15, 25, 55, 0.25);
}

.hero__content h1 {
  font-size: clamp(2.5rem, 5vw, 3.5rem);
  margin-bottom: 0.75rem;
}

.hero__kicker {
  text-transform: uppercase;
  letter-spacing: 0.3em;
  font-weight: 600;
  font-size: 0.75rem;
  color: #3e63dd;
  margin-bottom: 1rem;
}

.hero__summary {
  font-size: 1.125rem;
  line-height: 1.7;
  color: #374151;
  max-width: 46ch;
}

.hero__cta {
  display: flex;
  gap: 1rem;
  margin: 2rem 0;
  flex-wrap: wrap;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.85rem 1.75rem;
  border-radius: 999px;
  font-weight: 600;
  text-decoration: none;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.btn.primary {
  background: #3e63dd;
  color: #fff;
  box-shadow: 0 10px 25px -12px rgba(62, 99, 221, 0.8);
}

.btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 18px 30px -15px rgba(62, 99, 221, 0.75);
}

.btn.secondary {
  background: rgba(62, 99, 221, 0.1);
  color: #1f2937;
}

.btn.secondary:hover {
  transform: translateY(-2px);
  box-shadow: inset 0 0 0 1px rgba(62, 99, 221, 0.3);
}

.hero__contact {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

.hero__contact .label {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #6b7280;
  display: block;
  margin-bottom: 0.35rem;
}

.hero__contact a,
.hero__contact p {
  margin: 0;
  color: #1f2937;
}

.hero__badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.hero__badge img {
  width: 240px;
  height: 240px;
  object-fit: cover;
  border-radius: 24px;
  box-shadow: 0 20px 45px -28px rgba(15, 25, 55, 0.6);
}

.hero__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
  list-style: none;
  padding: 0;
  margin: 0;
}

.hero__tags li {
  background: rgba(62, 99, 221, 0.12);
  color: #1f2a5a;
  padding: 0.35rem 0.85rem;
  border-radius: 999px;
  font-weight: 600;
  font-size: 0.85rem;
}

.section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.section__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.section__link {
  color: #3e63dd;
  font-weight: 600;
  text-decoration: none;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.5rem;
}

.card {
  background: #fff;
  border-radius: 20px;
  padding: 1.75rem;
  box-shadow: 0 12px 30px -22px rgba(15, 25, 55, 0.35);
  border: 1px solid rgba(62, 99, 221, 0.1);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.card__heading h3 {
  margin: 0 0 0.25rem;
}

.card__meta {
  font-size: 0.9rem;
  color: #6b7280;
  margin: 0;
}

.card__summary {
  margin: 0;
  color: #374151;
}

.card__list {
  margin: 0;
  padding-left: 1rem;
  display: grid;
  gap: 0.5rem;
  color: #374151;
}

@media (max-width: 640px) {
  .hero {
    padding: 2rem;
  }

  .hero__badge img {
    width: 200px;
    height: 200px;
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
