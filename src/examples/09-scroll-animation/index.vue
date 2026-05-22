<template>
  <section class="scroll-lab">
    <!-- <header class="scroll-lab__header">
      <div>
        <p class="scroll-lab__eyebrow">Scroll Lab</p>
        <h2>为滚动叙事实验准备的 Vue 页面骨架</h2>
        <p>
          这里先用 Vue 单文件组件承载滚动分屏结构。后续把 Three.js 场景、GSAP
          动画和滚动联动逻辑逐块迁入时，可以直接在这个页面里组织生命周期和状态。
        </p>
      </div>
      <div class="runner__actions">
        <RouterLink
          to="/examples"
          class="runner__action runner__action--ghost"
        >
          返回示例目录
        </RouterLink>
      </div>
    </header> -->
    <canvas
      ref="canvasRef"
      class="runner__canvas"
    ></canvas>
    <div class="content">
      <div class="box box_1">MY PROJECT</div>
      <div class="box box_1">THERE</div>
      <div class="box box_1">CHINA TIGER</div>
    </div>
  </section>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";
import * as THREE from "three";
import gsap from "gsap";

const particleTextureUrl = new URL(
  "../../static/image/star_06.png",
  import.meta.url,
).href;

const canvasRef = ref(null);
const sceneSize = {
  width: window.innerWidth,
  height: window.innerHeight,
};

let cleanupThree = null;

onMounted(() => {
  cleanupThree = initThree();
});

onBeforeUnmount(() => {
  if (typeof cleanupThree === "function") {
    cleanupThree();
    cleanupThree = null;
  }
});

