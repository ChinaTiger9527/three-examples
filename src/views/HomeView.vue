<template>
  <section class="hero">
    <div class="hero__content">
      <p class="hero__eyebrow">three学习项目</p>
      <h2>用 Vue 全家桶承载 Three.js 学习内容</h2>
      <p class="hero__description">
        这个项目的初衷是为自己搭建一个轻量、易扩展的 Three.js 学习平台，记录学习过程中的笔记和示例代码。
      </p>
    </div>

    <div class="hero__stats">
      <article class="stat-card">
        <span>技术栈</span>
        <strong>{{ appStore.tagline }}</strong>
      </article>
      <article class="stat-card">
        <span>示例数量</span>
        <strong>{{ appStore.exampleCount }}</strong>
      </article>
    </div>
  </section>

  <section class="grid">
    <article
      v-for="item in highlights"
      :key="item.title"
      class="info-card"
    >
      <h3>{{ item.title }}</h3>
      <p>{{ item.description }}</p>
    </article>
  </section>
</template>

<script setup>
import { useAppStore } from '@/stores/app';

const appStore = useAppStore();

const highlights = [
  {
    title: '路由分层',
    description: '用 Vue Router 管理首页、示例目录和滚动实验页，后续扩展新案例时不需要再改入口文件。',
  },
  {
    title: '状态集中',
    description: '用 Pinia 管理应用级元数据，为后续主题切换、示例筛选和用户偏好预留空间。',
  },
  {
    title: '样式体系',
    description: '用 Sass 维护变量、mixin 和全局基础样式，组件继续使用 scoped scss 保持边界清晰。',
  },
];
</script>

<style scoped lang="scss">
@use '@/styles/variables' as *;
@use '@/styles/mixins' as *;

.hero {
  @include panel;
  display: grid;
  grid-template-columns: 1.8fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.hero__eyebrow {
  margin: 0 0 0.75rem;
  color: $brand;
  font-size: 0.9rem;
  font-weight: 600;
}

.hero h2 {
  margin: 0;
  font-size: clamp(2rem, 4vw, 3.5rem);
  line-height: 1.05;
}

.hero__description {
  max-width: 62ch;
  margin: 1rem 0 0;
  color: $text-secondary;
  line-height: 1.7;
}

.hero__stats {
  display: grid;
  gap: 1rem;
}

.stat-card,
.info-card {
  @include card;
}

.stat-card span,
.info-card p {
  color: $text-muted;
}

.stat-card strong {
  display: block;
  margin-top: 0.75rem;
  font-size: 1.1rem;
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.info-card h3 {
  margin: 0 0 0.75rem;
}

.info-card p {
  margin: 0;
  line-height: 1.7;
}

@media (max-width: 900px) {
  .hero,
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
