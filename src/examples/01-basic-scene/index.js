import * as THREE from 'three';
import { syncCanvasSize } from '@/examples/shared/canvas';

export default function mountExample({ canvas }) {
  const cursor = { x: 0, y: 0 };
  const sceneSize = {
    width: canvas.clientWidth || window.innerWidth,
    height: canvas.clientHeight || window.innerHeight,
  };

  const group = new THREE.Group();
  const cube1 = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial({ color: 0xff0000 }),
  );
  cube1.position.x = -2;

  const cube2 = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial({ color: 0x00ff00 }),
  );

  const cube3 = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial({ color: 0x0000ff }),
  );
  cube3.position.x = 2;

  group.add(cube1, cube2, cube3);
  group.position.z = 1;

  const scene = new THREE.Scene();
  scene.add(group);

  const axesHelper = new THREE.AxesHelper(5);
  scene.add(axesHelper);

  const camera = new THREE.PerspectiveCamera(
    90,
    sceneSize.width / sceneSize.height,
    0.1,
    1000,
  );
  camera.position.z = 6;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });

  const clock = new THREE.Clock();

  const handleMouseMove = (event) => {
    const rect = canvas.getBoundingClientRect();
    cursor.x = (event.clientX - rect.left) / rect.width - 0.5;
    cursor.y = (event.clientY - rect.top) / rect.height - 0.5;
  };

  const handleResize = () => {
    syncCanvasSize(renderer, camera, canvas, sceneSize);
  };

  window.addEventListener('mousemove', handleMouseMove);
  window.addEventListener('resize', handleResize);
  handleResize();

  let frameId = 0;
  const tick = () => {
    frameId = requestAnimationFrame(tick);
    clock.getElapsedTime();

    camera.position.x = Math.sin(cursor.x * Math.PI * 2) * 8;
    camera.position.z = Math.cos(cursor.x * Math.PI * 2) * 8;
    camera.position.y = cursor.y * 20;
    camera.lookAt(group.position);

    renderer.render(scene, camera);
  };

  tick();

  return () => {
    cancelAnimationFrame(frameId);
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('resize', handleResize);
    cube1.geometry.dispose();
    cube1.material.dispose();
    cube2.geometry.dispose();
    cube2.material.dispose();
    cube3.geometry.dispose();
    cube3.material.dispose();
    renderer.dispose();
  };
}
