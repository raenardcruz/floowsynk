import type { BaseWrapperProps } from '../types'

/**
 * Modal wrapper component props
 */
export interface ModalWrapperProps extends BaseWrapperProps {
  /** Whether the modal is visible */
  visible: boolean
  /** Modal title */
  title?: string
  /** Modal caption/subtitle */
  caption?: string
  /** Modal width */
  width?: string
  /** Modal height */
  height?: string
  /** Whether the modal is modal (blocks interaction with background) */
  modal?: boolean
  /** Whether the modal can be closed */
  closable?: boolean
  /** Whether to show the header */
  showHeader?: boolean
  /** Whether to show the footer */
  showFooter?: boolean
  /** Whether to show actions in footer */
  showActions?: boolean
  /** Header font color (legacy prop for backward compatibility) */
  fontcolor?: string
  /** Header background color (legacy prop for backward compatibility) */
  bgcolor?: string
  /** Save button click handler */
  onSave?: (event: MouseEvent) => void
  /** OK button click handler */
  onOk?: (event: MouseEvent) => void
  /** Position of the modal */
  position?: 'center' | 'top' | 'bottom' | 'left' | 'right' | 'topleft' | 'topright' | 'bottomleft' | 'bottomright'
  /** Whether the modal is draggable */
  draggable?: boolean
  /** Whether the modal is resizable */
  resizable?: boolean
  /** Whether to close on escape key */
  closeOnEscape?: boolean
  /** Whether to show maximize button */
  maximizable?: boolean
  /** Minimum width */
  minWidth?: string
  /** Minimum height */
  minHeight?: string
}

/**
 * Modal wrapper component emits
 */
export interface ModalWrapperEmits {
  /** Emitted when modal visibility changes */
  'update:visible': [visible: boolean]
  /** Emitted when modal is shown */
  show: []
  /** Emitted when modal is hidden */
  hide: []
  /** Emitted when save button is clicked */
  save: [event: MouseEvent]
  /** Emitted when ok button is clicked */
  ok: [event: MouseEvent]
  /** Emitted when modal is maximized */
  maximize: []
  /** Emitted when modal is unmaximized */
  unmaximize: []
  /** Emitted when modal is dragged */
  dragend: [event: DragEvent]
}

/**
 * Legacy Modal props for backward compatibility
 */
export type ModalProps = {
  title: string
  caption: string
  fontcolor?: string | 'var(--grey-2)'
  bgcolor?: string | 'var(--grey-3)'
  onOk?: (payload: MouseEvent) => void
  onSave?: (payload: MouseEvent) => void
}