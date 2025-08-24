import { ref, readonly, nextTick } from 'vue'
import { useMagicKeys, whenever, onClickOutside, useScrollLock } from '@vueuse/core'

/**
 * Modal management composable with VueUse integration
 * Provides modal state management, keyboard navigation, and accessibility features
 */
export function useModal(options: {
  closeOnEscape?: boolean
  closeOnOutsideClick?: boolean
  lockScroll?: boolean
  trapFocus?: boolean
} = {}) {
  const {
    closeOnEscape = true,
    closeOnOutsideClick = true,
    lockScroll = true,
    trapFocus = true
  } = options
  
  // Modal state
  const isOpen = ref(false)
  const isOpening = ref(false)
  const isClosing = ref(false)
  
  // Modal element reference
  const modalRef = ref<HTMLElement>()
  const backdropRef = ref<HTMLElement>()
  
  // Focus management (simplified without useFocusTrap)
  const activateFocusTrap = () => {
    // Simple focus management - focus first focusable element
    if (modalRef.value) {
      const focusable = modalRef.value.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
      if (focusable) {
        (focusable as HTMLElement).focus()
      }
    }
  }
  
  const deactivateFocusTrap = () => {
    // Return focus to previously focused element if needed
    if (document.activeElement && modalRef.value?.contains(document.activeElement)) {
      (document.activeElement as HTMLElement).blur()
    }
  }
  
  // Scroll lock
  const isLocked = useScrollLock(document.body)
  
  // Keyboard handling
  const { escape } = useMagicKeys()
  
  /**
   * Open the modal
   */
  const open = async () => {
    if (isOpen.value || isOpening.value) return
    
    isOpening.value = true
    
    try {
      isOpen.value = true
      
      // Lock scroll if enabled
      if (lockScroll) {
        isLocked.value = true
      }
      
      // Wait for DOM update
      await nextTick()
      
      // Activate focus trap if enabled
      if (trapFocus && modalRef.value) {
        activateFocusTrap()
      }
      
      // Add modal to body class for styling
      document.body.classList.add('modal-open')
      
    } finally {
      isOpening.value = false
    }
  }
  
  /**
   * Close the modal
   */
  const close = async () => {
    if (!isOpen.value || isClosing.value) return
    
    isClosing.value = true
    
    try {
      // Deactivate focus trap
      if (trapFocus) {
        deactivateFocusTrap()
      }
      
      // Unlock scroll
      if (lockScroll) {
        isLocked.value = false
      }
      
      // Remove modal class from body
      document.body.classList.remove('modal-open')
      
      isOpen.value = false
      
    } finally {
      isClosing.value = false
    }
  }
  
  /**
   * Toggle modal state
   */
  const toggle = () => {
    if (isOpen.value) {
      close()
    } else {
      open()
    }
  }
  
  // Close on escape key
  if (closeOnEscape) {
    whenever(escape, () => {
      if (isOpen.value) {
        close()
      }
    })
  }
  
  // Close on outside click
  if (closeOnOutsideClick) {
    onClickOutside(modalRef, (event) => {
      // Don't close if clicking on backdrop (let backdrop handle it)
      if (event.target === backdropRef.value) {
        return
      }
      
      if (isOpen.value) {
        close()
      }
    })
  }
  
  /**
   * Handle backdrop click
   */
  const handleBackdropClick = (event: MouseEvent) => {
    if (closeOnOutsideClick && event.target === backdropRef.value) {
      close()
    }
  }
  
  return {
    // State
    isOpen: readonly(isOpen),
    isOpening: readonly(isOpening),
    isClosing: readonly(isClosing),
    
    // Refs
    modalRef,
    backdropRef,
    
    // Methods
    open,
    close,
    toggle,
    handleBackdropClick
  }
}

/**
 * Modal stack management for handling multiple modals
 */
export function useModalStack() {
  const stack = ref<string[]>([])
  
  const push = (id: string) => {
    if (!stack.value.includes(id)) {
      stack.value.push(id)
    }
  }
  
  const pop = (id?: string) => {
    if (id) {
      const index = stack.value.indexOf(id)
      if (index > -1) {
        stack.value.splice(index, 1)
      }
    } else {
      stack.value.pop()
    }
  }
  
  const clear = () => {
    stack.value = []
  }
  
  const isTop = (id: string) => {
    return stack.value[stack.value.length - 1] === id
  }
  
  const getZIndex = (id: string) => {
    const index = stack.value.indexOf(id)
    return index > -1 ? 1050 + index : 1050
  }
  
  return {
    stack: readonly(stack),
    push,
    pop,
    clear,
    isTop,
    getZIndex
  }
}

// Global modal stack instance
const globalModalStack = useModalStack()

export { globalModalStack }