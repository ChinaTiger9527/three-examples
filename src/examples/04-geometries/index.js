import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import GUI from 'lil-gui';
import gsap from 'gsap';
import { setControlsTarget, watchCanvasSize } from '@/examples/shared/canvas';

export default function mountExample({ canvas, container }) {
  const debugObject = {
    color: '#00ff00',
    subdivisions: 2,
  };

  const sceneSize = {
    width: canvas.clientWidth || window.innerWidth,
    height: canvas.clientHeight || window.innerHeight,
  };

  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load(
    'https://threejs.org/manual/examples/resources/images/wall.jpg',
  );
  texture.generateMipmaps = false;

  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial({ map: texture, wireframe: false }),
  );

  const cone = new THREE.Mesh(
    new THREE.ConeGeometry(1, 2, 4),
    new THREE.MeshBasicMaterial({ map: texture, wireframe: false }),
  );
  cone.position.x = 3;

  const capsule = new THREE.Mesh(
    new THREE.CapsuleGeometry(1, 1, 4, 8, 1),
    new THREE.MeshBasicMaterial({ map: texture, wireframe: false }),
  );
  capsule.position.x = -3;

  const scene = new THREE.Scene();
  scene.add(mesh, cone, capsule);

  const camera = new THREE.PerspectiveCamera(
    75,
    sceneSize.width / sceneSize.height,
    0.1,
    1000,
  );
  camera.position.z = 8;
  scene.add(camera);

  const axesHelper = new THREE.AxesHelper(5);
  scene.add(axesHelper);

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  setControlsTarget(controls, [mesh, cone, capsule]);

  const gui = new GUI({
    container,
    title: '控制台',
    width: 370,
    closeFolders: true,
  });

  const meshFolder = gui.addFolder('Mesh');
  meshFolder.add(mesh.position, 'x').min(-5).max(5).step(0.01);
  meshFolder.add(mesh.position, 'y').min(-5).max(5).step(0.01);
  meshFolder.add(mesh.position, 'z').min(-5).max(5).step(0.01);
  meshFolder.add(mesh, 'visible');
  meshFolder.add(mesh.material, 'wireframe');
  meshFolder.addColor(debugObject, 'color').onChange((value) => {
    mesh.material.color.set(value);
  });

  debugObject.spin = () => {
    gsap.to(mesh.rotation, { y: mesh.rotation.y + Math.PI * 0.5, duration: 1 });
  };

  meshFolder.add(debugObject, 'spin');
  meshFolder
    .add(debugObject, 'subdivisions')
    .min(2)
    .max(10)
    .step(1)
    .onFinishChange((value) => {
      mesh.geometry.dispose();
      mesh.geometry = new THREE.BoxGeometry(1, 1, 1, value, value, value);
    });

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });

  const stopWatchingSize = watchCanvasSize(renderer, camera, canvas, sceneSize);

  const handleKeydown = (event) => {
    if (event.key === 'Escape') {
      if (gui._hidden) {
        gui.show();
      } else {
        gui.hide();
      }
    }
  };

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

  window.addEventListener('keydown', handleKeydown);
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
    window.removeEventListener('keydown', handleKeydown);
    canvas.removeEventListener('dblclick', toggleFullscreen);
    gui.destroy();
    controls.dispose();
    mesh.geometry.dispose();
    mesh.material.dispose();
    cone.geometry.dispose();
    cone.material.dispose();
    capsule.geometry.dispose();
    capsule.material.dispose();
    texture.dispose();
    renderer.dispose();
  };
}
