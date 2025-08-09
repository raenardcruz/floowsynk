import type { ButtonWrapperProps } from './Button.types'

// Default configuration for Button wrapper
export const defaultButtonConfig: Partial<ButtonWrapperProps> = {
  variant: 'primary',
  size: 'medium',
  iconPosition: 'left',
  disabled: false,
  loading: false,
  rounded: false,
  block: false
}

// Variant mapping to PrimeVue severity
export const variantSeverityMap = {
  primary: 'primary',
  secondary: 'secondary',
  success: 'success',
  info: 'info',
  warning: 'warn',
  danger: 'danger',
  outline: 'primary', // Will use outlined prop
  ghost: 'secondary'  // Will use text prop
} as const

// Size mapping to PrimeVue sizes
export const sizeMap = {
  small: 'small',
  medium: undefined, // Default size
  large: 'large'
} as const

// Icon position mapping
export const iconPositionMap = {
  left: 'left',
  right: 'right'
} as const