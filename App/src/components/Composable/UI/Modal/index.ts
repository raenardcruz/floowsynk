import Modal from './Modal.vue'
import type { ModalWrapperProps, ModalWrapperEmits, ModalProps } from './Modal.types'
import { useModalHooks, useModalHooksLegacy } from './Modal.hooks'

// Export the component as default
export default Modal

// Export types and hooks
export type { ModalWrapperProps, ModalWrapperEmits, ModalProps }
export { useModalHooks, useModalHooksLegacy }

// Named export for explicit imports
export { Modal }