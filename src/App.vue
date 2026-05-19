<template>
  <div class="app-shell">
    <header class="app-shell__header">
      <div>
        <p class="app-shell__eyebrow">{{ appStore.tagline }}</p>
        <h1>{{ appStore.appName }}</h1>
      </div>

      <nav
        class="app-shell__nav"
        aria-label="Primary navigation"
      >
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="app-shell__link"
        >
          {{ item.label }}
        </RouterLink>
      </nav>
    </header>

    <main class="app-shell__main">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { RouterLink, RouterView } from 'vue-router';
import { useAppStore } from '@/stores/app';

const appStore = useAppStore();

const navItems = [
  { label: '首页', to: '/' },
  { label: '示例目录', to: '/examples' },
  { label: '滚动实验页', to: '/scroll-lab' },
];
</script>

<style scoped lang="scss">
@use '@/styles/variables' as *;

.app-shell {
  min-height: 100vh;
  background:
    radial-gradient(circle at top, rgba(124, 92, 255, 0.14), transparent 28%),
    linear-gradient(180deg, #0b1020 0%, #11172a 100%);
  color: $text-primary;
}

.app-shell__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  width: min(1120px, calc(100% - 3rem));
  margin: 0 auto;
  padding: 2.5rem 0 1.25rem;
}

.app-shell__eyebrow {
  margin: 0 0 0.5rem;
  color: $text-muted;
  font-size: 0.875rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.app-shell__header h1 {
  margin: 0;
  font-size: clamp(1.8rem, 3vw, 2.5rem);
}

.app-shell__nav {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.app-shell__link {
  padding: 0.7rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 999px;
  color: $text-secondary;
  background: rgba(255, 255, 255, 0.03);
  transition:
    border-color 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease;

  &:hover,
  &.router-link-active {
    color: $text-primary;
    border-color: rgba(124, 92, 255, 0.6);
    transform: translateY(-1px);
  }
}

.app-shell__main {
  width: min(1120px, calc(100% - 3rem));
  margin: 0 auto;
  padding-bottom: 4rem;
}

@media (max-width: 720px) {
  .app-shell__header {
    align-items: flex-start;
    flex-direction: column;
    width: min(1120px, calc(100% - 2rem));
    padding-top: 2rem;
  }

  .app-shell__main {
    width: min(1120px, calc(100% - 2rem));
  }
}
</style>
