import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { examples } from '@/data/examples';

export const useAppStore = defineStore('app', () => {
  const appName = ref('ChinaTiger Three.js Study Hub');
  const tagline = ref('Vue 3 + Vue Router + Pinia + Sass');

  const exampleCount = computed(() => examples.length);

  return {
    appName,
    tagline,
    exampleCount,
  };
});
