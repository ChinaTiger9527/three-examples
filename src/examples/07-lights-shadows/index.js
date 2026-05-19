import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import GUI from 'lil-gui';
import gsap from 'gsap';
import { syncCanvasSize } from '@/examples/shared/canvas';

export default function mountExample({ canvas, container }) {
  const sceneSize = {
    width: canvas.clientWidth || window.innerWidth,
    height: canvas.clientHeight || window.innerHeight,
  };

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    75,
    sceneSize.width / sceneSize.height,
    0.3,
    1000,
  );
  camera.position.y = 6;
  camera.position.z = 6;

  const material = new THREE.MeshStandardMaterial({ metalness: 0.5 });

  const box = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material);
  box.castShadow = true;
  box.position.set(-3, 1, 0);
  gsap.to(box.rotation, {
    y: Math.PI * 2,
    x: Math.PI * 2,
    duration: 20,
    repeat: -1,
    ease: 'none',
    delay: 1,
  });

  const sphere = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 64), material);
  sphere.castShadow = true;
  sphere.position.y = 1;
  gsap.to(sphere.rotation, {
    y: Math.PI * 2,
    x: Math.PI * 2,
    duration: 20,
    repeat: -1,
    ease: 'none',
    delay: 1,
  });

  const torus = new THREE.Mesh(
    new THREE.TorusGeometry(0.5, 0.3, 16, 20),
    material,
  );
  torus.castShadow = true;
  torus.position.set(3, 1, 0);
  gsap.to(torus.rotation, {
    y: Math.PI * 2,
    x: Math.PI * 2,
    duration: 20,
    repeat: -1,
    ease: 'none',
    delay: 1,
  });

  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshStandardMaterial(),
  );
  plane.rotation.x = -Math.PI / 2;
  plane.receiveShadow = true;

  scene.add(box, sphere, torus, plane, camera);

  const gui = new GUI({
    container,
    title: '控制台',
    width: 300,
    closeFolders: true,
  });

  const ambientLight = new THREE.AmbientLight(0xffffff, 1);
  scene.add(ambientLight);

  const ambientGui = gui.addFolder('环境光');
  ambientGui.add(ambientLight, 'intensity').min(0).max(1).step(0.01);
  ambientGui.addColor(ambientLight, 'color');

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

  const directionalGui = gui.addFolder('平行光');
  directionalGui.add(directionalLight, 'intensity').min(0).max(10).step(0.01);
  directionalGui.add(directionalLight.position, 'x').min(-10).max(10).step(0.01);
  directionalGui.add(directionalLight.position, 'y').min(-10).max(10).step(0.01);
  directionalGui.add(directionalLight.position, 'z').min(-10).max(10).step(0.01);
  directionalGui.addColor(directionalLight, 'color');
  directionalGui
    .add(directionalLight.shadow.camera, 'near')
    .min(0.1)
    .max(20)
    .step(0.1)
    .name('阴影相机近裁剪面');
  directionalGui
    .add(directionalLight.shadow.camera, 'far')
    .min(0.1)
    .max(20)
    .step(0.1)
    .name('阴影相机远裁剪面');
  directionalGui
    .add(directionalLight.shadow.camera, 'left')
    .min(-10)
    .max(0)
    .step(0.1)
    .name('阴影相机左边界');
  directionalGui
    .add(directionalLight.shadow.camera, 'right')
    .min(0)
    .max(10)
    .step(0.1)
    .name('阴影相机右边界');
  directionalGui
    .add(directionalLight.shadow.camera, 'top')
    .min(0)
    .max(10)
    .step(0.1)
    .name('阴影相机上边界');
  directionalGui
    .add(directionalLight.shadow.camera, 'bottom')
    .min(-10)
    .max(0)
    .step(0.1)
    .name('阴影相机下边界');

  const directionalShadowCameraHelper = new THREE.CameraHelper(
    directionalLight.shadow.camera,
  );
  scene.add(directionalShadowCameraHelper);
  directionalGui
    .add(directionalShadowCameraHelper, 'visible')
    .name('显示阴影相机辅助器');
  directionalGui.onFinishChange(() => {
    directionalLight.shadow.camera.updateProjectionMatrix();
    directionalShadowCameraHelper.update();
  });

  const directionalHelper = new THREE.DirectionalLightHelper(directionalLight, 1);
  scene.add(directionalHelper);

  const axesHelper = new THREE.AxesHelper(5);
  scene.add(axesHelper);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.shadowMap.enabled = true;

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;

  const clock = new THREE.Clock();

  const handleResize = () => {
    syncCanvasSize(renderer, camera, canvas, sceneSize);
  };

  window.addEventListener('resize', handleResize);
  handleResize();

  let frameId = 0;
  const animate = () => {
    frameId = requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();
    sphere.position.x = Math.cos(elapsedTime) * 3;
    sphere.position.z = Math.sin(elapsedTime) * 3;
    sphere.position.y = Math.abs(Math.sin(elapsedTime * 4)) * 3 + 1;
    controls.update();
    renderer.render(scene, camera);
  };

  animate();

  return () => {
    cancelAnimationFrame(frameId);
    window.removeEventListener('resize', handleResize);
    gui.destroy();
    controls.dispose();
    box.geometry.dispose();
    sphere.geometry.dispose();
    torus.geometry.dispose();
    plane.geometry.dispose();
    plane.material.dispose();
    material.dispose();
    renderer.dispose();
  };
}
