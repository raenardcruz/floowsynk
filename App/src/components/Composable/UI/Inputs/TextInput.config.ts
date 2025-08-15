/**
 * Default configuration for TextInput wrapper component
 */

import type { TextInputProps } from './TextInput.types'

/**
 * Default props for TextInput wrapper
 */
export const defaultTextInputProps: Partial<TextInputProps> = {
  class: undefined,
  id: undefined,
  style: undefined,
  disabled: false,
  loading: false,
  variant: 'outlined',
  type: 'text',
  autocomplete: 'off',
  required: false,
  invalid: false,
  readonly: false,
  tooltip: '',
  modelValue: '',
  label: '',
  placeholder: '',
  maxlength: 100,
}

/**
 * Prop mappings from wrapper props to PrimeVue InputText props
 */
export const textInputPropMappings = {
  // Direct mappings
  modelValue: 'modelValue',
  placeholder: 'placeholder',
  disabled: 'disabled',
  readonly: 'readonly',
  maxlength: 'maxlength',
  type: 'type',
  autocomplete: 'autocomplete',
  invalid: 'invalid',
  
  // Custom mappings
  variant: (value: string) => ({
    variant: value === 'filled' ? 'filled' : 'outlined'
  })
}

/**
 * CSS classes for different variants
 */
export const textInputVariantClasses = {
  filled: 'p-inputtext-filled',
  outlined: 'p-inputtext-outlined'
}