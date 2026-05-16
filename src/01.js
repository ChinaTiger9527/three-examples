import * as THREE from 'three';
import gsap from 'gsap';
console.log(THREE, gsap)



// Cursor
const cursor = {
  x: 0,
  y: 0
}
window.addEventListener('mousemove', (event) => {
  cursor.x = event.clientX / document.querySelector('canvas').clientWidth - 0.5
  cursor.y = event.clientY / document.querySelector('canvas').clientHeight - 0.5
  console.log(cursor.x, cursor.y)
})

// Object 对象
// const geometry = new THREE.BoxGeometry(1, 1, 1, 2, 3, 4);
// const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
// const cube = new THREE.Mesh(geometry, material);
// cube.position.set(1, 2, 3)

// group
const group = new THREE.Group()
const cube1 = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ color: 0xff0000 }))
cube1.position.x = -2
const cube2 = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ color: 0x00ff00 }))
const cube3 = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ color: 0x0000ff }))
cube3.position.x = 2
group.add(cube1)
group.add(cube2)
group.add(cube3)


// Scene 画布
const scene = new THREE.Scene();
// scene.add(cube);
group.position.x = 0
// group.position.y = 1
group.position.z = 1
// group.scale.y = 2
scene.add(group)

// axes helper 坐标尺
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

// Scale 比例
// cube.rotation.reorder('ZYX')
// cube.scale.x = 1;
// cube.scale.y = 2;
// cube.scale.z = 1;
// cube.scale.set(1, 0.5, 0.5)

// rotaion 旋转
// cube.rotation.x += 0.5
// cube.rotation.y += 2
// cube.rotation.z += 3

// Camera 相机
const camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 1000);

// const aspectRatio = window.innerWidth / window.innerHeight
// const camera = new THREE.OrthographicCamera(-1 * aspectRatio, 1 * aspectRatio, 1, -1, 0.1, 1000);


// camera.position.x = 1;
// camera.position.y = 1;
camera.position.z = 6;
// camera.lookAt(cube.position)

// Renderer 渲染
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('myCanvas') });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// renderer.render(scene, camera);
// Animation loop
// function animate() {
//   requestAnimationFrame(animate);
//   cube.rotation.x += 0.1
//   cube.rotation.y += 0.1
//   cube.rotation.z += 0.1
//   // cube.rotation.x += 0.005;
//   // cube.rotation.y += 0.005;
//   // cube.position.x += 0.01;
//   // cube.position.y += 0.01;
//   renderer.render(scene, camera);
// }
// animate();

// Clock 时钟
const clock = new THREE.Clock()
// gsap.to(group.position, { x: 2, y: 1, z: 1, duration: 1, delay: 1, repeat: -1, reverse: true })

const tick = () => {
  requestAnimationFrame(tick);
  const elapsedTime = clock.getElapsedTime()
  // cube1.position.x = Math.cos(elapsedTime)
  // cube1.position.y = Math.sin(elapsedTime)
  // cube1.rotation.x = Math.sin(elapsedTime)
  // cube1.rotation.z = Math.sin(elapsedTime)
  // cube1.rotation.y = elapsedTime

  //update camera
  // camera.position.x = cursor.x * 30
  // camera.position.y = -cursor.y * 30
  // camera.lookAt(cube1.position)

  camera.position.x = Math.sin(cursor.x * Math.PI * 2) * 8
  camera.position.z = Math.cos(cursor.x * Math.PI * 2) * 8
  camera.position.y = cursor.y * 20
  camera.lookAt(group.position)

  renderer.render(scene, camera);
  // console.log(elapsedTime)
}

tick()