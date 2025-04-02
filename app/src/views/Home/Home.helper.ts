import { watch } from 'vue'
import { useAppDrawerStore } from './AppDrawer'
import { useIdle, useIntervalFn } from '@vueuse/core'
import { INACTIVITY_TIMEOUT } from './Home.constants'
import { extendSession } from '@/views/Login/Login.helpers'

const { appDrawer } = useAppDrawerStore()

export const pageInit = () => {
    const isIdle = useIdle(INACTIVITY_TIMEOUT)
    const { pause, resume } = useIntervalFn(() => {
        if (!isIdle.idle.value) {
            extendSession()
        }
    }, INACTIVITY_TIMEOUT, { immediate: true })
    watch(isIdle.idle, (newValue) => {
        if (newValue) {
            pause()
            logout()
        } else {
            resume()
        }
    })
}

export const openAppDrawer = () => {
    appDrawer.value = true
}

export const logout = () => {
    localStorage.clear()
    window.location.href = "/login"
}