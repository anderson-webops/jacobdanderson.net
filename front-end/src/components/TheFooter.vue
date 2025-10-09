<script lang="ts" setup>
import { computed } from "vue";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { useMainStore } from "~/stores";

const store = useMainStore();
const profile = computed(() => store.userProfile);
</script>

<template>
  <footer class="footer">
    <div class="footer__contact">
      <h2>Let’s build something meaningful</h2>
      <p>
        Reach out to collaborate on embedded systems, research initiatives, or to schedule a learning
        session.
      </p>
      <div class="footer__links">
        <a :href="`mailto:${profile.email}`">{{ profile.email }}</a>
        <span aria-hidden="true">•</span>
        <a :href="`tel:${profile.phone}`">{{ profile.phone }}</a>
      </div>
    </div>
    <nav class="footer__social">
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
    <RouterLink class="footer__cta" to="/classes">
      Explore my teaching approach →
    </RouterLink>
  </footer>
</template>

<style scoped>
.footer {
  margin-top: 3rem;
  padding: 3rem;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 26px;
  box-shadow: 0 14px 30px rgba(15, 23, 42, 0.08);
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
  text-align: center;
}

.footer__contact h2 {
  margin: 0 0 0.75rem;
}

.footer__contact p {
  margin: 0;
  color: #374151;
}

.footer__links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1rem;
  justify-content: center;
  align-items: center;
  font-weight: 600;
  color: #0f172a;
}

.footer__links a {
  color: #0f766e;
  text-decoration: none;
}

.footer__links a:hover,
.footer__links a:focus {
  text-decoration: underline;
}

.footer__social {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.footer__social a {
  color: #0f172a;
  background: rgba(236, 253, 245, 0.85);
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
}

.footer__social a:hover,
.footer__social a:focus {
  transform: translateY(-2px);
  color: #0f766e;
}

.footer__cta {
  align-self: center;
  font-weight: 600;
  color: #0f766e;
  text-decoration: none;
}

.footer__cta:hover,
.footer__cta:focus {
  text-decoration: underline;
}

.sr-only {
  position: absolute;
  clip: rect(0, 0, 0, 0);
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  border: 0;
}

@media (max-width: 768px) {
  .footer {
    padding: 2.25rem;
  }
}
</style>
