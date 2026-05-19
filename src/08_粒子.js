import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import './static/style/03.css';
import GUI from 'lil-gui';
import gsap from 'gsap';

let guiParams = {
  count: 40000, // 粒子数量
  size: 0.03, // 粒子大小
  radius: 5, // 粒子分布半径
  branches: 8, // 分支数量
  spin: 1, // 旋转强度
  randomness: 0.2, // 随机强度
  randomnessPower: 3, // 随机分布幂次
  insideColor: '#ff6030',
  outsideColor: '#1b3984'
}

let sceneSize = {
  width: window.innerWidth,
  height: window.innerHeight
}

// 创建场景
let scene = new THREE.Scene({
  canvas: document.querySelector('canvas')
})

// 创建相机
let camera = new THREE.PerspectiveCamera(75, sceneSize.width / sceneSize.height, 0.3, 1000)
camera.position.y = 6
camera.position.z = 6
scene.add(camera)

// 创建渲染器
let render = new THREE.WebGLRenderer({
  canvas: document.querySelector('canvas')
})
render.setSize(sceneSize.width, sceneSize.height)

// 创建控制器
let controls = new OrbitControls(camera, render.domElement);


let gui = new GUI({
  title: '控制台',
  width: 300,
  closeFolders: true,
})

let material

let points
function generateGalaxy() {
  if (points) {
    material.dispose()
    points.geometry.dispose()
    scene.remove(points)
  }
  let color = new THREE.Color(guiParams.insideColor)
  let bufferGeometry = new THREE.BufferGeometry()
  let float32Array = new Float32Array(guiParams.count * 3)
  let colorFloat32Array = new Float32Array(guiParams.count * 3)
  for (let i = 0; i < guiParams.count; i++) {
    let angle = (i % guiParams.branches) / guiParams.branches * Math.PI * 2
    let radius = Math.random() * guiParams.radius
    let spinAngle = radius * guiParams.spin

    let randomX = Math.pow(Math.random(), guiParams.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * guiParams.randomness * radius
    let randomY = Math.pow(Math.random(), guiParams.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * guiParams.randomness * radius * 1.5
    let randomZ = Math.pow(Math.random(), guiParams.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * guiParams.randomness * radius

    let x = Math.cos(angle + spinAngle) * radius + randomX
    let y = 0 + randomY
    let z = Math.sin(angle + spinAngle) * radius + randomZ
    float32Array[i * 3 + 0] = x
    float32Array[i * 3 + 1] = y
    float32Array[i * 3 + 2] = z


    let mixedColor = color.clone()
    mixedColor.lerp(new THREE.Color(guiParams.outsideColor), radius / guiParams.radius)
    colorFloat32Array[i * 3 + 0] = mixedColor.r
    colorFloat32Array[i * 3 + 1] = mixedColor.g
    colorFloat32Array[i * 3 + 2] = mixedColor.b

    if (i < 20) {
      console.log(i, angle)
    }
  }
  bufferGeometry.setAttribute('position', new THREE.BufferAttribute(float32Array, 3))
  bufferGeometry.setAttribute('color', new THREE.BufferAttribute(colorFloat32Array, 3))

  material = new THREE.PointsMaterial({
    size: guiParams.size,
    // map: circle,
    // alphaMap: circle,
    vertexColors: true, // 启用顶点颜色
    transparent: true,
    depthWrite: false, // 关闭深度写入
    blending: THREE.AdditiveBlending, // 设置混合模式为加法混合
  })
  points = new THREE.Points(bufferGeometry, material)
  scene.add(points)
}
generateGalaxy()

gui.add(guiParams, 'count').min(100).max(100000).step(100)
gui.add(guiParams, 'size').min(0.001).max(0.1).step(0.001)
gui.add(guiParams, 'radius').min(0.001).max(10).step(0.1)
gui.add(guiParams, 'branches').min(1).max(20).step(1)
gui.add(guiParams, 'spin').min(-5).max(5).step(0.1)
gui.add(guiParams, 'randomness').min(0).max(2).step(0.01)
gui.add(guiParams, 'randomnessPower').min(1).max(10).step(0.1)
gui.addColor(guiParams, 'insideColor')
gui.addColor(guiParams, 'outsideColor')
gui.onFinishChange(() => {
  generateGalaxy()
})

let axesHelper = new THREE.AxesHelper(5)
scene.add(axesHelper)

let clock = new THREE.Clock()
let nick = () => {
  let elapsedTime = clock.getElapsedTime()
  points.rotation.y = elapsedTime * 0.1
  requestAnimationFrame(nick)
  controls.update();
  render.render(scene, camera)
}
nick()