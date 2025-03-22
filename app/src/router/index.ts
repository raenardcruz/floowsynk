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
    component: () => import('@/views/Home'),
    children: [
      {
        path: "",
        component: () => import('@/views/Dashboard')
      },
      {
        path: "pages",
        component: () => import('@/views/Pages')
      },
      {
        path: "workflow",
        component: () => import('@/views/Workflow')
      },
      {
        path: "connectors",
        component: () => import('@/views/Connectors')
      },
      {
        path: "reviews",
        component: () => import('@/views/Reviews')
      },
      {
        path: "accounts",
        component: () => import('@/views/Accounts')
      },
      {
        path: "logs",
        component: () => import('@/views/Logs')
      },
      {
        path: "settings",
        component: () => import('@/views/Settings')
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
    component: () => import('@/views/Login'),
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