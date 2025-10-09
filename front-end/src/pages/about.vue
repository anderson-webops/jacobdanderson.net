<script lang="ts" setup>
import { computed } from "vue";
import { useMainStore } from "~/stores";

const store = useMainStore();
const profile = computed(() => store.userProfile);
</script>

<template>
  <div class="about-page">
    <section class="intro">
      <div class="text">
        <p class="update">Last updated {{ profile.lastUpdated }}</p>
        <h1>About Jacob</h1>
        <p class="summary">{{ profile.summary }}</p>
        <div class="details">
          <div>
            <span class="label">Location</span>
            <span>{{ profile.location }}</span>
          </div>
          <div>
            <span class="label">Email</span>
            <a :href="`mailto:${profile.email}`">{{ profile.email }}</a>
          </div>
          <div>
            <span class="label">Phone</span>
            <a :href="`tel:${profile.phone}`">{{ profile.phone }}</a>
          </div>
        </div>
      </div>
      <div class="portrait" role="presentation" />
    </section>

    <section class="mission">
      <h2>How I approach engineering</h2>
      <p>
        I care about building dependable systems that connect hardware, firmware, and intuitive interfaces.
        Whether I'm prototyping sensor networks or supporting a student through a new programming concept, I
        focus on clarity, measurable outcomes, and long-term maintainability.
      </p>
    </section>

    <section class="skills-section">
      <div>
        <h2>Technical toolkit</h2>
        <p class="list">{{ profile.skills.languages.join(", ") }}</p>
        <p class="list">{{ profile.skills.frameworks.join(", ") }}</p>
      </div>
      <div>
        <h2>Core strengths</h2>
        <ul>
          <li v-for="(competency, index) in profile.skills.competencies" :key="index">
            {{ competency }}
          </li>
        </ul>
      </div>
      <div>
        <h2>Languages</h2>
        <p class="list">{{ profile.skills.languagesSpoken.join(" · ") }}</p>
      </div>
    </section>

    <EducationComponent class="education" />

    <section class="recognition">
      <div>
        <h2>Achievements</h2>
        <ul>
          <li v-for="(achievement, index) in profile.achievements" :key="index">
            {{ achievement }}
          </li>
        </ul>
      </div>
      <div>
        <h2>Beyond the lab</h2>
        <ul>
          <li v-for="(activity, index) in profile.activities" :key="index">
            {{ activity }}
          </li>
        </ul>
      </div>
    </section>
  </div>
</template>

<style scoped>
.about-page {
  display: flex;
  flex-direction: column;
  gap: 3rem;
  padding: 2rem 0 4rem;
}

.intro {
  display: grid;
  gap: 2rem;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  align-items: center;
}

.text {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.update {
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #2563eb;
  margin: 0;
}

h1 {
  margin: 0;
  font-size: clamp(2rem, 4vw, 3rem);
  color: #0f172a;
}

.summary {
  margin: 0;
  color: #334155;
  line-height: 1.65;
}

.details {
  display: grid;
  gap: 0.75rem;
}

.details div {
  display: flex;
  gap: 0.75rem;
  align-items: baseline;
  color: #1f2937;
}

.label {
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #64748b;
  letter-spacing: 0.08em;
}

.details a {
  color: #2563eb;
  text-decoration: none;
}

.portrait {
  width: 100%;
  padding-top: 100%;
  border-radius: 24px;
  background: url("https://jacobdanderson.s3.amazonaws.com/images/Jacob_Anderson.jpg") center/cover,
    linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(14, 165, 233, 0.12));
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.2);
}

.mission {
  background: #ffffff;
  padding: 2rem;
  border-radius: 20px;
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.08);
  border: 1px solid rgba(148, 163, 184, 0.2);
}

.mission h2 {
  margin-top: 0;
  color: #0f172a;
}

.mission p {
  margin: 0;
  color: #334155;
  line-height: 1.7;
}

.skills-section {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.skills-section h2 {
  color: #0f172a;
  margin-bottom: 0.75rem;
}

.list {
  margin: 0;
  color: #1f2937;
}

.skills-section ul {
  margin: 0;
  padding-left: 1.1rem;
  color: #475569;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.education {
  margin-top: 1rem;
}

.recognition {
  display: grid;
  gap: 2rem;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}

.recognition h2 {
  color: #0f172a;
  margin-bottom: 0.75rem;
}

.recognition ul {
  margin: 0;
  padding-left: 1.1rem;
  color: #475569;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

@media (max-width: 640px) {
  .mission {
    padding: 1.5rem;
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
