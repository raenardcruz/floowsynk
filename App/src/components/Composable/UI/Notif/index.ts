/**
 * Notif Component - PrimeVue Toast Wrapper
 * 
 * The Notif component has been migrated to use PrimeVue Toast as the underlying
 * implementation with enhanced notification management and positioning system.
 * 
 * Uses PrimeVue Toast with enhanced notification management.
 * 
 * Features:
 * - Enhanced notification management and queuing
 * - Multiple notification types and severities
 * - Flexible positioning system
 * - Auto-dismiss with customizable durations
 * - Integration with PrimeVue theme system
 * - Full TypeScript support
 * - Maintains existing notification patterns
 */

// Component export
export { default } from './Notif.vue'

// TypeScript type exports
export type { 
  NotifWrapperProps, 
  NotifWrapperComponent,
  NotifOptions,
  NotifSeverity,
  NotifPosition,
  LegacyNotifOptions
} from './Notif.types'

// Configuration exports
export { 
  defaultNotifProps, 
  defaultNotifOptions,
  severityMap, 
  positionMap,
  durationMap,
  legacyTypeMap
} from './Notif.config'

// Hook exports
export {
  useNotif,
  useLegacyNotif,
  clearAllNotifs,
  notificationService,
  useNotificationState
} from './Notif.hooks'

// Constant exports
export {
  STATUS_SUCCESS,
  STATUS_ERROR,
  STATUS_INFO
} from './Notif.types'

// Re-export types for backward compatibility
export type {
  NotifWrapperProps as NotifProps,
  NotifOptions as NotificationOptions,
  NotifSeverity as NotificationSeverity,
  NotifPosition as NotificationPosition
} from './Notif.types'