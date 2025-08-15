/**
 * TypeScript interfaces for Loading wrapper component
 */

import type { BaseWrapperProps } from '../types'

/**
 * Loading component size options
 */
export type LoadingSize = 'small' | 'medium' | 'large'

/**
 * Loading component color variants
 */
export type LoadingColor = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'danger'

/**
 * Props for the Loading wrapper component
 */
export interface LoadingWrapperProps extends BaseWrapperProps {
  /** Loading text to display */
  text?: string
  /** Size of the loading spinner */
  size?: LoadingSize
  /** Color variant of the spinner */
  color?: LoadingColor
  /** Whether to show the loading text */
  showText?: boolean
  /** Whether to show the "Loading" heading */
  showHeading?: boolean
  /** Custom stroke width for the spinner */
  strokeWidth?: string
  /** Animation duration in seconds */
  animationDuration?: string
  /** Data test identifier for testing */
  dataTestid?: string
}

/**
 * Loading wrapper component interface
 */
export interface LoadingWrapperComponent {
  /** Reference to the underlying PrimeVue ProgressSpinner */
  primevueRef: any
}