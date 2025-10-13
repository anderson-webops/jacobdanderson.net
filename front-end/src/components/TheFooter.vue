<script lang="ts" setup>
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { computed } from "vue";
import { useMainStore } from "~/stores";


const store = useMainStore();
const profile = computed(() => store.userProfile);
</script>

<template>
  <footer class="footer">
    <div class="content">
      <div class="contact">
        <span class="label">Email</span>
        <a :href="`mailto:${profile.email}`">{{ profile.email }}</a>
      </div>
      <div class="contact">
        <span class="label">Phone</span>
        <a :href="`tel:${profile.phone}`">{{ profile.phone }}</a>
      </div>
      <div class="social">
        <a
          href="https://github.com/Jacoba1100254352"
          rel="noopener"
          target="_blank"
        >
          <FontAwesomeIcon :icon="['fab', 'github']" size="lg" />
          <span>GitHub</span>
        </a>
        <a
          href="https://classes.jacobdanderson.net"
          rel="noopener"
          target="_blank"
        >
          <FontAwesomeIcon
            :icon="['fas', 'chalkboard-teacher']"
            size="lg"
          />
          <span>Book a lesson</span>
        </a>
      </div>
    </div>
    <p class="copyright">
      © {{ new Date().getFullYear() }} Jacob Anderson. All rights
      reserved.
    </p>
  </footer>
</template>

<style scoped>
.footer {
  margin: 3rem 0 2rem;
  padding: 2rem 1.5rem;
  background: rgba(15, 23, 42, 0.9);
  color: #f8fafc;
  border-radius: 24px;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.2);
}

.content {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  justify-content: space-between;
  align-items: center;
}

.contact {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.label {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #93c5fd;
}

a {
  color: #e0f2fe;
  text-decoration: none;
  font-weight: 600;
}

a:hover {
  color: #bfdbfe;
}

.social {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.social a {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
}

.social span {
  font-size: 0.95rem;
}

.copyright {
  margin: 1.5rem 0 0;
  text-align: center;
  font-size: 0.85rem;
  color: #cbd5f5;
}

@media (max-width: 640px) {
  .content {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .social {
    width: 100%;
  }
}
</style>
