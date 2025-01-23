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
    component: () => import(/* webpackChunkName: "home" */ '@/views/Home.vue'),
    children: [
      {
        path: "",
        component: () => import(/* webpackChunkName: "dashboard" */ /* webpackPrefetch: true */ '@/views/Dashboard.vue')
      },
      {
        path: "pages",
        component: () => import(/* webpackChunkName: "pages" */ /* webpackPrefetch: true */ '@/views/Pages.vue')
      },
      {
        path: "workflow",
        component: () => import(/* webpackChunkName: "workflow" */ /* webpackPrefetch: true */ '@/views/Workflow.vue')
      },
      {
        path: "connectors",
        component: () => import(/* webpackChunkName: "connectors" */ /* webpackPrefetch: true */ '@/views/Connectors.vue')
      },
      {
        path: "reviews",
        component: () => import(/* webpackChunkName: "reviews" */ /* webpackPrefetch: true */ '@/views/Reviews.vue')
      },
      {
        path: "accounts",
        component: () => import(/* webpackChunkName: "accounts" */ /* webpackPrefetch: true */ '@/views/Accounts.vue')
      },
      {
        path: "logs",
        component: () => import(/* webpackChunkName: "logs" */ /* webpackPrefetch: true */ '@/views/Logs.vue')
      },
      {
        path: "settings",
        component: () => import(/* webpackChunkName: "settings" */ /* webpackPrefetch: true */ '@/views/Settings.vue')
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
    component: () => import(/* webpackChunkName: "login" */ /* webpackPrefetch: true */ '@/views/Login.vue'),
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