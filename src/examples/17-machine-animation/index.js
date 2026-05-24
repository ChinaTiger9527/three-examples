import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { HDRLoader } from 'three/addons/loaders/HDRLoader.js';
import { Reflector } from 'three/addons/objects/Reflector.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import { watchCanvasSize } from '@/examples/shared/canvas';

const michelleUrl = '/src/static/gltf/three/Michelle.glb';
const soldierUrl = '/src/static/gltf/three/Soldier.glb';
const environmentMapUrl = '/src/static/image/environment-map/0/2k.hdr';

// 示例入口：初始化场景、加载资源并返回销毁函数。
export default function mountExample({ canvas }) {
  const sceneSize = {
    width: canvas.clientWidth || window.innerWidth,
    height: canvas.clientHeight || window.innerHeight,
  };

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0d1724);

  const techBackground = createTechBackground();
  scene.add(techBackground.group);

  const camera = new THREE.PerspectiveCamera(
    40,
    sceneSize.width / sceneSize.height,
    0.25,
    50,
  );
  camera.position.set(0, 1.2, 4.2);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(sceneSize.width, sceneSize.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1;

  scene.backgroundBlurriness = 0.05;
  scene.backgroundIntensity = 0.9;
  scene.environmentIntensity = 1;

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.minDistance = 2;
  controls.maxDistance = 12;
  controls.target.set(0, 1, 0);
  controls.update();

  const hemisphereLight = new THREE.HemisphereLight(0xe9c0a5, 0x123456, 1.8);
  scene.add(hemisphereLight);

  const directionalLight = new THREE.DirectionalLight(0xfff9ea, 1.6);
  directionalLight.position.set(2, 5, 2);
  scene.add(directionalLight);

  const floorReflector = new Reflector(new THREE.PlaneGeometry(50, 50), {
    clipBias: 0.003,
    textureWidth: 1024,
    textureHeight: 1024,
    color: 0x2f2f2f,
  });
  floorReflector.rotation.x = -Math.PI / 2;
  floorReflector.position.y = 0;
  scene.add(floorReflector);

  const floorTint = new THREE.Mesh(
    new THREE.PlaneGeometry(50, 50),
    new THREE.MeshStandardMaterial({
      color: 0x5e5e5e,
      transparent: true,
      opacity: 0.16,
      roughness: 0.95,
      metalness: 0.02,
      depthWrite: false,
    }),
  );
  floorTint.rotation.x = -Math.PI / 2;
  floorTint.position.y = 0.002;
  scene.add(floorTint);

  const helpers = new THREE.Group();
  helpers.visible = false;
  scene.add(helpers);

  const timer = new THREE.Timer();
  const loader = new GLTFLoader();
  const hdrLoader = new HDRLoader();

  let frameId = 0;
  let disposed = false;
  let sourceMixer = null;
  let targetMixer = null;
  let environmentTexture = null;

  const stopWatchingSize = watchCanvasSize(renderer, camera, canvas, sceneSize);

  // 主渲染循环：更新背景、动画混合器和控制器。
  const animate = () => {
    frameId = requestAnimationFrame(animate);

    timer.update();
    const delta = timer.getDelta();
    scene.backgroundRotation.y += delta * 0.03;
    scene.environmentRotation.y += delta * 0.02;
    techBackground.update(delta);
    sourceMixer?.update(delta);
    targetMixer?.update(delta);
    controls.update();
    renderer.render(scene, camera);
  };

  // 异步加载 HDR 环境贴图。
  const loadEnvironment = () =>
    new Promise((resolve, reject) => {
      hdrLoader.load(environmentMapUrl, resolve, undefined, reject);
    });

  // 异步加载 glTF/glb 模型。
  const loadGltf = (url) =>
    new Promise((resolve, reject) => {
      loader.load(url, resolve, undefined, reject);
    });

  Promise.all([loadEnvironment(), loadGltf(michelleUrl), loadGltf(soldierUrl)])
    .then(([hdrTexture, sourceModel, targetModel]) => {
      if (disposed) {
        return;
      }

      environmentTexture = hdrTexture;
      environmentTexture.mapping = THREE.EquirectangularReflectionMapping;
      scene.environment = environmentTexture;
      // scene.background = environmentTexture;
      scene.backgroundBlurriness = 0.12;
      scene.backgroundIntensity = 0.8;

      scene.add(sourceModel.scene);
      scene.add(targetModel.scene);

      sourceModel.scene.position.x = -0.8;
      targetModel.scene.position.x = 0.7;
      targetModel.scene.position.z = -0.1;
      targetModel.scene.scale.setScalar(0.01);

      sourceModel.scene.rotation.y = Math.PI / 2;
      targetModel.scene.rotation.y = -Math.PI / 2;

      const source = getSource(sourceModel, helpers);
      sourceMixer = source.mixer;
      targetMixer = retargetModel(source, targetModel, helpers);

      animate();
    })
    .catch((error) => {
      console.error('Failed to load offline machine-animation resources:', error);
      animate();
    });

  return () => {
    disposed = true;
    cancelAnimationFrame(frameId);
    stopWatchingSize();
    controls.dispose();
    sourceMixer?.stopAllAction();
    targetMixer?.stopAllAction();
    environmentTexture?.dispose();
    techBackground.dispose();
    floorReflector.geometry.dispose();
    floorReflector.material.dispose();
    floorTint.geometry.dispose();
    floorTint.material.dispose();
    renderer.dispose();
  };
}

