import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import ExamplesView from '@/views/ExamplesView.vue';
import ExampleRunnerView from '@/views/ExampleRunnerView.vue';
import ScrollLabView from '@/examples/09-scroll-animation/index.vue';

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
  },
  {
    path: '/examples',
    name: 'examples',
    component: ExamplesView,
  },
  {
    path: '/examples/:slug',
    name: 'example-runner',
    component: ExampleRunnerView,
  },
  {
    path: '/scroll-lab',
    name: 'scroll-lab',
    component: ScrollLabView,
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
