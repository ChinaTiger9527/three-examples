import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import './style/03.css';

const sceneSize = {
  width: window.innerWidth,
  height: window.innerHeight
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
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)) // 处理高清屏模糊问题

window.addEventListener('resize', () => {
  sceneSize.width = window.innerWidth
  sceneSize.height = window.innerHeight
  camera.aspect = sceneSize.width / sceneSize.height
  camera.updateProjectionMatrix()
  renderer.setSize(sceneSize.width, sceneSize.height)
})

window.addEventListener('dblclick', () => {
  const fullScreenElement = document.fullscreenElement || document.webkitFullscreenElement
  const canvas = document.querySelector('canvas')
  if (!fullScreenElement) {
    if (canvas.requestFullscreen) {
      canvas.requestFullscreen()
    } else if (canvas.webkitRequestFullscreen) {
      canvas.webkitRequestFullscreen()
    } else if (canvas.mozRequestFullScreen) {
      canvas.mozRequestFullScreen()
    } else if (canvas.msRequestFullscreen) {
      canvas.msRequestFullscreen()
    } else {
      console.warn('浏览器不支持全屏 API')
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen()
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen()
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen()
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen()
    } else {
      console.warn('浏览器不支持退出全屏 API')
    }
  }
})

function animate() {
  requestAnimationFrame(animate)
  controls.update()
  renderer.render(scene, camera)
}
animate()