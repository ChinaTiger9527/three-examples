import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
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

let gui = new GUI({
  width: 400,
  title: '控制台'
})

let textureLoader = new THREE.TextureLoader()
let texture = textureLoader.load('/src/static/image/textures/stained_pine_diff_1k.jpg')
let alphaTexture = textureLoader.load('/src/static/image/textures/stained_pine_alpha_1k.jpg')
let roughnessTexture = textureLoader.load('/src/static/image/textures/stained_pine_rough_1k.jpg')
let normalTexture = textureLoader.load('/src/static/image/textures/stained_pine_nor_gl_1k.exr')
let ambientLight = new THREE.AmbientLight(0xffffff, 1) // 环境光
let light = new THREE.PointLight(0xffffff, 50)
gui.add(light, 'intensity').min(0).max(100).step(0.01)
light.position.set(2, 3, 4)
gui.addColor(debugObject, 'color').onChange(() => {
  material.color.set(debugObject.color)
})

// let material = new THREE.MeshBasicMaterial()
// material.transparent = true // 开启材质透明
// material.opacity = 0.5 // 设置材质透明度
// material.color = new THREE.Color('red') // 设置材质颜色
// material.map = texture // 设置材质纹理
// material.alphaMap = texture // 设置材质透明纹理
// material.side = THREE.DoubleSide // 2  设置材质正反面
// material.wireframe = false // 设置材质为线框模式
// console.log('THREE.DoubleSide', THREE.DoubleSide)

// const material = new THREE.MeshNormalMaterial()
// material.flatshading = true // 设置材质为平面着色
// material.matcap = texture // 设置材质 matcap 纹理

// let material = new THREE.MeshDepthMaterial() // 深度材质

// let material = new THREE.MeshLambertMaterial() // 漫反射材质

// let material = new THREE.MeshPhongMaterial() // 漫反射材质(高性能 支持光反射)
// material.shininess = 100 // 设置材质高光强度
// material.specular = new THREE.Color('red') // 设置材质高光颜色

// let material = new THREE.MeshToonMaterial() // 卡通反射
// material.map = texture
// texture.minFilter = THREE.NearestFilter // 设置纹理缩小过滤器为最近点过滤器，保持像素风格
// texture.magFilter = THREE.NearestFilter // 设置纹理放大过滤器为最近点过滤器，保持像素风格
// material.gradientMap = texture // 设置材质渐变纹理

// let material = new THREE.MeshStandardMaterial() // 标准材质
// material.metalness = 0.5 // 设置材质金属度
// material.roughness = 0.5 // 设置材质粗糙度
// material.color = new THREE.Color('white')
// gui.add(material, 'metalness').min(0).max(1).step(0.01)
// gui.add(material, 'roughness').min(0).max(1).step(0.01)
// material.map = texture // 设置材质纹理
// material.aoMap = alphaTexture // 设置材质环境光遮蔽纹理
// material.aoMapIntensity = 10 // 设置材质环境光遮蔽强度
// gui.add(material, 'aoMapIntensity').min(0).max(10).step(0.01)
// material.displacementMap = roughnessTexture // 设置材质位移纹理
// material.displacementScale = 0.1 // 设置材质位移纹理强度
// gui.add(material, 'displacementScale').min(0).max(10).step(0.01)
// material.metalnessMap = normalTexture // 设置材质金属度纹理
// material.roughnessMap = normalTexture // 设置材质粗糙度纹理
// material.normalMap = normalTexture // 设置材质法线纹理
// material.normalScale.set(0.5, 0.5) // 设置材质法线纹理强度
// gui.add(material.normalScale, 'x').min(0).max(1).step(0.01).name('normalScaleX')
// gui.add(material.normalScale, 'y').min(0).max(1).step(0.01).name('normalScaleY')
// material.transparent = true // 开启材质透明
// material.opacity = 0.5 // 设置材质透明度
// material.alphaMap = alphaTexture // 设置材质透明纹理

