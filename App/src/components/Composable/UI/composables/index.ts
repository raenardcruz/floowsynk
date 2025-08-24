// Export all composables
export * from './useTheme'
export * from './useFormValidation'
export * from './useModal'
export * from './useComponentError'

// Re-export commonly used VueUse composables for convenience
export {
  // State
  useStorage,
  useLocalStorage,
  useSessionStorage,
  useToggle,
  useCounter,
  
  // Browser
  useClipboard,
  useFullscreen,
  usePermission,
  usePreferredDark,
  usePreferredLanguages,
  
  // DOM
  useElementSize,
  useElementVisibility,
  useResizeObserver,
  useIntersectionObserver,
  useMutationObserver,
  useEventListener,
  onClickOutside,
  onKeyStroke,
  
  // Sensors
  useMouse,
  useMouseInElement,
  useScroll,
  useScrollLock,
  useSwipe,
  usePointer,
  
  // Animation
  useTransition,
  useInterval,
  useTimeout,
  useTimeoutFn,
  useRafFn,
  
  // Utilities
  useDebounceFn,
  useThrottleFn,
  useAsyncState,
  useFetch,
  watchPausable,
  watchDebounced,
  watchThrottled,
  
  // Focus
  useFocus,
  useFocusWithin,
  
  // Form
  useVModel,
  
  // Misc
  useMagicKeys,
  whenever,
  until
} from '@vueuse/core'