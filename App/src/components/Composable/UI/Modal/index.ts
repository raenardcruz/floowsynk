/**
 * Modal Component - PrimeVue Dialog Wrapper
 * 
 * The Modal component has been migrated to use PrimeVue Dialog as the underlying
 * implementation with a simplified wrapper API that maintains backward compatibility.
 * 
 * Migration Status: ✅ COMPLETED
 * - Modal: Migrated to PrimeVue Dialog wrapper with simplified API
 * 
 * Features:
 * - Simplified header, content, and footer slot management
 * - Consistent modal sizing and positioning
 * - Enhanced focus management and keyboard navigation
 * - Integration with PrimeVue theme system
 * - Full TypeScript support
 * - Maintains existing modal behavior patterns
 */

import Modal from './Modal.vue'
import type { ModalWrapperProps, ModalWrapperEmits, ModalProps } from './Modal.types'
import { useModalHooks, useModalHooksLegacy } from './Modal.hooks'

// Export the component as default
export default Modal

// TypeScript type exports
export type { ModalWrapperProps, ModalWrapperEmits, ModalProps }

// Hook exports
export { useModalHooks, useModalHooksLegacy }

// Named export for explicit imports
export { Modal }

// Re-export types for backward compatibility
export type {
  ModalWrapperProps as ModalComponentProps,
  ModalWrapperEmits as ModalComponentEmits,
  ModalProps as ModalConfiguration
} from './Modal.types'