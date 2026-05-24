import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
    meta: {
      layout: 'default',
    },
  },
  {
    path: '/examples',
    name: 'examples',
    component: () => import('@/views/ExamplesView.vue'),
    meta: {
      layout: 'default',
    },
  },
  {
    path: '/examples/:slug',
    name: 'example-runner',
    component: () => import('@/views/ExampleRunnerView.vue'),
    meta: {
      layout: 'default',
    },
  },
  {
    path: '/scroll-lab',
    name: 'scroll-lab',
    component: () => import('@/examples/09-scroll-animation/index.vue'),
    meta: {
      layout: 'immersive',
    },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
];

export default createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});
