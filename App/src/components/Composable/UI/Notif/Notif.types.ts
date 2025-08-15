/**
 * TypeScript interfaces for Notif wrapper component
 */

import type { BaseWrapperProps } from '../types'

/**
 * Notification severity types
 */
export type NotifSeverity = 'success' | 'info' | 'warn' | 'error'

/**
 * Notification position types
 */
export type NotifPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'

/**
 * Notification options for the useNotif hook
 */
export interface NotifOptions {
  /** Notification message */
  message: string
  /** Notification severity/type */
  type?: NotifSeverity
  /** Duration in milliseconds (0 for persistent) */
  duration?: number
  /** Position on screen */
  position?: NotifPosition
  /** Whether the notification can be closed manually */
  closable?: boolean
  /** Custom CSS classes */
  styleClass?: string
  /** Custom content template */
  contentStyleClass?: string
  /** Teleport target (for backward compatibility) */
  teleportTarget?: string
}

/**
 * Props for the Notif wrapper component
 */
export interface NotifWrapperProps extends BaseWrapperProps {
  /** Position of the toast container */
  position?: NotifPosition
  /** Auto z-index management */
  autoZIndex?: boolean
  /** Base z-index value */
  baseZIndex?: number
  /** Breakpoint for responsive behavior */
  breakpoint?: string
}

/**
 * Notif wrapper component interface
 */
export interface NotifWrapperComponent {
  /** Reference to the underlying PrimeVue Toast */
  primevueRef: any
  /** Add a notification */
  add: (options: NotifOptions) => void
  /** Remove a specific notification */
  remove: (message: any) => void
  /** Remove all notifications */
  removeAll: () => void
}

/**
 * Legacy NotifOptions for backward compatibility
 */
export type LegacyNotifOptions = {
  teleportTarget?: string
  message: string
  duration?: number
  type?: "success" | "error" | "info"
}

// Export legacy constants for backward compatibility
export const STATUS_SUCCESS = 'success'
export const STATUS_ERROR = 'error'
export const STATUS_INFO = 'info'