export const examples = [
  {
    id: '01',
    slug: 'basic-scene',
    name: '基础场景',
    file: '@/examples/01-basic-scene/index.js',
    note: '初始化场景、相机与渲染器。',
    to: '/examples/basic-scene',
  },
  {
    id: '02',
    slug: 'orbit-controls',
    name: 'OrbitControls',
    file: '@/examples/02-orbit-controls/index.js',
    note: '相机轨道控制器交互。',
    to: '/examples/orbit-controls',
  },
  {
    id: '03',
    slug: 'fullscreen-render',
    name: '全屏渲染',
    file: '@/examples/03-fullscreen-render/index.js',
    note: '视口铺满屏幕与尺寸同步。',
    to: '/examples/fullscreen-render',
  },
  {
    id: '04',
    slug: 'geometries',
    name: '几何体',
    file: '@/examples/04-geometries/index.js',
    note: '几何体与 BufferGeometry 学习。',
    to: '/examples/geometries',
  },
  {
    id: '05',
    slug: 'materials',
    name: '材质',
    file: '@/examples/05-materials/index.js',
    note: '常见材质、贴图与环境效果。',
    to: '/examples/materials',
  },
  {
    id: '06',
    slug: 'text',
    name: '文字',
    file: '@/examples/06-text/index.js',
    note: '文本几何与 Matcap 贴图。',
    to: '/examples/text',
  },
  {
    id: '07',
    slug: 'lights-shadows',
    name: '光源和阴影',
    file: '@/examples/07-lights-shadows/index.js',
    note: '灯光系统和阴影配置。',
    to: '/examples/lights-shadows',
  },
  {
    id: '08',
    slug: 'particles',
    name: '粒子',
    file: '@/examples/08-particles/index.js',
    note: '粒子系统与随机分布。',
    to: '/examples/particles',
  },
  {
    id: '09',
    slug: 'scroll-lab',
    name: '基于页面滚动的动画',
    file: '@/examples/09-scroll-animation/index.vue',
    note: '滚动驱动的页面叙事实验。',
    to: '/scroll-lab',
  },
];

export const exampleLoaders = {
  'basic-scene': () => import('@/examples/01-basic-scene/index.js'),
  'orbit-controls': () => import('@/examples/02-orbit-controls/index.js'),
  'fullscreen-render': () => import('@/examples/03-fullscreen-render/index.js'),
  geometries: () => import('@/examples/04-geometries/index.js'),
  materials: () => import('@/examples/05-materials/index.js'),
  text: () => import('@/examples/06-text/index.js'),
  'lights-shadows': () => import('@/examples/07-lights-shadows/index.js'),
  particles: () => import('@/examples/08-particles/index.js'),
};

export function getExampleBySlug(slug) {
  return examples.find((example) => example.slug === slug) ?? null;
}
