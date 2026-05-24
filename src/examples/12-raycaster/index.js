import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import GUI from 'lil-gui';
import { watchCanvasSize } from '@/examples/shared/canvas';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

export default function mountExample({ canvas, container }) {
  const assetBaseUrl = import.meta.env.BASE_URL;
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
  camera.position.set(0, 3, 3)

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

  // let planeGeometry = new THREE.PlaneGeometry(10, 10);
  // let plane = new THREE.Mesh(planeGeometry, new THREE.MeshStandardMaterial());
  // plane.receiveShadow = true
  // plane.rotation.x = -Math.PI / 2;
  // scene.add(plane);

  let rayCaster = new THREE.Raycaster();
  let intersects = null;
  let moduleObjectList = []
  let mouse = new THREE.Vector2();
  const onPointerMove = (event) => {
    if (!duckModule?.scene) {
      return;
    }

    const rect = canvas.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    rayCaster.setFromCamera(mouse, camera); // 从相机位置发出一条射线，方向由鼠标位置决定
  };
  canvas.addEventListener('pointermove', onPointerMove);

  const gltfloader = new GLTFLoader();
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('');
  gltfloader.setDRACOLoader(dracoLoader);
  let duckModule = null
  gltfloader.load(`${assetBaseUrl}gltf/Duck/glTF-Binary/Duck.glb`, (gltf) => {
    duckModule = gltf
    scene.add(gltf.scene);
  });


  const controls = new OrbitControls(camera, canvas);
  let clock = new THREE.Clock();
  let startElapsedTime = 0
  let frameId = 0;
  let currentIntersect = null;
  const animate = () => {
    let elapsedTime = clock.getElapsedTime()
    let deltaTime = elapsedTime - startElapsedTime
    startElapsedTime = elapsedTime

    frameId = requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
    if (!duckModule?.scene) {
      return;
    }
    moduleObjectList = [...duckModule.scene.children]
    intersects = rayCaster.intersectObjects(moduleObjectList, true); // 检测射线与场景中所有对象的交点，返回一个数组，包含所有被射线击中的对象的信息
    if (intersects.length) {
      currentIntersect = intersects[0]
      currentIntersect.object.scale.set(1.2, 1.2, 1.2);
    } else {
      currentIntersect && currentIntersect.object.scale.set(1, 1, 1);
      currentIntersect = null
    }
  };

  animate();
  const stopWatchingSize = watchCanvasSize(renderer, camera, canvas, sceneSize);

  return () => {
    cancelAnimationFrame(frameId);
    stopWatchingSize();
    canvas.removeEventListener('pointermove', onPointerMove);
    // gui.destroy();
    // controls.dispose();
    // defaultMaterial?.dispose();
    // sphereGeometry?.dispose();
    // boxGeometry?.dispose()
    // // points?.geometry.dispose();
    // renderer.dispose();
  };
}