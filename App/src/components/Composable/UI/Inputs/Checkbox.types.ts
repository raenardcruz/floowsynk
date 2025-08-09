/**
 * TypeScript interfaces for Checkbox wrapper component
 */

import type { BaseComponentProps } from '../types/base'

/**
 * Props for the Checkbox wrapper component
 */
export interface CheckboxProps extends BaseComponentProps {
  /** The checkbox value (for v-model) */
  modelValue: boolean | any[]
  /** Label text for the checkbox */
  label?: string
  /** Value to use when checkbox is checked (for array models) */
  value?: any
  /** Whether the checkbox is required */
  required?: boolean
  /** Whether the checkbox is in an invalid state */
  invalid?: boolean
  /** Whether the checkbox is readonly */
  readonly?: boolean
  /** Whether the checkbox is in indeterminate state */
  indeterminate?: boolean
  /** Name attribute for the checkbox input */
  name?: string
  /** Tab index for the checkbox */
  tabindex?: number
  /** ARIA label for accessibility */
  ariaLabel?: string
  /** ARIA labelledby for accessibility */
  ariaLabelledby?: string
}

/**
 * Events emitted by the Checkbox wrapper component
 */
export interface CheckboxEmits {
  /** Emitted when the checkbox value changes */
  'update:modelValue': [value: boolean | any[]]
  /** Emitted when the checkbox gains focus */
  focus: [event: FocusEvent]
  /** Emitted when the checkbox loses focus */
  blur: [event: FocusEvent]
  /** Emitted when the checkbox value changes */
  change: [event: Event]
}

/**
 * Exposed methods and properties from the Checkbox wrapper
 */
export interface CheckboxExposed {
  /** Reference to the underlying PrimeVue Checkbox component */
  primevueRef: any
  /** Focus the checkbox */
  focus: () => void
  /** Blur the checkbox */
  blur: () => void
}