import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import './static/style/03.css';
import GUI from 'lil-gui';
import gsap from 'gsap';

const debugObject = {
  color: '#00ff00',
  subdivisions: 2
}

const sceneSize = {
  width: window.innerWidth,
  height: window.innerHeight
}

// Object 对象
const meth = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true }))

// let floatArray = new Float32Array([
//   -1, -1, 0,
//   1, -1, 0,
//   0, 1, 0
// ])
// let floatArray = []
// let count = 10000
// for (let i = 0; i < count; i++) {
//   floatArray.push((Math.random() - 0.5))
//   floatArray.push((Math.random() - 0.5))
//   floatArray.push((Math.random() - 0.5))
// }
// console.log(floatArray)
// let geometry = new THREE.BufferGeometry()
// geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(floatArray), 3))
// const meth = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true }))


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
controls.enableDamping = true // 阻尼器


// debug
const gui = new GUI(
  {
    title: '控制台',
    width: 370,
    closeFolders: true,
  }
)
const methFolder = gui.addFolder('Meth')
// methFolder.open(false)
methFolder.add(meth.position, 'x').min(-5).max(5).step(0.01)
methFolder.add(meth.position, 'y').min(-5).max(5).step(0.01)
methFolder.add(meth.position, 'z').min(-5).max(5).step(0.01)
methFolder.add(meth, 'visible')
methFolder.add(meth.material, 'wireframe')
methFolder.addColor(debugObject, 'color').onChange((value) => {
  meth.material.color.set(value) // three会自动调节颜色，导致色差，则用变量存储gui的颜色值，然后将材质颜色设置为这个值
})
debugObject.spin = () => {
  gsap.to(meth.rotation, { y: meth.rotation.y + Math.PI * 0.5, duration: 1 })
}
methFolder.add(debugObject, 'spin')
methFolder.add(debugObject, 'subdivisions').min(2).max(10).step(1).onFinishChange((value) => {
  meth.geometry.dispose() // 释放旧的几何体资源
  meth.geometry = new THREE.BoxGeometry(1, 1, 1, value, value, value) // 创建新的几何体并赋值给mesh
})

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

// 显示隐藏控制台
window.addEventListener('keydown', (event) => {
  console.log('event', event.key)
  if (event.key === 'Escape') {
    if (gui._hidden) {
      gui.show()
    } else {
      gui.hide()
    }
  }
})

// 全屏事件
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