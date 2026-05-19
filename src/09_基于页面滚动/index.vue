<template>
  <section class="scroll-lab">
    <header class="scroll-lab__header">
      <p class="scroll-lab__eyebrow">Scroll Lab</p>
      <h2>为滚动叙事实验准备的 Vue 页面骨架</h2>
      <p>
        这里先用 Vue 单文件组件承载滚动分屏结构。后续把 Three.js 场景、GSAP
        动画和滚动联动逻辑逐块迁入时，可以直接在这个页面里组织生命周期和状态。
      </p>
    </header>

    <div class="scroll-lab__sections">
      <article
        v-for="section in sections"
        :key="section.title"
        class="story-card"
      >
        <span>{{ section.step }}</span>
        <h3>{{ section.title }}</h3>
        <p>{{ section.description }}</p>
      </article>
    </div>
  </section>
</template>

<script setup>
const sections = [
  {
    step: '01',
    title: '建立滚动章节',
    description: '将内容拆分为多个叙事区块，后续每个区块都可以对应一段镜头或一组材质变化。',
  },
  {
    step: '02',
    title: '绑定动画节奏',
    description: '使用 GSAP 或原生滚动观察逻辑，将滚动进度映射到场景参数、相机位置和 UI 状态。',
  },
  {
    step: '03',
    title: '接入 Three.js 画布',
    description: '把 canvas 容器挂到组件内部，而不是直接写进 HTML，避免入口和全局 DOM 紧耦合。',
  },
];
</script>

<style scoped lang="scss">
@use '@/styles/variables' as *;
@use '@/styles/mixins' as *;

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
