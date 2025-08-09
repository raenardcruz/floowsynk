/**
 * Notif component exports
 */

export { default } from './Notif.vue'
export type { 
  NotifWrapperProps, 
  NotifWrapperComponent,
  NotifOptions,
  NotifSeverity,
  NotifPosition,
  LegacyNotifOptions
} from './Notif.types'
export { 
  defaultNotifProps, 
  defaultNotifOptions,
  severityMap, 
  positionMap,
  durationMap,
  legacyTypeMap
} from './Notif.config'
export {
  useNotif,
  useLegacyNotif,
  clearAllNotifs,
  notificationService,
  useNotificationState
} from './Notif.hooks'
export {
  STATUS_SUCCESS,
  STATUS_ERROR,
  STATUS_INFO
} from './Notif.types'