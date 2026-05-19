import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import GUI from 'lil-gui';
import { syncCanvasSize } from '@/examples/shared/canvas';

export default function mountExample({ canvas, container }) {
  const guiParams = {
    count: 40000,
    size: 0.03,
    radius: 5,
    branches: 8,
    spin: 1,
    randomness: 0.2,
    randomnessPower: 3,
    insideColor: '#ff6030',
    outsideColor: '#1b3984',
  };

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
  scene.add(camera);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;

  const gui = new GUI({
    container,
    title: '控制台',
    width: 300,
    closeFolders: true,
  });

  let material = null;
  let points = null;

  const generateGalaxy = () => {
    if (points) {
      material.dispose();
      points.geometry.dispose();
      scene.remove(points);
    }

    const insideColor = new THREE.Color(guiParams.insideColor);
    const bufferGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(guiParams.count * 3);
    const colors = new Float32Array(guiParams.count * 3);

    for (let index = 0; index < guiParams.count; index += 1) {
      const angle =
        ((index % guiParams.branches) / guiParams.branches) * Math.PI * 2;
      const radius = Math.random() * guiParams.radius;
      const spinAngle = radius * guiParams.spin;

      const randomX =
        Math.pow(Math.random(), guiParams.randomnessPower) *
        (Math.random() < 0.5 ? 1 : -1) *
        guiParams.randomness *
        radius;
      const randomY =
        Math.pow(Math.random(), guiParams.randomnessPower) *
        (Math.random() < 0.5 ? 1 : -1) *
        guiParams.randomness *
        radius *
        1.5;
      const randomZ =
        Math.pow(Math.random(), guiParams.randomnessPower) *
        (Math.random() < 0.5 ? 1 : -1) *
        guiParams.randomness *
        radius;

      positions[index * 3] = Math.cos(angle + spinAngle) * radius + randomX;
      positions[index * 3 + 1] = randomY;
      positions[index * 3 + 2] = Math.sin(angle + spinAngle) * radius + randomZ;

      const mixedColor = insideColor.clone();
      mixedColor.lerp(
        new THREE.Color(guiParams.outsideColor),
        radius / guiParams.radius,
      );
      colors[index * 3] = mixedColor.r;
      colors[index * 3 + 1] = mixedColor.g;
      colors[index * 3 + 2] = mixedColor.b;
    }

    bufferGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(positions, 3),
    );
    bufferGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    material = new THREE.PointsMaterial({
      size: guiParams.size,
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    points = new THREE.Points(bufferGeometry, material);
    scene.add(points);
  };

  generateGalaxy();

  gui.add(guiParams, 'count').min(100).max(100000).step(100);
  gui.add(guiParams, 'size').min(0.001).max(0.1).step(0.001);
  gui.add(guiParams, 'radius').min(0.001).max(10).step(0.1);
  gui.add(guiParams, 'branches').min(1).max(20).step(1);
  gui.add(guiParams, 'spin').min(-5).max(5).step(0.1);
  gui.add(guiParams, 'randomness').min(0).max(2).step(0.01);
  gui.add(guiParams, 'randomnessPower').min(1).max(10).step(0.1);
  gui.addColor(guiParams, 'insideColor');
  gui.addColor(guiParams, 'outsideColor');
  gui.onFinishChange(generateGalaxy);

  const axesHelper = new THREE.AxesHelper(5);
  scene.add(axesHelper);

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
    if (points) {
      points.rotation.y = elapsedTime * 0.1;
    }
    controls.update();
    renderer.render(scene, camera);
  };

  animate();

  return () => {
    cancelAnimationFrame(frameId);
    window.removeEventListener('resize', handleResize);
    gui.destroy();
    controls.dispose();
    material?.dispose();
    points?.geometry.dispose();
    renderer.dispose();
  };
}
