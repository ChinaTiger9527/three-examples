import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { watchCanvasSize } from '@/examples/shared/canvas';

export default function mountExample({ canvas }) {
  const sceneSize = {
    width: canvas.clientWidth || window.innerWidth,
    height: canvas.clientHeight || window.innerHeight,
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

  const stopWatchingSize = watchCanvasSize(renderer, camera, canvas, sceneSize);

  const toggleFullscreen = async () => {
    const fullscreenElement =
      document.fullscreenElement || document.webkitFullscreenElement;

    if (!fullscreenElement) {
      if (canvas.requestFullscreen) {
        await canvas.requestFullscreen();
      } else if (canvas.webkitRequestFullscreen) {
        canvas.webkitRequestFullscreen();
      }
      return;
    }

    if (document.exitFullscreen) {
      await document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
  };

  canvas.addEventListener('dblclick', toggleFullscreen);

  let frameId = 0;
  const animate = () => {
    frameId = requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  };

  animate();

  return () => {
    cancelAnimationFrame(frameId);
    stopWatchingSize();
    canvas.removeEventListener('dblclick', toggleFullscreen);
    controls.dispose();
    geometry.dispose();
    material.dispose();
    renderer.dispose();
  };
}
