import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
let sceneSize = {
  width: window.innerWidth,
  height: window.innerHeight
}

// 创建场景
let scene = new THREE.Scene({
  canvas: document.querySelector('canvas')
})

// 添加坐标轴辅助器
// let axesHelper = new THREE.AxesHelper(5)
// scene.add(axesHelper)

// 创建相机
let camera = new THREE.PerspectiveCamera(75, sceneSize.width / sceneSize.height, 0.5, 1000)
camera.position.z = 40

scene.add(camera)

// 创建渲染器
let render = new THREE.WebGLRenderer({
  canvas: document.querySelector('canvas')
})
render.setSize(sceneSize.width, sceneSize.height)

// 创建控制器
let controls = new OrbitControls(camera, render.domElement);
scene.add(controls)

// 创建纹理
let textureLoader = new THREE.TextureLoader()
let texture = textureLoader.load('/src/static/image/matcap/06.png')

// 创建材质
let material = new THREE.MeshMatcapMaterial()
material.matcap = texture

const geometry = new THREE.TorusGeometry(1.8, 0.8, 16, 50);
let count = 300
for (let i = 0; i < count; i++) {
  let mesh = new THREE.Mesh(geometry, material)
  mesh.position.set((Math.random() - 0.5) * 200, (Math.random() - 0.5) * 200, (Math.random() - 0.5) * 100)
  mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0)
  let scale = Math.random() * 0.5 + 0.5
  mesh.scale.set(scale, scale, scale)
  scene.add(mesh)
}

let fontLoader = new FontLoader()
// await loader.loadAsync
fontLoader.load('/src/static/font/zihunchuyati_T_Regular.json', (font) => {
  console.log('字体加载完成', font, THREE)
  let textGeometry = new TextGeometry('天空飘过五个字', {
    font: font,
    size: 8,
    depth: 1,
    // curveSegments: 12,
    // bevelEnabled: true,
    // bevelThickness: 0.03,
    // bevelSize: 0.02,
    // bevelOffset: 0,
    // bevelSegments: 5
  })
  let text = new THREE.Mesh(textGeometry, material)
  textGeometry.center()
  textGeometry.computeBoundingBox()
  console.log('textGeometry.boundingBox', textGeometry.boundingBox)
  text.wireframe = true
  scene.add(text)
  camera.lookAt(text.position)
})

let nick = () => {
  render.render(scene, camera)
  requestAnimationFrame(nick)
}
nick()