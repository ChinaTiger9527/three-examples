<template>
  <div class="immersive-layout">
    <main class="immersive-layout__main">
      <slot />
    </main>
  </div>
</template>

<style scoped lang="scss">
@use "@/styles/variables" as *;

.immersive-layout {
  min-height: 100vh;
}

.immersive-layout__main {
  min-height: 100vh;
  padding: 0;
}
</style>
