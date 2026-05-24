import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import GUI from 'lil-gui';
import { watchCanvasSize } from '@/examples/shared/canvas';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { HDRLoader } from 'three/examples/jsm/Addons.js';
// import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
// import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
// import { DotScreenPass } from 'three/addons/postprocessing/DotScreenPass.js';
// import { FilmPass } from 'three/addons/postprocessing/FilmPass.js';
// import { GlitchPass } from 'three/addons/postprocessing/GlitchPass.js';
import gsap from 'gsap';
import { ref } from 'vue';

export default function mountExample({ canvas, container }) {
  const sceneSize = {
    width: canvas.clientWidth || window.innerWidth,
    height: canvas.clientHeight || window.innerHeight,
  };

  // loading manager
  const loadingManager = new THREE.LoadingManager(
    () => {
      console.log('加载完成');
      gsap.to(overlayMaterial.uniforms.uAlpha, { value: 0, duration: 3, ease: 'power2.inOut' });
    },
    (itemUrl, itemsLoaded, itemsTotal) => {
      console.log(`正在加载 ${itemUrl} (${itemsLoaded} / ${itemsTotal})`);
    },
    (url) => {
      console.log(`加载 ${url} 失败`);
    }
  );

  // Scene
  const scene = new THREE.Scene();
  scene.environmentIntensity = 1  // 场景环境光强度
  scene.backgroundBlurriness = 0 // 场景背景模糊度
  scene.backgroundIntensity = 1 // 场景背景强度

  // Renderer
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(sceneSize.width, sceneSize.height);
  renderer.setPixelRatio(window.devicePixelRatio, Math.min(window.devicePixelRatio, 2));

  // Camera
  const camera = new THREE.PerspectiveCamera(
    75,
    sceneSize.width / sceneSize.height,
    0.3,
    1000,
  );
  camera.position.set(0, 0, 3)

  // 加载场景
  const hdrLoader = new HDRLoader(loadingManager);
  let cubeTexture = null;
  hdrLoader.load('/src/static/image/environment-map/2/2k.hdr', (ground) => {
    cubeTexture = ground;
    cubeTexture.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = cubeTexture;
    scene.environment = cubeTexture;
  });

  // 加载模型
  let moduleDamagedHelmet = null;
  const gltfLoader = new GLTFLoader(loadingManager);
  gltfLoader.load('/src/static/gltf/DamagedHelmet/glTF/DamagedHelmet.gltf', (gltf) => {
    moduleDamagedHelmet = gltf.scene;
    moduleDamagedHelmet.traverse((child) => {
      if (!child.isMesh || !child.material) {
        return;
      }
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach((material) => {
        // material.envMap = cubeRenderTarget.texture;
        material.envMapIntensity = 1; // 设置环境贴图强度
        material.needsUpdate = true;
      });
    });
    scene.add(gltf.scene);
  });

  // GUI
  const gui = new GUI({
    domElement: container.querySelector('.gui-container'),
  })
  gui.close()


  // 遮罩
  let overlayGeometry = new THREE.PlaneGeometry(2, 2, 1, 1);
  let overlayMaterial = new THREE.ShaderMaterial({
    transparent: true,
    uniforms: {
      uAlpha: { value: 1.0 },
    },
    vertexShader: `
      void main(){
        gl_Position = vec4(position,1.0);
      }
    `,
    fragmentShader: `
      uniform float uAlpha;
      void main(){
        gl_FragColor = vec4(0.0, 0.0, 0.0, uAlpha);
      }
    `
  });
  let overlay = new THREE.Mesh(overlayGeometry, overlayMaterial);
  scene.add(overlay);

  // Controls
  const controls = new OrbitControls(camera, renderer.domElement);

  let frameId = 0;
  let clock = new THREE.Clock();
  // let startElapsedTime = 0
  const animate = () => {
    frameId = requestAnimationFrame(animate);
    let elapsedTime = clock.getElapsedTime()
    // let deltaTime = elapsedTime - startElapsedTime
    // startElapsedTime = elapsedTime
    // console.log('deltaTime', deltaTime)
    controls.update();
    renderer.render(scene, camera);
  };
  animate();
  const stopWatchingSize = watchCanvasSize(renderer, camera, canvas, sceneSize);

  return () => {
    cancelAnimationFrame(frameId);
    stopWatchingSize();
    controls.dispose();
    gui.destroy();
    renderer?.dispose();
  };
}