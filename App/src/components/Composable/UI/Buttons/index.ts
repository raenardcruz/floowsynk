/**
 * Button Components - PrimeVue Wrappers
 * 
 * These components have been migrated to use PrimeVue Button as the underlying implementation
 * with simplified wrapper APIs that maintain backward compatibility.
 * 
 * Uses PrimeVue Button with variant mapping and enhanced styling.
 * 
 * Features:
 * - Simplified API with sensible defaults
 * - Variant mapping (primary, secondary, success, info, warning, danger, text)
 * - Loading states and icon positioning
 * - Full TypeScript support
 * - Maintains existing component behavior
 */

// Component exports
export { default as Button } from './Button.vue'
export { default as PrimaryButton } from './PrimaryButton.vue'

// TypeScript type exports
export * from './Button.types'

// Utility exports
export * from './Button.hooks'
export * from './Button.config'

// Re-export types for backward compatibility
export type {
  ButtonProps,
  ButtonEmits,
  ButtonVariant,
  ButtonSize,
  ButtonIconPosition
} from './Button.types'