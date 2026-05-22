<template>
  <RouterView v-slot="{ Component }">
    <component :is="layoutComponent">
      <component
        :is="Component"
        :key="route.fullPath"
      />
    </component>
  </RouterView>
</template>

<script setup>
import { computed } from 'vue';
import { RouterView, useRoute } from 'vue-router';
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import ImmersiveLayout from '@/layouts/ImmersiveLayout.vue';

const route = useRoute();

const layoutMap = {
  default: DefaultLayout,
  immersive: ImmersiveLayout,
};

const layoutComponent = computed(() => {
  const layoutName = route.meta.layout ?? 'default';
  return layoutMap[layoutName] ?? DefaultLayout;
});
</script>
