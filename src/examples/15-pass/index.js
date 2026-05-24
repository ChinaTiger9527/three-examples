import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import GUI from 'lil-gui';
import { watchCanvasSize } from '@/examples/shared/canvas';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { HDRLoader } from 'three/addons/loaders/HDRLoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { DotScreenPass } from 'three/addons/postprocessing/DotScreenPass.js';
import { FilmPass } from 'three/addons/postprocessing/FilmPass.js';
import { GlitchPass } from 'three/addons/postprocessing/GlitchPass.js';

export default function mountExample({ canvas, container }) {
  const sceneSize = {
    width: canvas.clientWidth || window.innerWidth,
    height: canvas.clientHeight || window.innerHeight,
  };
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
  const hdrLoader = new HDRLoader();
  let cubeTexture = null;
  hdrLoader.load('/src/static/image/environment-map/2/2k.hdr', (ground) => {
    cubeTexture = ground;
    cubeTexture.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = cubeTexture;
    scene.environment = cubeTexture;
  });

  // 加载模型
  let moduleDamagedHelmet = null;
  const gltfLoader = new GLTFLoader();
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

  // 后期处理
  const composer = new EffectComposer(renderer);

  // 添加一个简单的环境贴图反射示例
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  // 创建一个简单的点阵屏幕效果 Pass
  const dotScreenPass = new DotScreenPass(new THREE.Vector2(0, 0), 0.1, 0.9);
  dotScreenPass.enabled = false; // 默认禁用
  composer.addPass(dotScreenPass);
  let dotScreenGUI = gui.addFolder('dotScreen')
  dotScreenGUI.add(dotScreenPass, 'enabled')
  dotScreenGUI.add(dotScreenPass.uniforms['scale'], 'value').min(0).max(10).step(0.001).name('dotScreenScale');

  // 创建一个简单的电影效果 Pass
  const filmPass = new FilmPass();
  filmPass.enabled = false; // 默认禁用
  console.log('filmPass', filmPass)
  composer.addPass(filmPass);
  let filmGUI = gui.addFolder('film')
  filmGUI.add(filmPass, 'enabled')
  filmGUI.add(filmPass.uniforms['intensity'], 'value').min(0).max(1).step(0.001).name('filmNoiseIntensity');
  filmGUI.add(filmPass.uniforms['grayscale'], 'value');

  // 创建一个简单的故障效果 Pass
  const glitchPass = new GlitchPass();
  glitchPass.enabled = true; // 默认启用
  composer.addPass(glitchPass);
  console.log('glitchPass', glitchPass)
  let glitchGUI = gui.addFolder('glitch')
  glitchGUI.add(glitchPass, 'enabled')
  glitchGUI.add(glitchPass, 'goWild')

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
    // cubeCamera.update(renderer, scene);
    // torus.rotation.x = Math.sin(elapsedTime) * 1.2
    // torus.rotation.y += 0.02
    // renderer.render(scene, camera);
    composer.render();
  };
  animate();
  const stopWatchingSize = watchCanvasSize(renderer, camera, canvas, sceneSize);

  return () => {
    cancelAnimationFrame(frameId);
    stopWatchingSize();
    controls.dispose();
    gui.destroy();
    composer.dispose();
    renderPass.dispose();
    dotScreenPass.dispose();
    filmPass.dispose();
    glitchPass.dispose();
    // cubeCamera.clear(renderer, scene);
    // cubeRenderTarget.dispose();
    // torus?.geometry.dispose();
    // torus?.material.dispose();
    // torusKnot?.geometry.dispose();
    // torusKnot?.material.dispose();
    renderer?.dispose();
  };
}