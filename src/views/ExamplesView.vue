<template>
  <section class="examples">
    <header class="examples__header">
      <div>
        <p class="examples__eyebrow">示例目录</p>
        <h2>THREE 进阶之路</h2>
      </div>
    </header>

    <div class="examples__list">
      <RouterLink
        v-for="example in descenExample"
        :key="example.id"
        class="example-card"
        :to="example.to"
      >
        <div class="example-card__meta">
          <span>#{{ example.id }}</span>
          <code>{{ example.file }}</code>
        </div>
        <h3>{{ example.name }}</h3>
        <p>{{ example.note }}</p>
        <span class="example-card__action">进入示例</span>
      </RouterLink>
    </div>
  </section>
</template>

<script setup>
import { RouterLink } from "vue-router";
import { examples } from "@/data/examples";
import { ref } from "vue";
let descenExample = ref([...examples].reverse());
console.log("descenExample", descenExample);
</script>

<style scoped lang="scss">
@use "@/styles/variables" as *;
@use "@/styles/mixins" as *;

.examples {
  @include panel;
}

.examples__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.examples__eyebrow {
  margin: 0 0 0.5rem;
  color: $brand;
  font-size: 0.875rem;
  font-weight: 600;
}

.examples__header h2 {
  margin: 0;
}

.examples__list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.example-card {
  @include card;
  display: block;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    background 0.2s ease;
}

.example-card:hover {
  border-color: rgba(124, 92, 255, 0.5);
  background: rgba(17, 24, 48, 0.95);
  transform: translateY(-2px);
}

.example-card__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
  color: $text-muted;
  font-size: 0.875rem;
}

.example-card code {
  color: $text-secondary;
  word-break: break-all;
}

.example-card h3 {
  margin: 0 0 0.75rem;
}

.example-card p {
  margin: 0;
  color: $text-secondary;
  line-height: 1.6;
}

.example-card__action {
  display: inline-flex;
  margin-top: 1rem;
  color: $brand;
  font-weight: 600;
}

@media (max-width: 900px) {
  .examples__list {
    grid-template-columns: 1fr;
  }

  .examples__header {
    display: grid;
  }
}
</style>
