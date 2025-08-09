/**
 * Default configuration for Select wrapper component
 */

import type { SelectProps } from './Select.types'

/**
 * Default props for Select wrapper
 */
export const defaultSelectProps: Partial<SelectProps> = {
  variant: 'outlined',
  required: false,
  invalid: false,
  readonly: false,
  showClear: false,
  filter: false,
  showEmptyMessage: true,
  emptyMessage: 'No results found',
  emptyFilterMessage: 'No results found',
  scrollable: true,
  scrollHeight: '250px',
  loading: false,
  isRunning: false,
  placeholder: 'Select...',
  filterPlaceholder: 'Search...'
}

/**
 * Prop mappings from wrapper props to PrimeVue Select props
 */
export const selectPropMappings = {
  // Direct mappings
  modelValue: 'modelValue',
  options: 'options',
  placeholder: 'placeholder',
  disabled: 'disabled',
  readonly: 'readonly',
  invalid: 'invalid',
  showClear: 'showClear',
  filter: 'filter',
  filterPlaceholder: 'filterPlaceholder',
  emptyMessage: 'emptyMessage',
  emptyFilterMessage: 'emptyFilterMessage',
  scrollHeight: 'scrollHeight',
  loading: 'loading',
  
  // Custom mappings
  variant: (value: string) => ({
    variant: value === 'filled' ? 'filled' : 'outlined'
  })
}

/**
 * CSS classes for different variants
 */
export const selectVariantClasses = {
  filled: 'p-select-filled',
  outlined: 'p-select-outlined'
}