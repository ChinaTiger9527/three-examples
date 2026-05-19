import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { syncCanvasSize } from '@/examples/shared/canvas';

export default function mountExample({ canvas }) {
  const sceneSize = {
    width: canvas.clientWidth || 800,
    height: canvas.clientHeight || 600,
  };

  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  const mesh = new THREE.Mesh(geometry, material);

  const scene = new THREE.Scene();
  scene.add(mesh);

  const camera = new THREE.PerspectiveCamera(
    75,
    sceneSize.width / sceneSize.height,
    0.1,
    1000,
  );
  camera.position.z = 3;
  scene.add(camera);

  const axesHelper = new THREE.AxesHelper(5);
  scene.add(axesHelper);

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });

  const handleResize = () => {
    syncCanvasSize(renderer, camera, canvas, sceneSize);
  };

  window.addEventListener('resize', handleResize);
  handleResize();

  let frameId = 0;
  const animate = () => {
    frameId = requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  };

  animate();

  return () => {
    cancelAnimationFrame(frameId);
    window.removeEventListener('resize', handleResize);
    controls.dispose();
    geometry.dispose();
    material.dispose();
    renderer.dispose();
  };
}
