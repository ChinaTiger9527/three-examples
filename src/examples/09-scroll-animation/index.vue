<template>
  <div>示例9</div>
</template>

<script setup></script>

<style scoped lang="scss">
@use "@/styles/variables" as *;
@use "@/styles/mixins" as *;

.scroll-lab {
  display: grid;
  gap: 1.5rem;
}

.scroll-lab__header {
  @include panel;
}

.scroll-lab__eyebrow {
  margin: 0 0 0.5rem;
  color: $brand;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.scroll-lab__header h2 {
  margin: 0 0 1rem;
}

.scroll-lab__header p {
  margin: 0;
  color: $text-secondary;
  line-height: 1.7;
}

.scroll-lab__sections {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.story-card {
  @include card;
}

.story-card span {
  color: $brand;
  font-size: 0.875rem;
  font-weight: 700;
}

.story-card h3 {
  margin: 0.75rem 0;
}

.story-card p {
  margin: 0;
  color: $text-secondary;
  line-height: 1.65;
}

@media (max-width: 900px) {
  .scroll-lab__sections {
    grid-template-columns: 1fr;
  }
}
</style>
