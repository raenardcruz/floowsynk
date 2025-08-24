import { computed, ref, watch } from 'vue'
import type { ModalWrapperProps } from './Modal.types'

/**
 * Modal wrapper hooks for managing modal state and behavior
 */
export const useModalHooks = (props: ModalWrapperProps) => {
  // Computed properties
  const showActions = computed(() => {
    return props.showActions || props.onOk || props.onSave
  })

  const showHeader = computed(() => {
    return props.showHeader && (props.title || props.caption)
  })

  const showFooter = computed(() => {
    return props.showFooter || showActions.value
  })

  // Modal state management
  const isMaximized = ref(false)
  const isDragging = ref(false)
  const isResizing = ref(false)

  // Focus management
  const focusableElements = ref<HTMLElement[]>([])
  const currentFocusIndex = ref(0)

  /**
   * Find all focusable elements within the modal
   */
  const updateFocusableElements = (modalElement: HTMLElement) => {
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])'
    ].join(', ')

    focusableElements.value = Array.from(
      modalElement.querySelectorAll(focusableSelectors)
    ) as HTMLElement[]
  }

  /**
   * Handle keyboard navigation within modal
   */
  const handleKeyboardNavigation = (event: KeyboardEvent) => {
    if (!props.visible) return

    switch (event.key) {
      case 'Tab':
        handleTabNavigation(event)
        break
      case 'Escape':
        if (props.closeOnEscape && props.closable) {
          event.preventDefault()
          // Emit visibility change
        }
        break
    }
  }

  /**
   * Handle tab navigation to trap focus within modal
   */
  const handleTabNavigation = (event: KeyboardEvent) => {
    if (focusableElements.value.length === 0) return

    const firstElement = focusableElements.value[0]
    const lastElement = focusableElements.value[focusableElements.value.length - 1]

    if (event.shiftKey) {
      // Shift + Tab (backward)
      if (document.activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
      }
    } else {
      // Tab (forward)
      if (document.activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }
  }

  /**
   * Handle modal maximize/minimize
   */
  const toggleMaximize = () => {
    isMaximized.value = !isMaximized.value
  }

  /**
   * Handle modal drag start
   */
  const handleDragStart = () => {
    isDragging.value = true
  }

  /**
   * Handle modal drag end
   */
  const handleDragEnd = () => {
    isDragging.value = false
  }

  /**
   * Handle modal resize start
   */
  const handleResizeStart = () => {
    isResizing.value = true
  }

  /**
   * Handle modal resize end
   */
  const handleResizeEnd = () => {
    isResizing.value = false
  }

  /**
   * Calculate modal position based on position prop
   */
  const getModalPosition = () => {
    const positions = {
      center: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
      top: { top: '10%', left: '50%', transform: 'translateX(-50%)' },
      bottom: { bottom: '10%', left: '50%', transform: 'translateX(-50%)' },
      left: { top: '50%', left: '10%', transform: 'translateY(-50%)' },
      right: { top: '50%', right: '10%', transform: 'translateY(-50%)' },
      topleft: { top: '10%', left: '10%' },
      topright: { top: '10%', right: '10%' },
      bottomleft: { bottom: '10%', left: '10%' },
      bottomright: { bottom: '10%', right: '10%' }
    }

    return positions[props.position || 'center']
  }

  // Watch for visibility changes to manage focus
  watch(() => props.visible, (visible) => {
    if (visible) {
      // Focus first focusable element when modal opens
      setTimeout(() => {
        const modalElement = document.querySelector('.p-dialog') as HTMLElement
        if (modalElement) {
          updateFocusableElements(modalElement)
          if (focusableElements.value.length > 0) {
            focusableElements.value[0].focus()
          }
        }
      }, 100)
    }
  })

  return {
    showActions,
    showHeader,
    showFooter,
    isMaximized,
    isDragging,
    isResizing,
    focusableElements,
    currentFocusIndex,
    updateFocusableElements,
    handleKeyboardNavigation,
    handleTabNavigation,
    toggleMaximize,
    handleDragStart,
    handleDragEnd,
    handleResizeStart,
    handleResizeEnd,
    getModalPosition
  }
}

/**
 * Legacy modal hooks for backward compatibility
 */
export const useModalHooksLegacy = (props: any) => {
  const showActions = computed(() => props.onOk || props.onSave)
  return { showActions }
}