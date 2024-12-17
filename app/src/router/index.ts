import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { appStore } from '../App'

const { session } = appStore()

const checkSession = () => {
  const token = localStorage.getItem('sessionToken');
  const expiry = localStorage.getItem('sessionExpiry');
  if (token && expiry) {
    const expiryDate = new Date(expiry);
    if (expiryDate > new Date()) {
      session.value = token;
      return true;
    } else {
      localStorage.removeItem('sessionToken');
      localStorage.removeItem('sessionExpiry');
    }
  }
  return false;
};

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('../views/Home.vue'),
    beforeEnter: (_, __, next) => {
      if (!session.value && !checkSession()) {
        next({ path: '/login' });
      } else {
        next();
      }
    },
  },
  {
    path: '/login',
    component: () => import('../views/Login.vue'),
    beforeEnter: (_, __, next) => {
      if (session.value || checkSession()) {
        next({ path: '/' });
      } else {
        next();
      }
    },
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router