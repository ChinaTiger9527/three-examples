<template>
  <section
    v-if="example"
    class="runner"
  >
    <header class="runner__header">
      <div>
        <p class="runner__eyebrow">Example {{ example.id }}</p>
        <h2>{{ example.name }}</h2>
        <p class="runner__description">{{ example.note }}</p>
      </div>

      <div class="runner__actions">
        <RouterLink
          to="/examples"
          class="runner__action runner__action--ghost"
        >
          返回示例目录
        </RouterLink>
      </div>
    </header>

    <div
      ref="stageRef"
      class="runner__stage"
      :style="stageStyle"
    >
      <div
        class="runner__viewport"
        :style="viewportStyle"
      >
        <canvas
          ref="canvasRef"
          class="runner__canvas"
        />
      </div>

      <div
        v-if="loading"
        class="runner__status"
      >
        正在加载示例...
      </div>

      <div
        v-else-if="error"
        class="runner__status runner__status--error"
      >
        {{ error }}
      </div>
    </div>
  </section>

  <section
    v-else
    class="runner runner--missing"
  >
    <h2>未找到对应示例</h2>
    <RouterLink
      to="/examples"
      class="runner__action"
    >
      返回示例目录
    </RouterLink>
  </section>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRoute, RouterLink } from "vue-router";
import { exampleLoaders, getExampleBySlug } from "@/data/examples";

const route = useRoute();
const canvasRef = ref(null);
const stageRef = ref(null);
const loading = ref(false);
const error = ref("");
const viewportWidth = ref(typeof window !== "undefined" ? window.innerWidth : 1200);

const PC_BASE_WIDTH = 1200;
const PC_BASE_HEIGHT = 720;

const viewportScale = computed(() => {
  const currentWidth = Math.max(320, viewportWidth.value || 1200);
  return Math.min(1, currentWidth / PC_BASE_WIDTH);
});

const viewportStyle = computed(() => ({
  width: `${PC_BASE_WIDTH}px`,
  height: `${PC_BASE_HEIGHT}px`,
  transform: `scale(${viewportScale.value})`,
}));

const stageStyle = computed(() => ({
  height: `${Math.round(PC_BASE_HEIGHT * viewportScale.value)}px`,
}));

const example = computed(() =>
  getExampleBySlug(String(route.params.slug ?? "")),
);

let cleanup = null;
let activeLoadId = 0;

function updateViewportWidth() {
  viewportWidth.value = window.innerWidth;
}

function resetCurrentExample() {
  if (typeof cleanup === "function") {
    cleanup();
    cleanup = null;
  }
}

async function loadExample(slug) {
  const loadId = ++activeLoadId;
  resetCurrentExample();
  error.value = "";

  if (!slug || !exampleLoaders[slug]) {
    return;
  }

  loading.value = true;
  await nextTick();

  try {
    const module = await exampleLoaders[slug]();
    if (loadId !== activeLoadId) {
      return;
    }

    const mountExample = module.default ?? module.mountExample;

    if (typeof mountExample !== "function") {
      throw new Error("示例入口缺失，无法加载。");
    }

    const dispose = mountExample({
      canvas: canvasRef.value,
      container: stageRef.value,
    });

    if (loadId !== activeLoadId) {
      if (typeof dispose === "function") {
        dispose();
      }
      return;
    }

    cleanup = typeof dispose === "function" ? dispose : null;
  } catch (loadError) {
    if (loadId !== activeLoadId) {
      return;
    }

    error.value =
      loadError instanceof Error ? loadError.message : "示例加载失败。";
  } finally {
    if (loadId === activeLoadId) {
      loading.value = false;
    }
  }
}

watch(
  () => route.params.slug,
  (slug) => {
    loadExample(String(slug ?? ""));
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  activeLoadId += 1;
  resetCurrentExample();
  window.removeEventListener("resize", updateViewportWidth);
  window.visualViewport?.removeEventListener("resize", updateViewportWidth);
});

onMounted(() => {
  updateViewportWidth();
  window.addEventListener("resize", updateViewportWidth);
  window.visualViewport?.addEventListener("resize", updateViewportWidth);
});
</script>

<style scoped lang="scss">
@use "@/styles/variables" as *;
@use "@/styles/mixins" as *;

.runner {
  display: grid;
  gap: 1rem;
}

.runner__header {
  @include panel;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.runner__eyebrow {
  margin: 0 0 0.5rem;
  color: $brand;
  font-size: 0.875rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.runner__header h2 {
  margin: 0;
}

.runner__description {
  margin: 0.75rem 0 0;
  color: $text-secondary;
  line-height: 1.7;
}

.runner__actions {
  display: flex;
  gap: 0.75rem;
}

.runner__action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 0.8rem 1rem;
  border-radius: 0.9rem;
  background: $brand;
  color: #fff;
  font-weight: 600;
}

.runner__action--ghost {
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.04);
  color: $text-primary;
}

.runner__stage {
  position: relative;
  width: 100%;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 1.5rem;
  background: #040814;
  box-shadow: 0 18px 60px rgba(0, 0, 0, 0.28);
}

.runner__viewport {
  position: absolute;
  top: 0;
  left: 0;
  transform-origin: top left;
}

.runner__canvas {
  display: block;
  width: 100%;
  height: 100%;
}

.runner__status {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  color: $text-secondary;
  background: rgba(4, 8, 20, 0.78);
  backdrop-filter: blur(8px);
}

.runner__status--error {
  color: #ffb8b8;
}

.runner--missing {
  @include panel;
  justify-items: start;
}

.runner--missing h2 {
  margin: 0 0 1rem;
}

@media (max-width: 900px) {
  .runner__header {
    display: grid;
  }
}
</style>
<style lang="scss">
div > &:has(.runner__canvas) {
  position: relative;
}
canvas + .lil-gui.lil-root {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 10000;
}
</style>
