import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import GUI from 'lil-gui';
import gsap from 'gsap';
import { syncCanvasSize } from '@/examples/shared/canvas';

const environmentMapUrl = new URL(
  '../../static/image/glasshouse_interior_4k.hdr',
  import.meta.url,
).href;

export default function mountExample({ canvas, container }) {
  const debugObject = {
    color: '#00ff00',
    subdivisions: 2,
  };

  const sceneSize = {
    width: canvas.clientWidth || window.innerWidth,
    height: canvas.clientHeight || window.innerHeight,
  };

  const scene = new THREE.Scene();
  const ambientLight = new THREE.AmbientLight(0xffffff, 1);
  const light = new THREE.PointLight(0xffffff, 50);
  light.position.set(2, 3, 4);
  scene.add(ambientLight, light);

  const gui = new GUI({
    container,
    width: 400,
    title: '控制台',
  });

  const material = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('white'),
    metalness: 0.5,
    roughness: 0.5,
    transmission: 1,
    ior: 1.5,
    thickness: 0.1,
  });

  gui.add(light, 'intensity').min(0).max(100).step(0.01);
  gui.addColor(debugObject, 'color').onChange(() => {
    material.color.set(debugObject.color);
  });
  gui.add(material, 'metalness').min(0).max(1).step(0.01);
  gui.add(material, 'roughness').min(0).max(1).step(0.01);
  gui.add(material, 'transmission').min(0).max(1).step(0.01);
  gui.add(material, 'ior').min(0).max(2).step(0.01);
  gui.add(material, 'thickness').min(0).max(1).step(0.01);

  const box = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material);
  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(
      1,
      1,
      debugObject.subdivisions,
      debugObject.subdivisions,
    ),
    material,
  );
  plane.position.x = 2;

  const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.5), material);
  sphere.position.x = 4;

  const torus = new THREE.Mesh(
    new THREE.TorusGeometry(0.5, 0.2, 16, 100),
    material,
  );
  torus.position.x = 6;

  scene.add(box, plane, sphere, torus);

  gsap.to(box.rotation, {
    y: Math.PI * 2,
    x: Math.PI * 2,
    duration: 20,
    repeat: -1,
    ease: 'none',
    delay: 1,
  });
  gsap.to(plane.rotation, {
    y: Math.PI * 2,
    x: Math.PI * 2,
    duration: 20,
    repeat: -1,
    ease: 'none',
    delay: 1,
  });
  gsap.to(sphere.rotation, {
    y: Math.PI * 2,
    x: Math.PI * 2,
    duration: 20,
    repeat: -1,
    ease: 'none',
    delay: 1,
  });
  gsap.to(torus.rotation, {
    y: Math.PI * 2,
    x: Math.PI * 2,
    duration: 20,
    repeat: -1,
    ease: 'none',
    delay: 1,
  });

  const camera = new THREE.PerspectiveCamera(
    75,
    sceneSize.width / sceneSize.height,
    0.1,
    1000,
  );
  camera.position.z = 5;

  const axesHelper = new THREE.AxesHelper(100);
  scene.add(axesHelper);

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });

  const rgbeLoader = new RGBELoader();
  let environmentTexture = null;
  rgbeLoader.load(environmentMapUrl, (texture) => {
    environmentTexture = texture;
    environmentTexture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = environmentTexture;
    scene.background = environmentTexture;
  });

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
    gui.destroy();
    controls.dispose();
    box.geometry.dispose();
    plane.geometry.dispose();
    sphere.geometry.dispose();
    torus.geometry.dispose();
    material.dispose();
    environmentTexture?.dispose();
    renderer.dispose();
  };
}
