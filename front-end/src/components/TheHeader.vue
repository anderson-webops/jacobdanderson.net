<script lang="ts" setup>
import { ref, computed, watch } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const isExpanded = ref(false);

const links = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
  { name: "Experience", path: "/experience" },
  { name: "Projects", path: "/projects" },
  { name: "Classes", path: "/classes" },
  { name: "Contact", path: "/contact" }
];

const activePath = computed(() => route.path);

function toggleMenu() {
  isExpanded.value = !isExpanded.value;
}

function closeMenu() {
  isExpanded.value = false;
}

watch(
  () => route.path,
  () => {
    isExpanded.value = false;
  }
);
</script>

<template>
  <header class="site-header">
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
      <button
        class="hamburger"
        :class="{ open: isExpanded }"
        @click="toggleMenu"
        type="button"
        aria-label="Toggle navigation"
      >
        <span class="bar" />
        <span class="bar" />
        <span class="bar" />
      </button>
      <ul :class="{ expanded: isExpanded }" class="nav-links">
        <li v-for="link in links" :key="link.path" :class="{ active: activePath === link.path }">
          <RouterLink :to="link.path" class="nav-link" @click="closeMenu">
            {{ link.name }}
          </RouterLink>
        </li>
      </ul>
    </nav>
  </header>
</template>

<style scoped>
.site-header {
  backdrop-filter: blur(12px);
  position: sticky;
  top: 0;
  z-index: 20;
}

.flex-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  background-color: rgba(255, 255, 255, 0.92);
  border-bottom: 1px solid rgba(148, 163, 184, 0.2);
}

.logo-container {
  display: flex;
  align-items: center;
}

.logo-link {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
}

.logo {
  width: 48px;
  height: auto;
}

.site-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 24px;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-link {
  position: relative;
  text-decoration: none;
  color: #1f2937;
  font-weight: 500;
  padding-bottom: 4px;
  transition: color 0.2s ease;
}

.nav-link::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.2s ease;
}

.nav-link:hover,
.nav-link:focus {
  color: #2563eb;
}

.active .nav-link,
.nav-link:hover,
.nav-link:focus {
  color: #2563eb;
}

.active .nav-link::after {
  transform: scaleX(1);
}

.hamburger {
  display: none;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  cursor: pointer;
}

.bar {
  width: 24px;
  height: 3px;
  background-color: #1f2937;
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.hamburger.open .bar:nth-child(1) {
  transform: translateY(7px) rotate(45deg);
}

.hamburger.open .bar:nth-child(2) {
  opacity: 0;
}

.hamburger.open .bar:nth-child(3) {
  transform: translateY(-7px) rotate(-45deg);
}

@media (max-width: 820px) {
  .hamburger {
    display: flex;
  }

  .nav-links {
    position: absolute;
    top: 68px;
    right: 16px;
    flex-direction: column;
    align-items: flex-start;
    background: rgba(255, 255, 255, 0.97);
    border: 1px solid rgba(148, 163, 184, 0.2);
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 12px 24px rgba(15, 23, 42, 0.08);
    display: none;
    gap: 16px;
    min-width: 200px;
  }

  .nav-links.expanded {
    display: flex;
  }
}
</style>