let material = new THREE.MeshPhysicalMaterial() // 物理材质
material.metalness = 0.5 // 设置材质金属度
material.roughness = 0.5 // 设置材质粗糙度
material.color = new THREE.Color('white')
gui.add(material, 'metalness').min(0).max(1).step(0.01)
gui.add(material, 'roughness').min(0).max(1).step(0.01)
// material.map = texture // 设置材质纹理
// material.clearcoat = 1 // 设置材质清漆层
// material.clearcoatRoughness = 0.5 // 设置材质清漆层粗糙度
// gui.add(material, 'clearcoat').min(0).max(1).step(0.01)
// gui.add(material, 'clearcoatRoughness').min(0).max(1).step(0.01)
// material.sheen = 1 // 物理材质特有属性 sheen 光泽 （适用于织物材质）
// material.sheenRoughness = 0.5 // 物理材质特有属性 sheenRoughness 光泽粗糙度 （适用于织物材质）
// material.sheenColor = new THREE.Color('red') // 物理材质特有属性 sheenColor 光泽颜色 （适用于织物材质）
// gui.add(material, 'sheen').min(0).max(1).step(0.01)
// gui.add(material, 'sheenRoughness').min(0).max(1).step(0.01)
// gui.addColor(material, 'sheenColor')
// material.iridescence = 1 // 物理材质特有属性 iridescence 彩虹效果
// material.iridescenceIOR = 1.5 // 物理材质特有属性 iridescenceIOR 彩虹效果折射率
// material.iridescenceThicknessRange = [100, 800] // 物理材质特有属性 iridescenceThicknessRange 彩虹效果厚度范围
// gui.add(material, 'iridescence').min(0).max(1).step(0.01)
// gui.add(material, 'iridescenceIOR').min(0).max(2).step(0.01)
// gui.add(material.iridescenceThicknessRange, '0').min(0).max(1000).step(1).name('iridescenceThicknessRangeMin')
// gui.add(material.iridescenceThicknessRange, '1').min(0).max(1000).step(1).name('iridescenceThicknessRangeMax')
material.transmission = 1 // 物理材质特有属性 transmission 透射率 （适用于玻璃材质）
material.ior = 1.5 // 物理材质特有属性 ior 折射率 （适用于玻璃材质）
material.thickness = 0.1 // 物理材质特有属性 thickness 厚度 （适用于玻璃材质）
gui.add(material, 'transmission').min(0).max(1).step(0.01)
gui.add(material, 'ior').min(0).max(2).step(0.01)
gui.add(material, 'thickness').min(0).max(1).step(0.01)





// EnvironmentMap 环境纹理
const rgbeloader = new RGBELoader()
rgbeloader.setPath('/src/static/image/');
rgbeloader.load('glasshouse_interior_4k.hdr', (texture) => {
  console.log('texture', texture)
  texture.mapping = THREE.EquirectangularReflectionMapping // 设置环境纹理映射方式
  scene.environment = texture
  scene.background = texture
})


let box = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material)
let plane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, debugObject.subdivisions, debugObject.subdivisions), material)
plane.position.x = 2
let sphere = new THREE.Mesh(new THREE.SphereGeometry(0.5), material)
sphere.position.x = 4
let torus = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.2, 16, 100), material)
torus.position.x = 6

gsap.to(box.rotation, { y: Math.PI * 2, duration: 20, repeat: -1, ease: 'none', x: Math.PI * 2, delay: 1 })
gsap.to(plane.rotation, { y: Math.PI * 2, duration: 20, repeat: -1, ease: 'none', x: Math.PI * 2, delay: 1 })
gsap.to(sphere.rotation, { y: Math.PI * 2, duration: 20, repeat: -1, ease: 'none', x: Math.PI * 2, delay: 1 })
gsap.to(torus.rotation, { y: Math.PI * 2, duration: 20, repeat: -1, ease: 'none', x: Math.PI * 2, delay: 1 })

let camera = new THREE.PerspectiveCamera(75, sceneSize.width / sceneSize.height, 0.1, 1000)
camera.position.z = 5

// AxesHelper 坐标尺
let axesHelper = new THREE.AxesHelper(100)

// Scene 画布
let scene = new THREE.Scene({
  canvas: document.querySelector('canvas')
})
scene.add(box)
scene.add(plane)
scene.add(sphere)
scene.add(torus)
scene.add(axesHelper)
scene.add(ambientLight)
scene.add(light)
// Controls 控制器
let controls = new OrbitControls(camera, document.querySelector('canvas'), scene)
controls.enableDamping = true

// Render 渲染器
let render = new THREE.WebGLRenderer({
  canvas: document.querySelector('canvas')
})
render.setSize(sceneSize.width, sceneSize.height)



let nick = () => {
  requestAnimationFrame(nick)
  controls.update()
  render.render(scene, camera)
}
nick()