function initThree() {
  const canvas = canvasRef.value;

  if (!canvas) {
    return null;
  }
  // 场景
  const scene = new THREE.Scene();

  // 相机
  const camera = new THREE.PerspectiveCamera(
    75,
    sceneSize.width / sceneSize.height,
    0.5,
    1000,
  );
  camera.position.z = 5;
  camera.rotation.set(0, 0, 0);

  // 渲染器
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
  });
  renderer.setSize(sceneSize.width, sceneSize.height);
  renderer.setPixelRatio(window.devicePixelRatio);

  const material = new THREE.MeshStandardMaterial();
  // 创建一个圆环结
  const torusKnot = new THREE.Mesh(
    new THREE.TorusKnotGeometry(1, 0.4, 100, 16),
    material,
  );
  torusKnot.position.x = 2;

  // 创建一个立方体
  const cube = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), material);
  cube.position.x = -2;
  cube.position.y = -8;

  // 创建一个圆环
  let torus = new THREE.Mesh(new THREE.TorusGeometry(1, 0.4, 16, 48), material);
  torus.position.x = 2;
  torus.position.y = -16;

  let meshList = [torusKnot, cube, torus];

  // 创建粒子
  let particleTexture = new THREE.TextureLoader().load(particleTextureUrl);
  const particlesCount = 500;
  const particlesGeometry = new THREE.BufferGeometry();
  const particlesMaterial = new THREE.PointsMaterial({
    size: 0.2,
    map: particleTexture,
    alphaMap: particleTexture,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const positions = new Float32Array(particlesCount * 3);
  for (let i = 0; i < particlesCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 30;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
  }
  particlesGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3),
  );
  const particles = new THREE.Points(particlesGeometry, particlesMaterial);
  particles.position.y = -8;
  scene.add(particles);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
  directionalLight.position.set(5, 5, 5);
  scene
    .add(cube)
    .add(torusKnot)
    .add(torus)
    .add(ambientLight)
    .add(directionalLight);

  // // 添加坐标轴辅助器
  // const axesHelper = new THREE.AxesHelper(5);
  // scene.add(axesHelper);

  let clock = new THREE.Clock();
  let frameId = 0;
  let startElapsed = Date.now();
  function animate() {
    frameId = requestAnimationFrame(animate);
    let elapsed = clock.getElapsedTime();
    let stepElapsed = elapsed - startElapsed; // 获取每次触发动画时的时间差
    startElapsed = elapsed;
    cube.rotation.x += 0.4 * stepElapsed;
    cube.rotation.y += 0.2 * stepElapsed;
    torusKnot.rotation.x += 0.4 * stepElapsed;
    torusKnot.rotation.y += 0.2 * stepElapsed;
    torus.rotation.x += 0.4 * stepElapsed;
    torus.rotation.y += 0.2 * stepElapsed;
    renderer.render(scene, camera);
  }
  animate();

  function mousemoveEventHandler(event) {
    const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    gsap.to(camera.rotation, {
      y: mouseX * 0.1,
      x: mouseY * 0.1,
      duration: 0.5,
      ease: "power1.out",
    });
  }
  window.addEventListener("mousemove", mousemoveEventHandler);

  let currentMeshIndex = 0;
  function scrollEventHandler() {
    const scrollY = window.scrollY || window.pageYOffset;
    const maxScroll =
      document.documentElement.scrollHeight - window.innerHeight; // 最大可滚动距离
    const scrollProgress = scrollY / maxScroll; // 滚动的百分比
    camera.position.y = -scrollProgress * 16; // 从 y=0 移动到 y=16

    let i = Math.min(
      Math.floor(scrollProgress * meshList.length),
      meshList.length - 1,
    );
    if (i !== currentMeshIndex && meshList[i]) {
      currentMeshIndex = i;
      gsap.to(meshList[i].rotation, {
        y: meshList[i].rotation.y + Math.PI * 1.5,
        x: meshList[i].rotation.x + Math.PI * 1.5,
        duration: 1.5,
        ease: "power1.out",
      });
    }
  }
  window.addEventListener("scroll", scrollEventHandler);

  function resizeEventHandler() {
    sceneSize.width = window.innerWidth;
    sceneSize.height = window.innerHeight;
    camera.aspect = sceneSize.width / sceneSize.height;
    camera.updateProjectionMatrix();
    renderer.setSize(sceneSize.width, sceneSize.height);
  }
  window.addEventListener("resize", resizeEventHandler);

  return () => {
    cancelAnimationFrame(frameId);
    window.removeEventListener("mousemove", mousemoveEventHandler);
    window.removeEventListener("scroll", scrollEventHandler);
    window.removeEventListener("resize", resizeEventHandler);
    gsap.killTweensOf(cube.rotation);
    gsap.killTweensOf(torusKnot.rotation);
    gsap.killTweensOf(torus.rotation);
    cube.geometry.dispose();
    torusKnot.geometry.dispose();
    torus.geometry.dispose();
    // axesHelper.geometry.dispose();
    // if (Array.isArray(axesHelper.material)) {
    //   axesHelper.material.forEach((helperMaterial) => helperMaterial.dispose());
    // } else {
    //   axesHelper.material.dispose();
    // }
    material.dispose();
    renderer.dispose();
  };
}
</script>

<style scoped lang="scss">
@use "@/styles/variables" as *;
@use "@/styles/mixins" as *;
// .scroll-lab {
//   width: 100%;
//   padding-top: 2.5rem;
// }
// .scroll-lab__header {
//   @include panel;
//   max-width: clamp(1180px, 1180px, 90vw);
//   margin: 0 auto;
// }
// .runner__actions {
//   display: flex;
//   gap: 0.75rem;
// }
// .scroll-lab__eyebrow {
//   margin: 0 0 0.5rem;
//   color: $brand;
//   font-weight: 600;
//   letter-spacing: 0.08em;
//   text-transform: uppercase;
// }

// .scroll-lab__header h2 {
//   margin: 0 0 1rem;
// }

// .scroll-lab__header p {
//   margin: 0;
//   color: $text-secondary;
//   line-height: 1.7;
// }
.scroll-lab {
  min-height: 100vh;
}

.content {
  position: relative;
}

.runner__canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100dvh;
}
.box {
  width: 100%;
  height: 100vh;
  color: #fff;
  font-weight: bold;
  font-size: 5rem;
  display: flex;
  align-items: center;
  padding: 0 2rem;
}
.box:nth-child(2) {
  justify-content: flex-end;
}
</style>
