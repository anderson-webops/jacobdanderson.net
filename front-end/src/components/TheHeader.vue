<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";

const isExpanded = ref(false);
const route = useRoute();

const links = [
  { name: "Home", path: "/" },
  { name: "Projects", path: "/projects" },
  { name: "Experience", path: "/experience" },
  { name: "About", path: "/about" },
  { name: "Classes", path: "/classes" },
  { name: "Contact", path: "/contact" }
];

const activeLink = ref(links[0].name);

const activePath = computed(() => route.path);

watch(
  activePath,
  (currentPath) => {
    const match = links.find((link) => currentPath.startsWith(link.path) && link.path !== "/") ||
      links.find((link) => link.path === currentPath) ||
      links[0];
    activeLink.value = match.name;
  },
  { immediate: true }
);

function toggleMenu() {
  isExpanded.value = !isExpanded.value;
}

function setActiveLink(linkName: string) {
  activeLink.value = linkName;
  isExpanded.value = false;
}
</script>

<template>
  <header class="header">
    <nav class="flex-container">
      <div class="logo-container">
        <RouterLink to="/" class="logo-link">
          <img
            alt="Jacob Anderson Logo"
            class="logo"
            src="https://jacobdanderson.s3.amazonaws.com/images/Logo+1+Saywa.png"
          />
          <span class="site-name">Jacob Anderson</span>
        </RouterLink>
      </div>
      <div class="hamburger" @click="toggleMenu">
        <div :class="{ open: isExpanded }" class="bar" />
        <div :class="{ open: isExpanded }" class="bar" />
        <div :class="{ open: isExpanded }" class="bar" />
      </div>
      <ul :class="{ expanded: isExpanded }" class="nav-links">
        <li
          v-for="link in links"
          :key="link.path"
          :class="{ active: activeLink === link.name }"
          @click="setActiveLink(link.name)"
        >
          <RouterLink :to="link.path" class="nav-link">
            {{ link.name }}
          </RouterLink>
        </li>
      </ul>
    </nav>
  </header>
</template>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 50;
  backdrop-filter: blur(16px);
}

.flex-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem clamp(1rem, 4vw, 2rem);
  background: rgba(255, 255, 255, 0.85);
  border-radius: 22px;
  box-shadow: 0 14px 30px rgba(15, 23, 42, 0.08);
  margin-bottom: 2rem;
}

.logo-container {
  display: flex;
  align-items: center;
}

.logo-link {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
}

.logo {
  width: 52px;
  height: auto;
}

.site-name {
  font-size: 1.4rem;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: 0.02em;
}

.nav-links {
  display: flex;
  gap: 1.5rem;
  list-style: none;
  margin: 0;
  padding: 0;
  align-items: center;
}

.nav-links li {
  position: relative;
}

.nav-link {
  text-decoration: none;
  color: #1f2937;
  font-weight: 600;
  padding-bottom: 0.35rem;
  display: inline-flex;
  transition: color 0.2s ease;
}

.nav-links li.active .nav-link,
.nav-link:hover,
.nav-link:focus {
  color: #0f766e;
}

.nav-links li.active::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: -0.4rem;
  width: 100%;
  height: 3px;
  border-radius: 999px;
  background: linear-gradient(90deg, #0f766e, #14b8a6);
}

.hamburger {
  display: none;
  flex-direction: column;
  cursor: pointer;
  gap: 0.35rem;
}

.bar {
  width: 28px;
  height: 3px;
  background-color: #0f172a;
  border-radius: 999px;
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.bar.open:nth-child(1) {
  transform: translateY(6px) rotate(-45deg);
}

.bar.open:nth-child(2) {
  opacity: 0;
}

.bar.open:nth-child(3) {
  transform: translateY(-6px) rotate(45deg);
}

@media (max-width: 900px) {
  .flex-container {
    flex-wrap: wrap;
    gap: 1rem;
  }

  .hamburger {
    display: flex;
  }

  .nav-links {
    width: 100%;
    flex-direction: column;
    align-items: flex-start;
    display: none;
    padding-top: 0.75rem;
  }

  .nav-links.expanded {
    display: flex;
  }

  .nav-links li {
    width: 100%;
  }

  .nav-links li.active::after {
    display: none;
  }
}
</style>
