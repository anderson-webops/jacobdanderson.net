<script lang="ts" setup>
import { computed } from "vue";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { useMainStore } from "~/stores";

const store = useMainStore();
const contact = computed(() => store.userProfile.contact);
</script>

<template>
  <footer class="footer">
    <div class="footer__content">
      <div>
        <h2>Stay in touch</h2>
        <p>
          Ready to collaborate or interested in lessons? Email me at
          <a :href="`mailto:${contact.email}`">{{ contact.email }}</a>.
        </p>
      </div>
      <nav class="footer__links">
        <a href="https://www.github.com/Jacoba1100254352" target="_blank" rel="noopener">
          <FontAwesomeIcon :icon="['fab', 'github']" size="lg" />
          <span class="sr-only">GitHub</span>
        </a>
        <a href="https://www.facebook.com/jacoba1100254352" target="_blank" rel="noopener">
          <FontAwesomeIcon :icon="['fab', 'facebook']" size="lg" />
          <span class="sr-only">Facebook</span>
        </a>
        <a href="https://www.instagram.com/jacoba1100254352" target="_blank" rel="noopener">
          <FontAwesomeIcon :icon="['fab', 'instagram']" size="lg" />
          <span class="sr-only">Instagram</span>
        </a>
      </nav>
    </div>
    <p class="footer__note">© {{ new Date().getFullYear() }} Jacob Anderson. All rights reserved.</p>
  </footer>
</template>

<style scoped>
.footer {
  margin: 4rem auto 2rem;
  padding: 2.5rem 2rem;
  background: #fff;
  border-radius: 24px;
  border: 1px solid rgba(62, 99, 221, 0.12);
  box-shadow: 0 18px 36px -30px rgba(15, 25, 55, 0.35);
  max-width: 1100px;
}

.footer__content {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 1.5rem;
  align-items: center;
}

.footer__content h2 {
  margin-bottom: 0.5rem;
}

.footer__content p {
  margin: 0;
  color: #4b5563;
  max-width: 50ch;
}

.footer__links {
  display: flex;
  gap: 1rem;
}

.footer__links a {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(62, 99, 221, 0.1);
  color: #3e63dd;
  text-decoration: none;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.footer__links a:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 25px -18px rgba(62, 99, 221, 0.5);
}

.footer__note {
  margin: 2rem 0 0;
  text-align: center;
  color: #9ca3af;
  font-size: 0.9rem;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}

@media (max-width: 640px) {
  .footer {
    padding: 2rem 1.5rem;
  }
}
</style>
