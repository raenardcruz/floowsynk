import type { BaseWrapperProps } from '../migration/types'

/**
 * Sidebar wrapper component props
 */
export interface SidebarWrapperProps extends BaseWrapperProps {
  /** Whether the sidebar is visible */
  visible: boolean
  /** Sidebar title */
  title?: string
  /** Sidebar caption/subtitle */
  caption?: string
  /** Position of the sidebar */
  position?: 'left' | 'right' | 'top' | 'bottom' | 'full'
  /** Width of the sidebar (for left/right positions) */
  width?: string
  /** Height of the sidebar (for top/bottom positions) */
  height?: string
  /** Whether the sidebar is modal (blocks interaction with background) */
  modal?: boolean
  /** Whether the sidebar can be dismissed */
  dismissable?: boolean
  /** Whether to show close button */
  showCloseButton?: boolean
  /** Whether to close on escape key */
  closeOnEscape?: boolean
  /** Whether the sidebar is blockScroll */
  blockScroll?: boolean
  /** Base z-index value */
  baseZIndex?: number
  /** Whether the sidebar is appendTo */
  appendTo?: string | HTMLElement
  /** Custom header class */
  headerClass?: string
  /** Custom content class */
  contentClass?: string
  /** Custom mask class */
  maskClass?: string
  /** Transition name for enter/leave animations */
  transitionOptions?: string
  /** Auto z-index management */
  autoZIndex?: boolean
}

/**
 * Sidebar wrapper component emits
 */
export interface SidebarWrapperEmits {
  /** Emitted when sidebar visibility changes */
  'update:visible': [visible: boolean]
  /** Emitted when sidebar is shown */
  show: []
  /** Emitted when sidebar is hidden */
  hide: []
}

/**
 * Legacy Sidebar props for backward compatibility
 */
export type SidebarProps = {
  title: string
  caption: string
  visible: boolean
}

/**
 * Base Sidebar props for backward compatibility
 */
export interface BaseSidebarProps {
  width?: string
  position?: 'left' | 'right'
  customStyle?: Record<string, any>
}

/**
 * Collapsible Sidebar props for backward compatibility
 */
export interface CollapsibleSidebarProps extends BaseSidebarProps {
  closeOnClickOutside?: boolean
  closeOnEscape?: boolean
  showToggleButton?: boolean
}