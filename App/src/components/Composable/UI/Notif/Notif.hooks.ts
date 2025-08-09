/**
 * Notification hooks for PrimeVue Toast wrapper
 */

import { createApp, ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import type { NotifOptions, LegacyNotifOptions, NotifWrapperComponent } from './Notif.types'
import { defaultNotifOptions, severityMap, legacyTypeMap } from './Notif.config'
import NotifWrapper from './Notif.vue'

// Global toast instance for the new API
let globalToastInstance: any = null

/**
 * Initialize global toast instance
 */
const initializeGlobalToast = () => {
  if (!globalToastInstance) {
    // Create a global toast instance that can be used throughout the app
    const toastContainer = document.createElement('div')
    toastContainer.id = 'global-toast-container'
    document.body.appendChild(toastContainer)
    
    const app = createApp(NotifWrapper, {
      position: 'bottom-right',
      autoZIndex: true,
      baseZIndex: 1000
    })
    
    globalToastInstance = app.mount(toastContainer)
  }
  return globalToastInstance
}

/**
 * Modern useNotif hook that returns a toast instance
 */
export function useNotif() {
  const toast = useToast()
  
  const add = (options: NotifOptions) => {
    const mergedOptions = { ...defaultNotifOptions, ...options }
    
    const toastMessage = {
      severity: severityMap[mergedOptions.type || 'info'],
      summary: mergedOptions.message,
      detail: '',
      life: mergedOptions.duration || 3000,
      closable: mergedOptions.closable !== false,
      styleClass: mergedOptions.styleClass,
      contentStyleClass: mergedOptions.contentStyleClass
    }
    
    toast.add(toastMessage)
  }
  
  const remove = (message: any) => {
    toast.remove(message)
  }
  
  const removeAll = () => {
    toast.removeAllGroups()
  }
  
  const success = (message: string, options?: Partial<NotifOptions>) => {
    add({ ...options, message, type: 'success' })
  }
  
  const error = (message: string, options?: Partial<NotifOptions>) => {
    add({ ...options, message, type: 'error' })
  }
  
  const info = (message: string, options?: Partial<NotifOptions>) => {
    add({ ...options, message, type: 'info' })
  }
  
  const warn = (message: string, options?: Partial<NotifOptions>) => {
    add({ ...options, message, type: 'warn' })
  }
  
  return {
    add,
    remove,
    removeAll,
    success,
    error,
    info,
    warn
  }
}

/**
 * Legacy useNotif function for backward compatibility
 * This maintains the old API while using the new PrimeVue Toast system
 */
export function useLegacyNotif(options: LegacyNotifOptions): void {
  const toast = initializeGlobalToast()
  
  const mappedType = legacyTypeMap[options.type as keyof typeof legacyTypeMap] || 'info'
  const notifOptions: NotifOptions = {
    message: options.message,
    type: mappedType as any,
    duration: options.duration || 3000,
    position: 'bottom-right' // Default position for legacy API
  }
  
  toast.add(notifOptions)
}

/**
 * Legacy clearAllNotifs function for backward compatibility
 */
export function clearAllNotifs() {
  if (globalToastInstance) {
    globalToastInstance.removeAll()
  }
  
  // Also try to clear using the modern toast service
  const toast = useToast()
  toast.removeAllGroups()
}

/**
 * Create a notification service that can be used without Vue context
 */
export const notificationService = {
  success: (message: string, options?: Partial<NotifOptions>) => {
    const toast = initializeGlobalToast()
    toast.add({ ...options, message, type: 'success' })
  },
  
  error: (message: string, options?: Partial<NotifOptions>) => {
    const toast = initializeGlobalToast()
    toast.add({ ...options, message, type: 'error' })
  },
  
  info: (message: string, options?: Partial<NotifOptions>) => {
    const toast = initializeGlobalToast()
    toast.add({ ...options, message, type: 'info' })
  },
  
  warn: (message: string, options?: Partial<NotifOptions>) => {
    const toast = initializeGlobalToast()
    toast.add({ ...options, message, type: 'warn' })
  },
  
  clear: () => {
    clearAllNotifs()
  }
}

/**
 * Composable for managing notification state
 */
export function useNotificationState() {
  const notifications = ref<NotifOptions[]>([])
  
  const addNotification = (options: NotifOptions) => {
    notifications.value.push(options)
    
    // Auto-remove after duration
    if (options.duration && options.duration > 0) {
      setTimeout(() => {
        removeNotification(options)
      }, options.duration)
    }
  }
  
  const removeNotification = (notification: NotifOptions) => {
    const index = notifications.value.indexOf(notification)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }
  
  const clearNotifications = () => {
    notifications.value = []
  }
  
  return {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications
  }
}