// 构建无着色器科技背景：粒子、环和极坐标网格。
function createTechBackground() {
  const group = new THREE.Group();

  const starGeometry = new THREE.BufferGeometry();
  const starCount = 2000;
  const starPositions = new Float32Array(starCount * 3);

  for (let i = 0; i < starCount; i += 1) {
    const i3 = i * 3;
    const radius = THREE.MathUtils.randFloat(14, 26);
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(THREE.MathUtils.randFloatSpread(2));

    starPositions[i3] = radius * Math.sin(phi) * Math.cos(theta);
    starPositions[i3 + 1] = radius * Math.cos(phi);
    starPositions[i3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
  }

  starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));

  const stars = new THREE.Points(
    starGeometry,
    new THREE.PointsMaterial({
      color: 0x8ddfff,
      size: 0.05,
      transparent: true,
      opacity: 0.65,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    }),
  );
  group.add(stars);

  const ringA = new THREE.Mesh(
    new THREE.TorusGeometry(11, 0.045, 16, 240),
    new THREE.MeshBasicMaterial({
      color: 0x2ca7ff,
      transparent: true,
      opacity: 0.28,
      depthWrite: false,
    }),
  );
  ringA.rotation.x = Math.PI * 0.5;
  group.add(ringA);

  const ringB = new THREE.Mesh(
    new THREE.TorusGeometry(15.5, 0.03, 16, 220),
    new THREE.MeshBasicMaterial({
      color: 0x7be7ff,
      transparent: true,
      opacity: 0.2,
      depthWrite: false,
    }),
  );
  ringB.rotation.x = THREE.MathUtils.degToRad(68);
  ringB.rotation.z = THREE.MathUtils.degToRad(22);
  group.add(ringB);

  const polarGrid = new THREE.PolarGridHelper(
    22,
    16,
    7,
    72,
    new THREE.Color(0x1e86d4),
    new THREE.Color(0x0d3558),
  );
  polarGrid.position.y = -0.2;
  polarGrid.material.transparent = true;
  polarGrid.material.opacity = 0.16;
  group.add(polarGrid);

  // 背景动效更新。
  const update = (delta) => {
    stars.rotation.y += delta * 0.012;
    stars.rotation.x += delta * 0.004;
    ringA.rotation.z += delta * 0.11;
    ringB.rotation.y += delta * 0.08;
    polarGrid.rotation.y -= delta * 0.02;
  };

  // 释放背景相关几何体和材质。
  const dispose = () => {
    starGeometry.dispose();
    stars.material.dispose();
    ringA.geometry.dispose();
    ringA.material.dispose();
    ringB.geometry.dispose();
    ringB.material.dispose();
    polarGrid.geometry.dispose();
    polarGrid.material.dispose();
  };

  return { group, update, dispose };
}

