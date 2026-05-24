import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import GUI from 'lil-gui';
import { watchCanvasSize } from '@/examples/shared/canvas';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { GroundedSkybox } from 'three/addons/objects/GroundedSkybox.js';
import { HDRLoader } from 'three/addons/loaders/HDRLoader.js';

export default function mountExample({ canvas, container }) {
  const sceneSize = {
    width: canvas.clientWidth || window.innerWidth,
    height: canvas.clientHeight || window.innerHeight,
  };
  /**
  * Base
  */
  // Debug
  const gui = new GUI()

  // Scene
  const scene = new THREE.Scene();
  scene.environmentIntensity = 0.8  // 场景环境光强度
  scene.backgroundBlurriness = 0 // 场景背景模糊度
  scene.backgroundIntensity = 1 // 场景背景强度

  // Renderer
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.shadowMap.enabled = true; // 启用阴影
  renderer.shadowMap.type = THREE.PCFSoftShadowMap; // 设置阴影类型
  renderer.setSize(sceneSize.width, sceneSize.height);
  renderer.setPixelRatio(window.devicePixelRatio, Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ReinhardToneMapping; // 设置色调映射
  renderer.toneMappingExposure = 1; // 设置色调映射曝光度
  gui
    .add(scene, 'environmentIntensity')
    .min(0)
    .max(10)
    .step(0.001)
  gui.add(renderer, 'toneMapping', {
    No: THREE.NoToneMapping,
    Linear: THREE.LinearToneMapping,
    Reinhard: THREE.ReinhardToneMapping,
    Cineon: THREE.CineonToneMapping,
    ACESFilmic: THREE.ACESFilmicToneMapping,
    // Custom: THREE.CustomToneMapping,
    // AgX: THREE.AgXToneMapping,
    // Neutral: THREE.NeutralToneMapping,
  }).name('toneMapping');
  gui.add(renderer, 'toneMappingExposure').min(0).max(10).step(0.001).name('toneMappingExposure');
  scene.environmentIntensity = 1

  // Camera
  const camera = new THREE.PerspectiveCamera(
    75,
    sceneSize.width / sceneSize.height,
    0.3,
    1000,
  );
  camera.position.set(4, 6, 5)
  scene.add(camera);

  // HDRLoader 加载环境贴图
  const hdrLoader = new HDRLoader();
  let cubeTexture = null;
  hdrLoader.load('/src/static/image/environment-map/0/2k.hdr', (ground) => {
    cubeTexture = ground;
    cubeTexture.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = cubeTexture;
    scene.environment = cubeTexture;
  });

  // GLTFLoader 加载模型
  const gltfLoader = new GLTFLoader()
  gltfLoader.load('/src/static/gltf/FlightHelmet/glTF/FlightHelmet.gltf', (gltf) => {
    gltf.scene.scale.set(10, 10, 10)
    scene.add(gltf.scene);
    gltf.scene.traverse((child) => {
      console.log('child', child)
      if (child.isMesh) {
        child.castShadow = true; // 允许该网格投射阴影
        child.receiveShadow = true; // 允许该网格接收阴影
      }
    });
  })

  // 墙体
  let textureLoader = new THREE.TextureLoader();
  let wallTure = {
    map: textureLoader.load('/src/static/image/textures/castle_brick_broken_06/castle_brick_broken_06_diff_1k.jpg'),
    normalMap: textureLoader.load('/src/static/image/textures/castle_brick_broken_06/castle_brick_broken_06_nor_gl_1k.png'),
    aoMap: textureLoader.load('/src/static/image/textures/castle_brick_broken_06/castle_brick_broken_06_arm_1k.jpg'),
  }
  wallTure.roughnessMap = wallTure.aoMap
  wallTure.metalnessMap = wallTure.aoMap
  wallTure.map.colorSpace = THREE.SRGBColorSpace // 设置颜色空间为sRGB
  let wallMash = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), new THREE.MeshStandardMaterial({
    ...wallTure,
    // side: THREE.DoubleSide,
  }))
  wallMash.position.z = -5
  wallMash.position.y = 5
  wallMash.receiveShadow = true; // 允许该网格接收阴影
  scene.add(wallMash)


  // 地板
  let floorTure = {
    map: textureLoader.load('/src/static/image/textures/wood_cabinet_worn_long/wood_cabinet_worn_long_diff_1k.jpg'),
    normalMap: textureLoader.load('/src/static/image/textures/wood_cabinet_worn_long/wood_cabinet_worn_long_nor_gl_1k.jpg'),
    aoMap: textureLoader.load('/src/static/image/textures/wood_cabinet_worn_long/wood_cabinet_worn_long_arm_1k.jpg'),
  }
  floorTure.roughnessMap = floorTure.aoMap
  floorTure.metalnessMap = floorTure.aoMap
  floorTure.map.colorSpace = THREE.SRGBColorSpace // 设置颜色空间为sRGB
  let floorMash = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), new THREE.MeshStandardMaterial(floorTure))
  floorMash.rotation.x = - Math.PI * 0.5
  // wallMash.position.z = -4
  floorMash.receiveShadow = true; // 允许该网格接收阴影
  scene.add(floorMash)




  // Directional Light 平行光
  let directionalLight = new THREE.DirectionalLight(0xffffff, 10);
  directionalLight.position.set(- 4, 12, 10)
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.set(512, 512); // 设置阴影贴图的分辨率
  directionalLight.shadow.camera.near = 0.1; // 设置阴影相机的近裁剪面
  directionalLight.shadow.camera.far = 30; // 设置阴影相机的远裁剪面
  directionalLight.shadow.camera.left = -15; // 设置阴影相机的左边界
  directionalLight.shadow.camera.right = 15; // 设置阴影相机的右边界
  directionalLight.shadow.camera.top = 15; // 设置阴影相机的上边界
  directionalLight.shadow.camera.bottom = -15; // 设置阴影相机的下边界
  scene.add(directionalLight);
  gui.add(directionalLight, 'intensity').min(0).max(10).step(0.001).name('lightIntensity')
  gui.add(directionalLight.position, 'x').min(- 10).max(10).step(0.001).name('lightX')
  gui.add(directionalLight.position, 'y').min(- 10).max(10).step(0.001).name('lightY')
  gui.add(directionalLight.position, 'z').min(- 10).max(10).step(0.001).name('lightZ')
  gui.add(directionalLight, 'castShadow')
  gui.add(directionalLight.shadow, 'normalBias').min(- 0.05).max(0.05).step(0.001) // 设置阴影偏移，防止阴影出现锯齿
  gui.add(directionalLight.shadow, 'bias').min(- 0.05).max(0.05).step(0.001) // 设置阴影偏移，防止阴影出现锯齿


  // Target
  directionalLight.target.position.set(0, 4, -4)
  scene.add(directionalLight.target)
  directionalLight.target.updateWorldMatrix(true, false)

  let shadowCameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
  scene.add(shadowCameraHelper);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.y = 3.5
  // controls.enableDamping = true // 启用阻尼（惯性），这将使控制更平滑，但可能会降低性能

  let frameId = 0;
  let clock = new THREE.Clock();
  const animate = () => {
    frameId = requestAnimationFrame(animate);
    let elapsedTime = clock.getElapsedTime()
    shadowCameraHelper.update();
    controls.update();
    renderer.render(scene, camera);
  };
  animate();
  const stopWatchingSize = watchCanvasSize(renderer, camera, canvas, sceneSize);

  return () => {
    cancelAnimationFrame(frameId);
    stopWatchingSize();
    controls.dispose();
    renderer?.dispose();
    gui.destroy();
  };
}