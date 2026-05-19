import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { setControlsTarget, watchCanvasSize } from '@/examples/shared/canvas';

const matcapUrl = new URL('../../static/image/matcap/06.png', import.meta.url).href;
const fontUrl = new URL(
  '../../static/font/zihunchuyati_T_Regular.json',
  import.meta.url,
).href;

export default function mountExample({ canvas }) {
  const sceneSize = {
    width: canvas.clientWidth || window.innerWidth,
    height: canvas.clientHeight || window.innerHeight,
  };

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    75,
    sceneSize.width / sceneSize.height,
    0.5,
    1000,
  );
  camera.position.z = 40;
  scene.add(camera);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;

  const textureLoader = new THREE.TextureLoader();
  const matcapTexture = textureLoader.load(matcapUrl);
  const material = new THREE.MeshMatcapMaterial({ matcap: matcapTexture });

  const torusGeometry = new THREE.TorusGeometry(1.8, 0.8, 16, 50);
  const floatingMeshes = [];
  const count = 300;

  for (let index = 0; index < count; index += 1) {
    const mesh = new THREE.Mesh(torusGeometry, material);
    mesh.position.set(
      (Math.random() - 0.5) * 200,
      (Math.random() - 0.5) * 200,
      (Math.random() - 0.5) * 100,
    );
    mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
    const scale = Math.random() * 0.5 + 0.5;
    mesh.scale.set(scale, scale, scale);
    floatingMeshes.push(mesh);
    scene.add(mesh);
  }

  let textGeometry = null;
  let textMesh = null;
  let disposed = false;

  const fontLoader = new FontLoader();
  fontLoader.load(fontUrl, (font) => {
    if (disposed) {
      return;
    }

    textGeometry = new TextGeometry('天空飘过五个字', {
      font,
      size: 8,
      depth: 1,
    });
    textGeometry.center();
    textMesh = new THREE.Mesh(textGeometry, material);
    scene.add(textMesh);
    setControlsTarget(controls, textMesh);
  });

  const stopWatchingSize = watchCanvasSize(renderer, camera, canvas, sceneSize);

  let frameId = 0;
  const animate = () => {
    frameId = requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  };

  animate();

  return () => {
    disposed = true;
    cancelAnimationFrame(frameId);
    stopWatchingSize();
    controls.dispose();
    textGeometry?.dispose();
    torusGeometry.dispose();
    material.dispose();
    matcapTexture.dispose();
    renderer.dispose();
  };
}
