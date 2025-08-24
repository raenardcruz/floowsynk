/**
 * Configuration for Loading wrapper component
 */

import type { LoadingWrapperProps } from './Loading.types'

/**
 * Default props for Loading wrapper component
 */
export const defaultLoadingProps: Partial<LoadingWrapperProps> = {
  text: 'Please wait',
  size: 'medium',
  color: 'primary',
  showText: true,
  showHeading: true,
  strokeWidth: '2',
  animationDuration: '2s',
  dataTestid: undefined
}

/**
 * Size mappings for PrimeVue ProgressSpinner
 */
export const sizeMap = {
  small: '2rem',
  medium: '3rem',
  large: '4rem'
} as const

/**
 * Color mappings for PrimeVue ProgressSpinner
 */
export const colorMap = {
  primary: 'var(--p-primary-color)',
  secondary: 'var(--p-surface-400)',
  success: 'var(--p-green-500)',
  info: 'var(--p-blue-500)',
  warning: 'var(--p-yellow-500)',
  danger: 'var(--p-red-500)'
} as const

/**
 * Prop mappings from wrapper props to PrimeVue props
 */
export const propMappings = {
  strokeWidth: 'strokeWidth',
  animationDuration: 'animationDuration'
} as const