// src/router/index.ts
import { defineRouter } from '#q-app/wrappers';
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';
import routes from './routes';
import { useAuthStore } from 'src/stores/auth';
import { Notify } from 'quasar';

export default defineRouter(function () {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory;

  const router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  // Una única promesa de inicialización: si dos navegaciones coinciden al
  // arrancar, ambas esperan la misma y no se registra dos veces el listener.
  let authInitPromise: Promise<void> | null = null;

  router.beforeEach(async (to) => {
    const auth = useAuthStore();

    if (!authInitPromise) {
      authInitPromise = auth.initializeAuth().catch((e: unknown) => {
        console.error('Error inicializando auth:', e);
        authInitPromise = null;
      });
    }
    await authInitPromise;

    const needsAuth = to.matched.some((r) => r.meta && r.meta.requiresAuth);
    if (needsAuth && !auth.isAuthenticated) {
      // Notificación (asegúrate de tener el plugin Notify habilitado en Quasar)
      Notify.create({
        type: 'negative',
        message: 'No tiene permiso para entrar',
        position: 'top',
      });
      return { name: 'login', query: { redirect: to.fullPath } };
    }
  });

  return router;
});
/*
import { defineRouter } from '#q-app/wrappers';
import { createMemoryHistory, createRouter, createWebHashHistory, createWebHistory } from 'vue-router';
import routes from './routes';

export default defineRouter(function () {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory;

  // Navigation guards for auth/admin
  /!* Router.beforeEach((to) => {
    const auth = useAuthStore(store);
    if (to.meta && (to.meta as undefined).requiresAuth && !auth.isAuthenticated) {
      return { name: 'login', query: { redirect: to.fullPath } };
    }
    if (to.meta && (to.meta as undefined).requiresAdmin && !auth.isAdmin) {
      return { name: 'home' };
    }
  });*!/

  return createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });
});
*/
