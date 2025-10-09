<script lang="ts" setup>
import { computed } from "vue";
import { useMainStore } from "~/stores";

const props = defineProps<{ condensed?: boolean }>();
const store = useMainStore();
const profile = computed(() => store.userProfile);
const heroHighlights = computed(() => profile.value.heroHighlights);
const skills = computed(() => profile.value.skills);
const showFullProfile = computed(() => !props.condensed);
</script>

<template>
  <div class="page">
    <section class="hero">
      <div class="hero__content">
        <p class="hero__location">{{ profile.location }}</p>
        <h1>{{ profile.name }}</h1>
        <p class="hero__tagline">{{ profile.tagline }}</p>
        <p class="hero__summary">{{ profile.about }}</p>
        <div class="hero__highlights">
          <span
            v-for="(highlight, index) in heroHighlights"
            :key="index"
            class="hero__chip"
          >
            {{ highlight }}
          </span>
        </div>
        <div class="hero__contact">
          <a :href="`mailto:${profile.email}`">{{ profile.email }}</a>
          <span aria-hidden="true">•</span>
          <a :href="`tel:${profile.phone}`">{{ profile.phone }}</a>
        </div>
      </div>
      <div class="hero__media">
        <img
          alt="Jacob Anderson smiling"
          class="hero__portrait"
          src="https://jacobdanderson.s3.amazonaws.com/images/Jacob_Anderson.jpg"
        />
      </div>
    </section>

    <section v-if="showFullProfile" class="section">
      <h2>Core Skills</h2>
      <div class="skills-grid">
        <div class="skills-card">
          <h3>Programming Languages</h3>
          <ul>
            <li v-for="item in skills.programmingLanguages" :key="item">{{ item }}</li>
          </ul>
        </div>
        <div class="skills-card">
          <h3>Frameworks &amp; Tools</h3>
          <ul>
            <li v-for="item in skills.frameworksAndTools" :key="item">{{ item }}</li>
          </ul>
        </div>
        <div class="skills-card">
          <h3>Technical Focus</h3>
          <ul>
            <li v-for="item in skills.competencies" :key="item">{{ item }}</li>
          </ul>
        </div>
        <div class="skills-card">
          <h3>Languages</h3>
          <ul>
            <li v-for="item in skills.spokenLanguages" :key="item">{{ item }}</li>
          </ul>
        </div>
      </div>
    </section>

    <section v-if="showFullProfile" class="section">
      <EducationComponent />
    </section>

    <section v-if="showFullProfile" class="section achievements">
      <h2>Achievements</h2>
      <ul>
        <li v-for="achievement in profile.achievements" :key="achievement">
          {{ achievement }}
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.hero {
  display: grid;
  gap: 2.5rem;
  align-items: center;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  padding: 2.5rem 3rem;
  background: linear-gradient(135deg, rgba(17, 94, 89, 0.1), rgba(13, 148, 136, 0.25));
  border-radius: 24px;
  box-shadow: 0 20px 45px rgba(15, 23, 42, 0.12);
}

.hero__content {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.hero__location {
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(15, 118, 110, 0.85);
}

.hero__tagline {
  font-size: 1.3rem;
  color: #1f2937;
  font-weight: 600;
  line-height: 1.5;
}

.hero__summary {
  font-size: 1.05rem;
  line-height: 1.7;
  color: #374151;
}

.hero__highlights {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.hero__chip {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(45, 212, 191, 0.4);
  padding: 0.5rem 0.85rem;
  border-radius: 999px;
  font-size: 0.95rem;
  color: #0f766e;
  box-shadow: 0 12px 20px rgba(15, 118, 110, 0.1);
}

.hero__contact {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
  color: #0f172a;
  font-weight: 600;
}

.hero__contact a {
  color: inherit;
  text-decoration: none;
}

.hero__contact a:hover,
.hero__contact a:focus {
  text-decoration: underline;
}

.hero__media {
  display: flex;
  justify-content: center;
}

.hero__portrait {
  width: min(280px, 100%);
  aspect-ratio: 1/1;
  object-fit: cover;
  border-radius: 28px;
  border: 6px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.15);
}

.section {
  background: #ffffff;
  padding: 2.5rem;
  border-radius: 24px;
  box-shadow: 0 16px 30px rgba(15, 23, 42, 0.08);
}

.section h2 {
  margin-bottom: 1.5rem;
  color: #0f172a;
}

.skills-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.skills-card {
  border-radius: 18px;
  border: 1px solid rgba(45, 212, 191, 0.2);
  padding: 1.5rem;
  background: rgba(236, 253, 245, 0.55);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.skills-card h3 {
  margin-bottom: 1rem;
  font-size: 1.05rem;
  color: #0f766e;
}

.skills-card ul {
  margin: 0;
  padding-left: 1.25rem;
  color: #1f2937;
  display: grid;
  gap: 0.35rem;
}

.achievements ul {
  margin: 0;
  padding-left: 1.2rem;
  color: #1f2937;
  display: grid;
  gap: 0.5rem;
  font-size: 1.05rem;
}

@media (max-width: 768px) {
  .hero {
    padding: 2rem;
  }

  .hero__chip {
    font-size: 0.9rem;
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
