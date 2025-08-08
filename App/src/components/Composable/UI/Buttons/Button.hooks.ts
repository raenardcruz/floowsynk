import { computed, ref, type Ref } from 'vue'
import { useElementSize, useTimeoutFn, useEventListener } from '@vueuse/core'
import type { ButtonProps } from './Button.types'

export function useButtonState(props: ButtonProps) {
  const isPressed = ref(false)
  const isFocused = ref(false)
  const isHovered = ref(false)

  const isDisabled = computed(() => Boolean(props.disabled || props.loading))
  
  return {
    isPressed,
    isFocused,
    isHovered,
    isDisabled
  }
}

export function useButtonSize(buttonRef: Ref<HTMLElement | undefined>) {
  const { width, height } = useElementSize(buttonRef)
  
  const isCompact = computed(() => width.value < 100)
  const isWide = computed(() => width.value > 200)
  
  return {
    width,
    height,
    isCompact,
    isWide
  }
}

export function useButtonLoading(props: ButtonProps) {
  const isLoading = computed(() => props.loading)
  const loadingText = computed(() => props.loadingText || 'Loading...')
  
  // Auto-hide loading state after timeout (safety mechanism)
  const { start: startTimeout, stop: stopTimeout } = useTimeoutFn(() => {
    console.warn('Button loading state has been active for more than 30 seconds')
  }, 30000)
  
  // Start timeout when loading begins
  const startLoading = () => {
    if (isLoading.value) {
      startTimeout()
    }
  }
  
  // Stop timeout when loading ends
  const stopLoading = () => {
    stopTimeout()
  }
  
  return {
    isLoading,
    loadingText,
    startLoading,
    stopLoading
  }
}

export function useButtonInteractions(
  buttonRef: Ref<HTMLElement | undefined>,
  props: ButtonProps,
  emit: (event: string, ...args: any[]) => void
) {
  const { isPressed, isFocused, isHovered, isDisabled } = useButtonState(props)
  
  // Handle click events with debouncing
  const handleClick = (event: MouseEvent) => {
    if (isDisabled.value) {
      event.preventDefault()
      event.stopPropagation()
      return
    }
    
    emit('click', event)
  }
  
  // Handle focus events
  const handleFocus = (event: FocusEvent) => {
    isFocused.value = true
    emit('focus', event)
  }
  
  // Handle blur events
  const handleBlur = (event: FocusEvent) => {
    isFocused.value = false
    emit('blur', event)
  }
  
  // Handle mouse events
  const handleMouseDown = () => {
    if (!isDisabled.value) {
      isPressed.value = true
    }
  }
  
  const handleMouseUp = () => {
    isPressed.value = false
  }
  
  const handleMouseEnter = () => {
    if (!isDisabled.value) {
      isHovered.value = true
    }
  }
  
  const handleMouseLeave = () => {
    isHovered.value = false
    isPressed.value = false
  }
  
  // Handle keyboard events
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === ' ' || event.key === 'Enter') {
      if (!isDisabled.value) {
        isPressed.value = true
        event.preventDefault()
      }
    }
  }
  
  const handleKeyUp = (event: KeyboardEvent) => {
    if (event.key === ' ' || event.key === 'Enter') {
      isPressed.value = false
      if (!isDisabled.value) {
        handleClick(event as any)
      }
    }
  }
  
  // Set up event listeners when button ref is available
  useEventListener(buttonRef, 'mousedown', handleMouseDown)
  useEventListener(buttonRef, 'mouseup', handleMouseUp)
  useEventListener(buttonRef, 'mouseenter', handleMouseEnter)
  useEventListener(buttonRef, 'mouseleave', handleMouseLeave)
  useEventListener(buttonRef, 'keydown', handleKeyDown)
  useEventListener(buttonRef, 'keyup', handleKeyUp)
  
  return {
    isPressed,
    isFocused,
    isHovered,
    isDisabled,
    handleClick,
    handleFocus,
    handleBlur
  }
}

export function useButtonClasses(props: ButtonProps, state: ReturnType<typeof useButtonState>) {
  const classes = computed(() => {
    const baseClasses = ['btn']
    
    // Size classes
    if (props.size) {
      baseClasses.push(`btn-${props.size}`)
    } else {
      baseClasses.push('btn-medium') // default size
    }
    
    // Variant classes
    if (props.variant) {
      baseClasses.push(`btn-${props.variant}`)
    } else {
      baseClasses.push('btn-primary') // default variant
    }
    
    // State classes
    if (state.isDisabled.value) {
      baseClasses.push('btn-disabled')
    }
    
    if (props.loading) {
      baseClasses.push('btn-loading')
    }
    
    if (state.isPressed.value) {
      baseClasses.push('btn-pressed')
    }
    
    if (state.isFocused.value) {
      baseClasses.push('btn-focused')
    }
    
    if (state.isHovered.value) {
      baseClasses.push('btn-hovered')
    }
    
    // Layout classes
    if (props.block) {
      baseClasses.push('btn-block')
    }
    
    if (props.rounded) {
      baseClasses.push('btn-rounded')
    }
    
    // Icon position classes
    if (props.icon && props.iconPosition) {
      baseClasses.push(`btn-icon-${props.iconPosition}`)
    } else if (props.icon) {
      baseClasses.push('btn-icon-left') // default position
    }
    
    // Custom classes
    if (props.class) {
      if (typeof props.class === 'string') {
        baseClasses.push(props.class)
      } else if (Array.isArray(props.class)) {
        baseClasses.push(...props.class)
      } else {
        Object.entries(props.class).forEach(([className, condition]) => {
          if (condition) {
            baseClasses.push(className)
          }
        })
      }
    }
    
    return baseClasses
  })
  
  return {
    classes
  }
}