<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const isExpanded = ref(false);

const links = [
  { name: "Home", path: "/" },
  { name: "Experience", path: "/experience" },
  { name: "Projects", path: "/projects" },
  { name: "Teaching", path: "/teaching" },
  { name: "About", path: "/about" },
  { name: "Contact", path: "/contact" }
];

const activePath = computed(() => route.path);

function toggleMenu() {
  isExpanded.value = !isExpanded.value;
}

watch(
  () => route.fullPath,
  () => {
    isExpanded.value = false;
  }
);
</script>

<template>
  <header class="site-header">
    <nav class="nav">
      <div class="nav__brand">
        <RouterLink class="brand" to="/">
          <img
            alt="Jacob Anderson Logo"
            class="brand__mark"
            src="https://jacobdanderson.s3.amazonaws.com/images/Logo+1+Saywa.png"
          />
          <span class="brand__name">Jacob Anderson</span>
        </RouterLink>
      </div>
      <button class="nav__toggle" type="button" @click="toggleMenu">
        <span class="sr-only">Toggle navigation</span>
        <span :class="{ open: isExpanded }" class="bar" />
        <span :class="{ open: isExpanded }" class="bar" />
        <span :class="{ open: isExpanded }" class="bar" />
      </button>
      <ul :class="{ expanded: isExpanded }" class="nav__links">
        <li v-for="link in links" :key="link.path">
          <RouterLink
            :class="{ active: activePath === link.path }"
            :to="link.path"
            class="nav__link"
          >
            {{ link.name }}
          </RouterLink>
        </li>
      </ul>
    </nav>
  </header>
</template>

<style scoped>
.site-header {
  position: sticky;
  top: 0;
  z-index: 10;
  backdrop-filter: blur(12px);
  background: rgba(255, 255, 255, 0.85);
  border-bottom: 1px solid rgba(62, 99, 221, 0.1);
}

.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  max-width: 1100px;
  margin: 0 auto;
}

.nav__brand .brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
}

.brand__mark {
  width: 48px;
  height: 48px;
}

.brand__name {
  font-weight: 700;
  font-size: 1.25rem;
  color: #1f2937;
}

.nav__links {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav__link {
  position: relative;
  text-decoration: none;
  font-weight: 600;
  color: #1f2937;
  padding: 0.5rem 0;
}

.nav__link::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 2px;
  background: transparent;
  transition: background 0.2s ease;
}

.nav__link:hover::after,
.nav__link.active::after {
  background: #3e63dd;
}

.nav__toggle {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: transparent;
  border: none;
  cursor: pointer;
}

.nav__toggle .bar {
  width: 26px;
  height: 3px;
  background: #1f2937;
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.nav__toggle .bar.open:nth-child(1) {
  transform: translateY(8px) rotate(45deg);
}

.nav__toggle .bar.open:nth-child(2) {
  opacity: 0;
}

.nav__toggle .bar.open:nth-child(3) {
  transform: translateY(-8px) rotate(-45deg);
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

@media (max-width: 768px) {
  .nav {
    flex-wrap: wrap;
  }

  .nav__toggle {
    display: flex;
  }

  .nav__links {
    width: 100%;
    flex-direction: column;
    align-items: flex-start;
    display: none;
    padding: 1rem 0 0;
  }

  .nav__links.expanded {
    display: flex;
  }

  .nav__link {
    width: 100%;
  }
}
</style>
