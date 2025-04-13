import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import App from '@/App'
import { useStorage } from '@vueuse/core'
import { SESSION_EXPIRY_KEY, SESSION_TOKEN_KEY } from '@/views/Login/Login.constants'

const { session } = App.store

export const checkSession = () => {
  const token = useStorage(SESSION_TOKEN_KEY, null, localStorage) 
  const expiry = useStorage(SESSION_EXPIRY_KEY, null, localStorage) 
  if (token.value && expiry.value) {
    const expiryDate = new Date(expiry.value)
    if (expiryDate > new Date()) {
      session.value = token.value 
      return true
    } else {
      token.value = null 
      expiry.value = null 
    }
  }
  return false
}

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
        next({ path: '/login' })
      } else {
        next()
      }
    },
  },
  {
    path: '/login',
    component: () => import('@/views/Login'),
    beforeEnter: (_, __, next) => {
      if (session.value || checkSession()) {
        next({ path: '/' })
      } else {
        next()
      }
    },
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router