import { computed, ref, type Ref } from 'vue'
import type { ButtonWrapperProps } from './Button.types'

// Simplified hooks for PrimeVue Button wrapper
export function useButtonState(props: ButtonWrapperProps) {
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

export function useButtonInteractions(
  buttonRef: Ref<any>,
  props: ButtonWrapperProps,
  emit: (event: string, ...args: any[]) => void
) {
  const { isPressed, isFocused, isHovered, isDisabled } = useButtonState(props)
  
  // Handle click events
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

// Legacy exports for backward compatibility
export function useButtonSize(buttonRef: Ref<HTMLElement | undefined>) {
  const width = ref(0)
  const height = ref(0)
  const isCompact = computed(() => width.value < 100)
  const isWide = computed(() => width.value > 200)
  
  return {
    width,
    height,
    isCompact,
    isWide
  }
}

export function useButtonLoading(props: ButtonWrapperProps) {
  const isLoading = computed(() => props.loading)
  const loadingText = computed(() => 'Loading...')
  
  const startLoading = () => {}
  const stopLoading = () => {}
  
  return {
    isLoading,
    loadingText,
    startLoading,
    stopLoading
  }
}

export function useButtonClasses(props: ButtonWrapperProps, state: ReturnType<typeof useButtonState>) {
  const classes = computed(() => {
    const baseClasses = ['p-button-wrapper']
    
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