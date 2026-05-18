import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import GUI from 'lil-gui';
import './static/style/03.css';
import gsap from 'gsap';
import { RectAreaLightHelper } from 'three/addons/helpers/RectAreaLightHelper.js';

let sceneSize = {
  width: window.innerWidth,
  height: window.innerHeight
}

let scene = new THREE.Scene({
  canvas: document.querySelector('canvas')
})

// 相机
let camera = new THREE.PerspectiveCamera(75, sceneSize.width / sceneSize.height, 0.5, 1000)
camera.position.y = 6
camera.position.z = 6

// 创建标准材质 （标准材质会受到光照影响，且有金属度和粗糙度属性）
const material = new THREE.MeshStandardMaterial();

// 创建物体
const box = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material);
box.position.x = -3
box.position.y = 3
gsap.to(box.rotation, { y: Math.PI * 2, duration: 20, repeat: -1, ease: 'none', x: Math.PI * 2, delay: 1 })
const sphere = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 16), material);
sphere.position.y = 3
gsap.to(sphere.rotation, { y: Math.PI * 2, duration: 20, repeat: -1, ease: 'none', x: Math.PI * 2, delay: 1 })
const torus = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.3, 16, 20), material);
torus.position.x = 3
torus.position.y = 3
gsap.to(torus.rotation, { y: Math.PI * 2, duration: 20, repeat: -1, ease: 'none', x: Math.PI * 2, delay: 1 })


const plane = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), new THREE.MeshStandardMaterial());
plane.rotation.x = -Math.PI / 2

scene.add(box)
scene.add(sphere)
scene.add(torus)
scene.add(plane)
scene.add(camera)

let gui = new GUI({
  title: '控制台',
  width: 300,
  closeFolders: true,
})
/**
 * 光源
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5) // 环境光
scene.add(ambientLight)
let ambientGui = gui.addFolder('环境光')
ambientGui.add(ambientLight, 'intensity').min(0).max(1).step(0.01)
ambientGui.addColor(ambientLight, 'color')

// 平行光
const directionalLight = new THREE.DirectionalLight(0xff0000, 3)
directionalLight.position.set(0, 5, 0)
scene.add(directionalLight)
let directionalGui = gui.addFolder('平行光')
directionalGui.add(directionalLight, 'intensity').min(0).max(1).step(0.01)
directionalGui.add(directionalLight.position, 'x').min(-10).max(10).step(0.01)
directionalGui.add(directionalLight.position, 'y').min(-10).max(10).step(0.01)
directionalGui.add(directionalLight.position, 'z').min(-10).max(10).step(0.01)
directionalGui.addColor(directionalLight, 'color')
let directionalHelper = new THREE.DirectionalLightHelper(directionalLight, 1)
scene.add(directionalHelper)

// 半球光源
const hemisphereLight = new THREE.HemisphereLight(0xff0000, 0x0000ff, 2)
hemisphereLight.position.set(-3, 1, 0)
scene.add(hemisphereLight)
let hemisphereGui = gui.addFolder('半球光')
hemisphereGui.add(hemisphereLight, 'intensity').min(0).max(10).step(0.01)
hemisphereGui.add(hemisphereLight.position, 'x').min(-10).max(10).step(0.01)
hemisphereGui.add(hemisphereLight.position, 'y').min(-10).max(10).step(0.01)
hemisphereGui.add(hemisphereLight.position, 'z').min(-10).max(10).step(0.01)
hemisphereGui.addColor(hemisphereLight, 'color').name('上半球颜色')
hemisphereGui.addColor(hemisphereLight, 'groundColor').name('下半球颜色')
let hemisphereHelper = new THREE.HemisphereLightHelper(hemisphereLight, 1)
scene.add(hemisphereHelper)

// 点光源
const pointLight = new THREE.PointLight(0x00ff00, 10)
pointLight.position.set(1, 2, 4)
scene.add(pointLight)
let pointGui = gui.addFolder('点光源')
pointGui.add(pointLight, 'intensity').min(0).max(10).step(0.01)
pointGui.add(pointLight.position, 'x').min(-10).max(10).step(0.01)
pointGui.add(pointLight.position, 'y').min(-10).max(10).step(0.01)
pointGui.add(pointLight.position, 'z').min(-10).max(10).step(0.01)
pointGui.addColor(pointLight, 'color')
let pointHelper = new THREE.PointLightHelper(pointLight, 1)
scene.add(pointHelper)

// 矩形光源
const rectAreaLight = new THREE.RectAreaLight(0xffffbb, 2, 5, 3);
rectAreaLight.intensity = 4
rectAreaLight.position.set(0, 3, 0)
scene.add(rectAreaLight);
let rectAreaGui = gui.addFolder('面光源')
rectAreaGui.add(rectAreaLight, 'intensity').min(0).max(10).step(0.01)
rectAreaGui.add(rectAreaLight.position, 'x').min(-10).max(10).step(0.01)
rectAreaGui.add(rectAreaLight.position, 'y').min(-10).max(10).step(0.01)
rectAreaGui.add(rectAreaLight.position, 'z').min(-10).max(10).step(0.01)
rectAreaGui.addColor(rectAreaLight, 'color')
const rectAreaLightHelper = new RectAreaLightHelper(rectAreaLight)
scene.add(rectAreaLightHelper)

// 聚光灯
const spotLight = new THREE.SpotLight(0x00ffff, 8, 6, Math.PI / 10, 0.25)
spotLight.position.set(5, 5, 0)
scene.add(spotLight)
let spotGui = gui.addFolder('聚光灯')
spotGui.add(spotLight, 'intensity').min(0).max(10).step(0.01)
spotGui.add(spotLight.position, 'x').min(-10).max(10).step(0.01)
spotGui.add(spotLight.position, 'y').min(-10).max(10).step(0.01)
spotGui.add(spotLight.position, 'z').min(-10).max(10).step(0.01)
spotGui.addColor(spotLight, 'color')
spotGui.onChange(() => {
  spotHelper.update() // 更新辅助器(聚光灯需要更新辅助器才能看到变化)
})
let spotHelper = new THREE.SpotLightHelper(spotLight)
scene.add(spotHelper)
console.log('torus.position', torus.position)

// 添加坐标轴辅助器
let axesHelper = new THREE.AxesHelper(5)
scene.add(axesHelper)

// 创建渲染器
let render = new THREE.WebGLRenderer({
  canvas: document.querySelector('canvas')
})
render.setSize(sceneSize.width, sceneSize.height)

// Controls 控制器
let controls = new OrbitControls(camera, document.querySelector('canvas'), scene)

let nick = () => {
  requestAnimationFrame(nick)
  controls.update();
  render.render(scene, camera)
}
nick()