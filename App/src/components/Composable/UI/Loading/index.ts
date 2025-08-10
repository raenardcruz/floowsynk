/**
 * Loading Component - PrimeVue ProgressSpinner Wrapper
 * 
 * The Loading component has been migrated to use PrimeVue ProgressSpinner as the
 * underlying implementation with a simplified wrapper API that maintains backward compatibility.
 * 
 * Migration Status: ✅ COMPLETED
 * - Loading: Migrated to PrimeVue ProgressSpinner wrapper
 * 
 * Features:
 * - Multiple spinner types and animations
 * - Customizable sizes and colors
 * - Integration with PrimeVue theme system
 * - Loading states for different contexts
 * - Full TypeScript support
 * - Maintains existing loading behavior patterns
 */

// Component export
export { default } from './Loading.vue'

// TypeScript type exports
export type { 
  LoadingWrapperProps, 
  LoadingWrapperComponent,
  LoadingSize,
  LoadingColor
} from './Loading.types'

// Configuration exports
export { 
  defaultLoadingProps, 
  sizeMap, 
  colorMap, 
  propMappings 
} from './Loading.config'

// Re-export types for backward compatibility
export type {
  LoadingWrapperProps as LoadingProps,
  LoadingSize as LoadingComponentSize,
  LoadingColor as LoadingComponentColor
} from './Loading.types'