<script lang="ts" setup>
import { computed } from "vue";
import { useMainStore } from "~/stores";

const store = useMainStore();
const profile = computed(() => store.userProfile);
</script>

<template>
  <footer class="site-footer">
    <div class="footer-content">
      <div>
        <h2>Stay in Touch</h2>
        <p>I'm always happy to chat about new projects, research collaborations, and mentoring opportunities.</p>
      </div>
      <div class="footer-contact">
        <a :href="`mailto:${profile.email}`">{{ profile.email }}</a>
        <a :href="`tel:${profile.phone}`">{{ profile.phone }}</a>
        <span>{{ profile.location }}</span>
      </div>
    </div>
    <p class="update">Last updated {{ profile.lastUpdated }}</p>
  </footer>
</template>

<style scoped>
.site-footer {
  margin: 40px auto;
  max-width: 1100px;
  padding: 24px 32px;
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.1), rgba(14, 165, 233, 0.1));
  border-radius: 20px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
}

.footer-content h2 {
  margin: 0 0 8px;
  text-align: left;
}

.footer-content p {
  margin: 0;
  color: #475569;
  max-width: 520px;
  line-height: 1.6;
}

.footer-contact {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-weight: 600;
}

.footer-contact a {
  color: #2563eb;
  text-decoration: none;
}

.footer-contact a:hover,
.footer-contact a:focus {
  text-decoration: underline;
}

.update {
  margin: 0;
  font-size: 0.9rem;
  color: #64748b;
}
</style>
