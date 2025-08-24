/**
 * Default configuration for Checkbox wrapper component
 */

import type { CheckboxProps } from './Checkbox.types'

/**
 * Default props for Checkbox wrapper
 */
export const defaultCheckboxProps: Partial<CheckboxProps> = {
  required: false,
  invalid: false,
  readonly: false,
  indeterminate: false,
  tabindex: 0
}

/**
 * Prop mappings from wrapper props to PrimeVue Checkbox props
 */
export const checkboxPropMappings = {
  // Direct mappings
  modelValue: 'modelValue',
  value: 'value',
  disabled: 'disabled',
  readonly: 'readonly',
  invalid: 'invalid',
  indeterminate: 'indeterminate',
  name: 'name',
  tabindex: 'tabindex',
  ariaLabel: 'aria-label',
  ariaLabelledby: 'aria-labelledby'
}

/**
 * CSS classes for different states
 */
export const checkboxStateClasses = {
  checked: 'checkbox--checked',
  unchecked: 'checkbox--unchecked',
  indeterminate: 'checkbox--indeterminate',
  disabled: 'checkbox--disabled',
  invalid: 'checkbox--invalid',
  readonly: 'checkbox--readonly'
}