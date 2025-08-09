/**
 * Configuration for Notif wrapper component
 */

import type { NotifWrapperProps, NotifOptions } from './Notif.types'

/**
 * Default props for Notif wrapper component
 */
export const defaultNotifProps: Partial<NotifWrapperProps> = {
  position: 'bottom-right',
  autoZIndex: true,
  baseZIndex: 1000,
  breakpoint: '960px'
}

/**
 * Default notification options
 */
export const defaultNotifOptions: Partial<NotifOptions> = {
  type: 'info',
  duration: 3000,
  position: 'bottom-right',
  closable: true
}

/**
 * Severity mappings for PrimeVue Toast
 */
export const severityMap = {
  success: 'success',
  error: 'error',
  info: 'info',
  warn: 'warn'
} as const

/**
 * Position mappings for PrimeVue Toast
 */
export const positionMap = {
  'top-left': 'top-left',
  'top-center': 'top-center',
  'top-right': 'top-right',
  'bottom-left': 'bottom-left',
  'bottom-center': 'bottom-center',
  'bottom-right': 'bottom-right'
} as const

/**
 * Duration mappings (PrimeVue uses 'life' prop)
 */
export const durationMap = {
  short: 2000,
  medium: 3000,
  long: 5000,
  persistent: 0
} as const

/**
 * Legacy type mappings for backward compatibility
 */
export const legacyTypeMap = {
  success: 'success',
  error: 'error',
  info: 'info'
} as const