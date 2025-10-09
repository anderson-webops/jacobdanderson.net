<script lang="ts" setup>
import { computed } from "vue";
import { useMainStore } from "~/stores";

const store = useMainStore();
const profile = computed(() => store.userProfile);
</script>

<template>
  <div class="about-page">
    <section class="bio">
      <div class="bio__text">
        <h1>Meet Jacob</h1>
        <p>
          {{ profile.about }}
        </p>
        <div class="bio__facts">
          <div>
            <span class="label">Location</span>
            <p>Alpharetta, GA · Remote friendly</p>
          </div>
          <div>
            <span class="label">Email</span>
            <a :href="`mailto:${profile.contact.email}`">{{ profile.contact.email }}</a>
          </div>
          <div>
            <span class="label">Phone</span>
            <a :href="`tel:${profile.contact.phone}`">{{ profile.contact.phone }}</a>
          </div>
        </div>
      </div>
      <div class="bio__aside">
        <img
          alt="Jacob Anderson portrait"
          class="bio__portrait"
          src="https://jacobdanderson.s3.amazonaws.com/images/Jacob_Anderson.jpg"
        />
        <div class="bio__card">
          <h2>Achievements</h2>
          <ul>
            <li v-for="achievement in profile.achievements" :key="achievement">
              {{ achievement }}
            </li>
          </ul>
        </div>
        <div class="bio__card">
          <h2>Languages</h2>
          <ul>
            <li v-for="language in profile.languages" :key="language">
              {{ language }}
            </li>
          </ul>
        </div>
      </div>
    </section>

    <section class="education">
      <h2>Education</h2>
      <div class="education__list">
        <article v-for="item in profile.education" :key="item.degree" class="education__item">
          <div class="education__heading">
            <h3>{{ item.degree }}</h3>
            <p class="meta">{{ item.institution }}</p>
            <p class="meta">{{ item.timeframe }}</p>
          </div>
          <ul>
            <li v-for="highlight in item.highlights" :key="highlight">{{ highlight }}</li>
          </ul>
        </article>
      </div>
    </section>
  </div>
</template>

<style scoped>
.about-page {
  display: flex;
  flex-direction: column;
  gap: 4rem;
  padding-bottom: 4rem;
}

.bio {
  display: grid;
  gap: 2.5rem;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  align-items: start;
}

.bio__text h1 {
  font-size: clamp(2rem, 4vw, 2.8rem);
  margin-bottom: 1.25rem;
}

.bio__text p {
  font-size: 1.1rem;
  line-height: 1.8;
  color: #374151;
  margin-bottom: 2rem;
}

.bio__facts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1.5rem;
}

.bio__facts .label {
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  display: block;
  margin-bottom: 0.4rem;
}

.bio__facts a,
.bio__facts p {
  margin: 0;
  color: #1f2937;
}

.bio__aside {
  display: grid;
  gap: 1.5rem;
}

.bio__portrait {
  width: 100%;
  max-width: 320px;
  border-radius: 24px;
  box-shadow: 0 18px 45px -28px rgba(15, 25, 55, 0.5);
  justify-self: center;
}

.bio__card {
  background: #fff;
  border-radius: 20px;
  padding: 1.5rem;
  border: 1px solid rgba(62, 99, 221, 0.12);
  box-shadow: 0 12px 30px -22px rgba(15, 25, 55, 0.25);
}

.bio__card h2 {
  margin-top: 0;
}

.bio__card ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 0.5rem;
}

.education h2 {
  margin-bottom: 1.5rem;
}

.education__list {
  display: grid;
  gap: 1.5rem;
}

.education__item {
  background: #f9fafc;
  border-radius: 18px;
  padding: 1.75rem;
  border: 1px solid rgba(62, 99, 221, 0.1);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.4);
}

.education__heading h3 {
  margin: 0 0 0.25rem;
}

.education__heading .meta {
  margin: 0;
  color: #6b7280;
}

.education__item ul {
  margin: 1rem 0 0;
  padding-left: 1.2rem;
  display: grid;
  gap: 0.5rem;
  color: #374151;
}
</style>

<route lang="json">
{
  "meta": {
    "layout": "default"
  }
}
</route>