// 解析源模型骨骼与动画片段，创建源动画混合器。
function getSource(sourceModel, helpers) {
  const clip = sourceModel.animations[0];

  const helper = new THREE.SkeletonHelper(sourceModel.scene);
  helpers.add(helper);

  const skeleton = new THREE.Skeleton(helper.bones);

  const mixer = new THREE.AnimationMixer(sourceModel.scene);
  mixer.clipAction(clip).play();

  return { clip, skeleton, mixer };
}

// 将源动画重定向到目标骨架，并返回目标动画混合器。
function retargetModel(sourceModel, targetModel, helpers) {
  const targetSkin = targetModel.scene.children?.[0]?.children?.[0];
  if (!targetSkin) {
    return null;
  }

  const targetSkelHelper = new THREE.SkeletonHelper(targetModel.scene);
  helpers.add(targetSkelHelper);

  const rotateCW45 = new THREE.Matrix4().makeRotationY(THREE.MathUtils.degToRad(45));
  const rotateCCW180 = new THREE.Matrix4().makeRotationY(THREE.MathUtils.degToRad(-180));
  const rotateCW180 = new THREE.Matrix4().makeRotationY(THREE.MathUtils.degToRad(180));
  const rotateFoot = new THREE.Matrix4().makeRotationFromEuler(
    new THREE.Euler(
      THREE.MathUtils.degToRad(45),
      THREE.MathUtils.degToRad(180),
      THREE.MathUtils.degToRad(0),
    ),
  );

  const retargetOptions = {
    hip: 'mixamorigHips',
    scale: 1 / targetModel.scene.scale.y,
    localOffsets: {
      mixamorigLeftShoulder: rotateCW45,
      mixamorigRightShoulder: rotateCCW180,
      mixamorigLeftArm: rotateCW45,
      mixamorigRightArm: rotateCCW180,
      mixamorigLeftForeArm: rotateCW45,
      mixamorigRightForeArm: rotateCCW180,
      mixamorigLeftHand: rotateCW45,
      mixamorigRightHand: rotateCCW180,
      mixamorigLeftUpLeg: rotateCW180,
      mixamorigRightUpLeg: rotateCW180,
      mixamorigLeftLeg: rotateCW180,
      mixamorigRightLeg: rotateCW180,
      mixamorigLeftFoot: rotateFoot,
      mixamorigRightFoot: rotateFoot,
      mixamorigLeftToeBase: rotateCW180,
      mixamorigRightToeBase: rotateCW180,
    },
    names: {
      mixamorigHips: 'mixamorigHips',
      mixamorigSpine: 'mixamorigSpine',
      mixamorigSpine2: 'mixamorigSpine2',
      mixamorigHead: 'mixamorigHead',
      mixamorigLeftShoulder: 'mixamorigLeftShoulder',
      mixamorigRightShoulder: 'mixamorigRightShoulder',
      mixamorigLeftArm: 'mixamorigLeftArm',
      mixamorigRightArm: 'mixamorigRightArm',
      mixamorigLeftForeArm: 'mixamorigLeftForeArm',
      mixamorigRightForeArm: 'mixamorigRightForeArm',
      mixamorigLeftHand: 'mixamorigLeftHand',
      mixamorigRightHand: 'mixamorigRightHand',
      mixamorigLeftUpLeg: 'mixamorigLeftUpLeg',
      mixamorigRightUpLeg: 'mixamorigRightUpLeg',
      mixamorigLeftLeg: 'mixamorigLeftLeg',
      mixamorigRightLeg: 'mixamorigRightLeg',
      mixamorigLeftFoot: 'mixamorigLeftFoot',
      mixamorigRightFoot: 'mixamorigRightFoot',
      mixamorigLeftToeBase: 'mixamorigLeftToeBase',
      mixamorigRightToeBase: 'mixamorigRightToeBase',
    },
  };

  const retargetedClip = SkeletonUtils.retargetClip(
    targetSkin,
    sourceModel.skeleton,
    sourceModel.clip,
    retargetOptions,
  );

  const mixer = new THREE.AnimationMixer(targetSkin);
  mixer.clipAction(retargetedClip).play();

  return mixer;
}
