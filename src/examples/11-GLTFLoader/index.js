import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import GUI from 'lil-gui';
import { watchCanvasSize } from '@/examples/shared/canvas';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

export default function mountExample({ canvas, container }) {
  const sceneSize = {
    width: canvas.clientWidth || window.innerWidth,
    height: canvas.clientHeight || window.innerHeight,
  };
  const scene = new THREE.Scene();
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.shadowMap.enabled = true; // 启用阴影
  const camera = new THREE.PerspectiveCamera(
    75,
    sceneSize.width / sceneSize.height,
    0.3,
    1000,
  );
  camera.position.set(4, 6, 6)

  // 环境光
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);
  // 平行光
  const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
  directionalLight.position.set(0, 6, 6);
  directionalLight.castShadow = true;
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 12;
  directionalLight.shadow.camera.left = -6;
  directionalLight.shadow.camera.right = 6;
  directionalLight.shadow.camera.top = 6;
  directionalLight.shadow.camera.bottom = -4;
  directionalLight.shadow.radius = 4;
  directionalLight.shadow.mapSize.width = 1024;
  directionalLight.shadow.mapSize.height = 1024;
  scene.add(directionalLight);

  let planeGeometry = new THREE.PlaneGeometry(10, 10);
  let plane = new THREE.Mesh(planeGeometry, new THREE.MeshStandardMaterial());
  plane.receiveShadow = true
  plane.rotation.x = -Math.PI / 2;
  scene.add(plane);

  const gltfloader = new GLTFLoader();
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('');
  gltfloader.setDRACOLoader(dracoLoader);
  let mixAdmixer = null
  gltfloader.load('/src/static/gltf/Fox/glTF/Fox.gltf', (gltf) => {
    console.log('gltf', gltf)
    gltf.scene.scale.set(0.04, 0.04, 0.04);
    mixAdmixer = new THREE.AnimationMixer(gltf.scene); // 创建动画混合器
    let action = mixAdmixer.clipAction(gltf.animations[1]); // 选择一个动画
    action.play(); // 播放动画
    scene.add(gltf.scene);
  });


  const controls = new OrbitControls(camera, canvas);
  let clock = new THREE.Clock();
  let startElapsedTime = 0
  let frameId = 0;
  const animate = () => {
    let elapsedTime = clock.getElapsedTime()
    let deltaTime = elapsedTime - startElapsedTime
    startElapsedTime = elapsedTime

    frameId = requestAnimationFrame(animate);
    controls.update();
    if (mixAdmixer) {
      mixAdmixer.update(deltaTime); // 更新动画混合器，deltaTime 是两帧之间的时间差
    }
    renderer.render(scene, camera);
  };

  animate();
  const stopWatchingSize = watchCanvasSize(renderer, camera, canvas, sceneSize);

  return () => {
    cancelAnimationFrame(frameId);
    stopWatchingSize();
    mixAdmixer?.stopAllAction();
    // gui.destroy();
    // controls.dispose();
    // defaultMaterial?.dispose();
    // sphereGeometry?.dispose();
    // boxGeometry?.dispose()
    // // points?.geometry.dispose();
    // renderer.dispose();
  };
}