import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import GUI from 'lil-gui';
import { watchCanvasSize } from '@/examples/shared/canvas';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { GroundedSkybox } from 'three/addons/objects/GroundedSkybox.js';
import { HDRLoader } from 'three/addons/loaders/HDRLoader.js';

export default function mountExample({ canvas, container }) {
  const assetBaseUrl = import.meta.env.BASE_URL;
  const sceneSize = {
    width: canvas.clientWidth || window.innerWidth,
    height: canvas.clientHeight || window.innerHeight,
  };

  // Scene
  const scene = new THREE.Scene();
  scene.environmentIntensity = 1  // 场景环境光强度
  scene.backgroundBlurriness = 0 // 场景背景模糊度
  scene.backgroundIntensity = 1 // 场景背景强度


  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  // renderer.shadowMap.enabled = true; // 启用阴影

  const camera = new THREE.PerspectiveCamera(
    75,
    sceneSize.width / sceneSize.height,
    0.3,
    1000,
  );
  camera.position.set(0, 0, 3)

  const hdrLoader = new HDRLoader();
  let cubeTexture = null;
  hdrLoader.load(`${assetBaseUrl}image/environment-map/2/2k.hdr`, (ground) => {
    cubeTexture = ground;
    cubeTexture.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = cubeTexture;
    scene.environment = cubeTexture;
  });

  let moduleDamagedHelmet = null;
  const gltfLoader = new GLTFLoader();
  gltfLoader.load(`${assetBaseUrl}gltf/DamagedHelmet/glTF/DamagedHelmet.gltf`, (gltf) => {
    moduleDamagedHelmet = gltf.scene;
    moduleDamagedHelmet.position.set(1, 0, 0);
    moduleDamagedHelmet.traverse((child) => {
      if (!child.isMesh || !child.material) {
        return;
      }

      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach((material) => {
        material.envMap = cubeRenderTarget.texture;
        material.envMapIntensity = 1; // 设置环境贴图强度
        material.needsUpdate = true;
      });
    });
    scene.add(gltf.scene);
  });

  // 添加一个简单的环境贴图反射示例
  const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256, {
    type: THREE.FloatType
  });
  const cubeCamera = new THREE.CubeCamera(1, 100000, cubeRenderTarget);
  cubeCamera.layers.set(1); // 设置立方体相机的层级为 1，这样它只会渲染层级为 1 的对象

  // scene.environment.mapping = THREE.EquirectangularReflectionMapping; // 设置环境贴图的映射方式

  scene.add(cubeCamera);

  // 添加一个简单的环境贴图反射示例
  let torus = new THREE.Mesh(new THREE.TorusGeometry(2.2, 0.1, 16, 100), new THREE.MeshBasicMaterial({ color: new THREE.Color(10, 10, 10) }));
  torus.layers.enable(1); // 将环形节的层级设置为 1，这样它会被立方体相机渲染
  scene.add(torus);


  // 添加环形节模型
  const torusKnot = new THREE.Mesh(new THREE.TorusKnotGeometry(0.5, 0.2, 100, 16), new THREE.MeshStandardMaterial({ metalness: 1, roughness: 0.1 }));
  torusKnot.position.set(-1, 0, 0);
  torusKnot.material.envMap = cubeRenderTarget.texture; // 将立方体渲染目标的纹理设置为环形节的环境贴图
  torusKnot.material.needsUpdate = true;
  scene.add(torusKnot);

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
    cubeCamera.update(renderer, scene);
    torus.rotation.x = Math.sin(elapsedTime) * 1.2
    // torus.rotation.y += 0.02
    renderer.render(scene, camera);
  };
  animate();
  const stopWatchingSize = watchCanvasSize(renderer, camera, canvas, sceneSize);

  return () => {
    cancelAnimationFrame(frameId);
    stopWatchingSize();
    controls.dispose();
    cubeCamera.clear(renderer, scene);
    cubeRenderTarget.dispose();
    torus?.geometry.dispose();
    torus?.material.dispose();
    torusKnot?.geometry.dispose();
    torusKnot?.material.dispose();
    renderer?.dispose();
  };
}