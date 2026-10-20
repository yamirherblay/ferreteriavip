import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', name: 'home', component: () => import('pages/IndexPage.vue') },
      { path: 'catalogo', name: 'catalogo', component: () => import('pages/CatalogPage.vue') },
      { path: 'contacto', name: 'contacto', component: () => import('pages/ContactPage.vue') },
      { path: 'acerca', name: 'acerca', component: () => import('pages/AboutPage.vue') },
    ],
  },
  {
    path: '/login',
    component: () => import('layouts/AuthLayout.vue'),
    children: [
      {
        path: '',
        name: 'login',
        component: () => import('pages/LoginPage.vue'),
      },
    ],
  },
  {
    path: '/adminstore',
    component: () => import('layouts/AdminLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', name: 'admin', component: () => import('pages/AdminPage.vue') },
      { path: 'pedidos', name: 'admin-pedidos', component: () => import('pages/AdminOrdersPage.vue') },
    ],
  },
  // Catch-all route goes to the same blank page for now
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
