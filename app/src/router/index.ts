import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import App from '@/App'

const { session } = App.store;

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
    component: () => import('@/views/Home.vue'),
    children: [
      {
        path: "",
        component: () => import('@/views/Dashboard.vue')
      },
      {
        path: "pages",
        component: () => import('@/views/Pages.vue')
      },
      {
        path: "workflow",
        component: () => import('@/views/Workflow.vue')
      },
      {
        path: "connectors",
        component: () => import('@/views/Connectors.vue')
      },
      {
        path: "reviews",
        component: () => import('@/views/Reviews.vue')
      },
      {
        path: "accounts",
        component: () => import('@/views/Accounts.vue')
      },
      {
        path: "logs",
        component: () => import('@/views/Logs.vue')
      },
      {
        path: "settings",
        component: () => import('@/views/Settings.vue')
      },
    ],
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
    component: () => import('@/views/Login.vue'),
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