<script lang="ts" setup>
import { computed } from "vue";
import { useMainStore } from "~/stores";

const store = useMainStore();
const profile = computed(() => store.userProfile);

const skillGroups = computed(() => [
  { title: "Programming Languages", items: profile.value.skills.programming },
  { title: "Frameworks & Tools", items: profile.value.skills.tools },
  { title: "Hardware & Systems", items: profile.value.skills.hardware },
  { title: "Languages", items: profile.value.skills.languages }
]);
</script>

<template>
  <section class="page about-page">
    <div class="item hero-card">
      <img
        alt="Portrait of Jacob Anderson"
        class="hero-photo"
        src="https://jacobdanderson.s3.amazonaws.com/images/Jacob_Anderson.jpg"
      />
      <div class="hero-content">
        <h1>{{ profile.name }}</h1>
        <p class="tagline">{{ profile.tagline }}</p>
        <ul class="hero-meta">
          <li>
            <span class="label">Location</span>
            <span>{{ profile.location }}</span>
          </li>
          <li>
            <span class="label">Email</span>
            <a :href="`mailto:${profile.email}`">{{ profile.email }}</a>
          </li>
          <li>
            <span class="label">Phone</span>
            <a :href="`tel:${profile.phone}`">{{ profile.phone }}</a>
          </li>
          <li>
            <span class="label">Last Updated</span>
            <span>{{ profile.lastUpdated }}</span>
          </li>
        </ul>
      </div>
    </div>

    <div class="item about-card">
      <h2>About</h2>
      <p>{{ profile.about }}</p>
    </div>

    <div class="item skills-card">
      <h2>Skills Snapshot</h2>
      <div class="skills-grid">
        <div v-for="group in skillGroups" :key="group.title" class="skills-group">
          <h3>{{ group.title }}</h3>
          <ul>
            <li v-for="skill in group.items" :key="skill">{{ skill }}</li>
          </ul>
        </div>
      </div>
    </div>

    <div v-if="profile.achievements?.length" class="item achievements-card">
      <h2>Achievements</h2>
      <ul>
        <li v-for="achievement in profile.achievements" :key="achievement">{{ achievement }}</li>
      </ul>
    </div>

    <EducationComponent v-if="$route.path !== '/'" />
  </section>
</template>

<style scoped>
.about-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.hero-card {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 24px;
}

.hero-photo {
  width: 160px;
  height: 160px;
  border-radius: 24px;
  object-fit: cover;
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.12);
}

.hero-content {
  text-align: left;
  width: 100%;
}

.hero-content h1 {
  margin-bottom: 8px;
}

.tagline {
  font-size: 1.1rem;
  font-weight: 500;
  color: #334155;
  margin-bottom: 16px;
}

.hero-meta {
  display: grid;
  gap: 8px;
  list-style: none;
  margin: 0;
  padding: 0;
}

.hero-meta li {
  display: flex;
  flex-direction: column;
  font-size: 0.95rem;
}

.hero-meta a {
  color: #2563eb;
  text-decoration: none;
}

.hero-meta a:hover,
.hero-meta a:focus {
  text-decoration: underline;
}

.label {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #64748b;
}

.about-card p {
  margin: 0;
  font-size: 1rem;
  line-height: 1.7;
  color: #1e293b;
}

.skills-card {
  padding: 24px;
}

.skills-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  width: 100%;
}

.skills-group h3 {
  margin: 0 0 12px;
  font-size: 1rem;
  color: #1e293b;
}

.skills-group ul {
  margin: 0;
  padding-left: 20px;
  color: #475569;
}

.achievements-card ul {
  margin: 0;
  padding-left: 20px;
  color: #475569;
}

@media (max-width: 720px) {
  .hero-card {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .hero-photo {
    margin: 0 auto;
  }

  .hero-content {
    text-align: center;
  }

  .hero-meta li {
    align-items: center;
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
