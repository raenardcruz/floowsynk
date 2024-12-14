import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { appStore } from '../App'

const { session } = appStore()

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('../views/Home.vue'),
    beforeEnter: (_, __, next) => {
      if (!session.value) {
        next({ path: '/login' })
      } else {
        next()
      }
    },
  },
  {
    path: '/login',
    component: () => import('../views/Login.vue'),
    beforeEnter: (_, __, next) => {
      if (session.value) {
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