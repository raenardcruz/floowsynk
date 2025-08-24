/**
 * TypeScript interfaces for Select wrapper component
 */

import type { BaseComponentProps } from '../types/base'
import type { SelectOption } from './Inputs'

/**
 * Props for the Select wrapper component
 */
export interface SelectProps extends BaseComponentProps {
  /** The selected value */
  modelValue: any
  /** Array of options to display */
  options: SelectOption[]
  /** Label text for the select */
  label?: string
  /** Placeholder text */
  placeholder?: string
  /** Whether the select is required */
  required?: boolean
  /** Whether the select is in an invalid state */
  invalid?: boolean
  /** Select variant style */
  variant?: 'filled' | 'outlined'
  /** Whether the select is readonly */
  readonly?: boolean
  /** Whether to show a clear button */
  showClear?: boolean
  /** Whether the select is filterable */
  filter?: boolean
  /** Placeholder text for filter input */
  filterPlaceholder?: string
  /** Whether to show empty message when no options match filter */
  showEmptyMessage?: boolean
  /** Text to show when no options are available */
  emptyMessage?: string
  /** Text to show when no options match the filter */
  emptyFilterMessage?: string
  /** Whether the dropdown should be scrollable */
  scrollable?: boolean
  /** Maximum height of the dropdown */
  scrollHeight?: string
  /** Whether the select is loading */
  loading?: boolean
  /** Whether the select is running (custom prop from original) */
  isRunning?: boolean
}

/**
 * Events emitted by the Select wrapper component
 */
export interface SelectEmits {
  /** Emitted when the selected value changes */
  'update:modelValue': [value: any]
  /** Emitted when the dropdown is shown */
  show: []
  /** Emitted when the dropdown is hidden */
  hide: []
  /** Emitted when an option is selected */
  change: [event: { originalEvent: Event; value: any }]
  /** Emitted when the select gains focus */
  focus: [event: FocusEvent]
  /** Emitted when the select loses focus */
  blur: [event: FocusEvent]
  /** Emitted when the filter value changes */
  filter: [event: { originalEvent: Event; value: string }]
}

/**
 * Exposed methods and properties from the Select wrapper
 */
export interface SelectExposed {
  /** Reference to the underlying PrimeVue Select component */
  primevueRef: any
  /** Focus the select */
  focus: () => void
  /** Blur the select */
  blur: () => void
  /** Show the dropdown */
  show: () => void
  /** Hide the dropdown */
  hide: () => void
}