<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";


const isExpanded = ref(false);
const route = useRoute();

const links = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
  { name: "Experience", path: "/experience" },
  { name: "Projects", path: "/projects" },
  { name: "Teaching", path: "/classes" },
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
    <nav class="nav">
      <RouterLink class="brand" to="/" @click="closeMenu">
        <img
          alt="Jacob Anderson logo"
          class="logo"
          src="https://jacobdanderson.s3.amazonaws.com/images/Logo+1+Saywa.png"
        />
        <span>Jacob Anderson</span>
      </RouterLink>
      <button
        aria-label="Toggle navigation"
        class="hamburger"
        type="button"
        @click="toggleMenu"
      >
        <span :class="{ open: isExpanded }" />
        <span :class="{ open: isExpanded }" />
        <span :class="{ open: isExpanded }" />
      </button>
      <ul :class="{ expanded: isExpanded }" class="links">
        <li v-for="link in links" :key="link.path">
          <RouterLink
            :class="{
							active:
								activePath.startsWith(link.path) &&
								link.path !== '/'
									? true
									: activePath === link.path
						}"
            :to="link.path"
            @click="closeMenu"
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
  z-index: 20;
  backdrop-filter: blur(12px);
  background: rgba(248, 250, 252, 0.85);
  border-bottom: 1px solid rgba(148, 163, 184, 0.2);
}

.nav {
  max-width: 1080px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.5rem;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 700;
  font-size: 1.1rem;
  color: #0f172a;
  text-decoration: none;
}

.logo {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  box-shadow: 0 10px 20px rgba(59, 130, 246, 0.2);
}

.links {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.links li a {
  position: relative;
  font-weight: 600;
  color: #334155;
  text-decoration: none;
  padding-bottom: 0.25rem;
  transition: color 0.2s ease;
}

.links li a::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 2px;
  background: #2563eb;
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.2s ease;
}

.links li a:hover {
  color: #1d4ed8;
}

.links li a:hover::after,
.links li a.active::after {
  transform: scaleX(1);
}

.links li a.active {
  color: #1d4ed8;
}

.hamburger {
  display: none;
  flex-direction: column;
  gap: 0.35rem;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.35rem;
}

.hamburger span {
  width: 26px;
  height: 3px;
  background: #0f172a;
  border-radius: 999px;
  transition: transform 0.3s ease,
  opacity 0.3s ease;
}

.hamburger span.open:nth-child(1) {
  transform: translateY(6px) rotate(45deg);
}

.hamburger span.open:nth-child(2) {
  opacity: 0;
}

.hamburger span.open:nth-child(3) {
  transform: translateY(-6px) rotate(-45deg);
}

@media (max-width: 768px) {
  .hamburger {
    display: flex;
  }
  
  .links {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    flex-direction: column;
    background: rgba(255, 255, 255, 0.96);
    border-bottom: 1px solid rgba(148, 163, 184, 0.2);
    padding: 1.25rem 1.5rem 1.75rem;
    gap: 1rem;
    display: none;
  }
  
  .links.expanded {
    display: flex;
  }
  
  .links li a {
    width: 100%;
  }
}
</style>
