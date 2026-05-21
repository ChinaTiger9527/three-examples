import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import GUI from 'lil-gui';
import { watchCanvasSize } from '@/examples/shared/canvas';
import * as CANNON from 'cannon-es';


export default function mountExample({ canvas, container }) {
  console.log('10')
  let debugObject = {
    createSphere: () => {
      createdSphere(Math.random(), { x: 0, y: 3, z: 0 })
    },
    createBox: () => {
      createdBox({ w: Math.random(), h: Math.random(), d: Math.random() }, { x: 0, y: 3, z: 0 })
    },
    reset: () => {
      objectsToUpdate.forEach(({ mesh, body }) => {
        scene.remove(mesh);
        world.removeBody(body);
      })
      objectsToUpdate = [];
    }
  }
  let gui = new GUI({
    container,
    title: '控制台',
    width: 300,
  })
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
  camera.position.set(4, 6, 6)
  camera.position.y = 6;
  camera.position.z = 6;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.shadowMap.enabled = true; // 启用阴影
  const stopWatchingSize = watchCanvasSize(renderer, camera, canvas, sceneSize);


  // renderer.shadowMap.type = THREE.PCFSoftShadowMap; // 使用柔和阴影

  const controls = new OrbitControls(camera, canvas);
  // controls.enableDamping = true; // 物理引擎示例中不启用阻尼，以保持物理效果的真实性
  camera.position.y = 6;
  camera.position.z = 6;
  // 环境光
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);
  // 平行光
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

  // let directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 0.5);
  // scene.add(directionalLightHelper);

  const world = new CANNON.World({
    gravity: new CANNON.Vec3(0, -9.82, 0), // m/s²
  })
  world.broadphase = new CANNON.SAPBroadphase(world) // 使用SAP算法进行碰撞检测，适合静态物体较多的场景

  let objectsToUpdate = []; // 用于存储需要在动画循环中更新位置的对象

  let defaultMaterial = new THREE.MeshStandardMaterial({
    metalness: 0.5,
  });
  let defaultCANNONMaterial = new CANNON.Material('default');
  let groundCANNONMaterial = new CANNON.Material('ground');
  let defaultContactMaterial = new CANNON.ContactMaterial( // 定义默认的接触材料，适用于所有物体之间的碰撞
    defaultCANNONMaterial,
    defaultCANNONMaterial,
    {
      friction: 0.1,
      restitution: 0.9,
    }
  )
  gui.add(defaultContactMaterial, 'friction').min(0).max(1).step(0.01).name('默认接触材料摩擦力');
  gui.add(defaultContactMaterial, 'restitution').min(0).max(1).step(0.01).name('默认接触材料弹性');

  let groundContactMaterial = new CANNON.ContactMaterial(
    defaultCANNONMaterial,
    groundCANNONMaterial,
    {
      friction: 0.5,
      restitution: 0.5,
    }
  )
  gui.add(groundContactMaterial, 'friction').min(0).max(1).step(0.01).name('地面接触材料摩擦力');
  gui.add(groundContactMaterial, 'restitution').min(0).max(1).step(0.01).name('地面接触材料弹性');

  world.addContactMaterial(defaultContactMaterial)
  world.addContactMaterial(groundContactMaterial)


  let sphereGeometry = new THREE.SphereGeometry(1, 32, 16)
  function createdSphere(radius = 1, { x, y, z } = { x: 0, y: 3, z: 0 }) {
    let sphereMesh = new THREE.Mesh(sphereGeometry, defaultMaterial);
    sphereMesh.scale.set(radius, radius, radius);
    sphereMesh.castShadow = true;
    sphereMesh.position.set(x, y, z);
    scene.add(sphereMesh);

    let sphereShape = new CANNON.Sphere(radius) // 半径为radius的球体
    const sphereBody = new CANNON.Body({
      mass: 3, // kg
      shape: sphereShape,
      material: defaultCANNONMaterial, // 弹性
    })
    sphereBody.position.set(x, y, z);
    sphereBody.applyLocalForce(new CANNON.Vec3(150, 0, 0), new CANNON.Vec3(0, 0, 0)) // 在球体上施加一个向右的力，产生滚动效果
    world.addBody(sphereBody)

    objectsToUpdate.push({
      mesh: sphereMesh,
      body: sphereBody,
    })
  }

  let boxGeometry = new THREE.BoxGeometry(1, 1, 1);
  function createdBox({ w, h, d } = { w: 1, h: 1, d: 1 }, { x, y, z } = { x: 0, y: 1, z: 0 }) {
    let boxMesh = new THREE.Mesh(boxGeometry, defaultMaterial);
    boxMesh.scale.set(w, h, d);
    boxMesh.castShadow = true;
    boxMesh.position.set(x, y, z);
    scene.add(boxMesh);

    let boxShape = new CANNON.Box(new CANNON.Vec3(w / 2, h / 2, d / 2));
    const boxBody = new CANNON.Body({
      mass: 3,
      shape: boxShape,
      material: defaultCANNONMaterial,
    })
    boxBody.position.set(x, y, z);
    world.addBody(boxBody)
    objectsToUpdate.push({
      mesh: boxMesh,
      body: boxBody,
    })
  }

  function createdPlane() {
    let planeGeometry = new THREE.PlaneGeometry(10, 10);
    let plane = new THREE.Mesh(planeGeometry, new THREE.MeshStandardMaterial());
    plane.receiveShadow = true
    plane.rotation.x = -Math.PI / 2;
    scene.add(plane);

    let planeShape = new CANNON.Plane()
    const planeBody = new CANNON.Body({
      mass: 0, // kg
      shape: planeShape,
      material: groundCANNONMaterial, // 弹性
    })
    planeBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0) // 将平面旋转到水平位置
    world.addBody(planeBody)
  }

  // createdSphere()
  // createdBox()
  createdPlane()

  gui.add(debugObject, 'createSphere').name('创建球体');
  gui.add(debugObject, 'createBox').name('创建盒子');
  gui.add(debugObject, 'reset').name('清空场景');

  let clock = new THREE.Clock();
  let startElapsedTime = 0
  let frameId = 0;
  const animate = () => {
    let elapsedTime = clock.getElapsedTime() - startElapsedTime;
    frameId = requestAnimationFrame(animate);
    world.step(1 / 60, elapsedTime, 3);
    objectsToUpdate.forEach(({ mesh, body }) => {
      mesh.position.copy(body.position);
      mesh.quaternion.copy(body.quaternion);
    });
    // sphere.position.copy(sphereBody.position)
    // sphere.quaternion.copy(sphereBody.quaternion)
    controls.update();
    renderer.render(scene, camera);
  };

  animate();
  return () => {
    cancelAnimationFrame(frameId);
    stopWatchingSize();
    gui.destroy();
    controls.dispose();
    defaultMaterial?.dispose();
    sphereGeometry?.dispose();
    boxGeometry?.dispose()
    // points?.geometry.dispose();
    renderer.dispose();
  };
}