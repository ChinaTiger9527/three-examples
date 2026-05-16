import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const sceneSize = {
  width: 800,
  height: 600
}

// Object 对象
const meth = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ color: 0x00ff00 }))

// Scene 画布
const scene = new THREE.Scene({
  canvas: document.querySelector('canvas')
})

scene.add(meth)

// Camera 摄像机
const camera = new THREE.PerspectiveCamera(75, sceneSize.width / sceneSize.height, 0.1, 1000)
camera.position.z = 3
scene.add(camera)

// AxesHelper 坐标尺
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

// Controls 控制器
const controls = new OrbitControls(camera, document.querySelector('canvas'), scene)
controls.enableDamping = true

// Render 渲染器
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('canvas')
})
renderer.setSize(sceneSize.width, sceneSize.height)

function animate() {
  requestAnimationFrame(animate)
  controls.update()
  renderer.render(scene, camera)
}
animate()