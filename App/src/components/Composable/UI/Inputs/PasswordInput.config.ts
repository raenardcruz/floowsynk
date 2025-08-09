/**
 * Default configuration for PasswordInput wrapper component
 */

import type { PasswordInputProps } from './PasswordInput.types'

/**
 * Default props for PasswordInput wrapper
 */
export const defaultPasswordInputProps: Partial<PasswordInputProps> = {
  variant: 'outlined',
  autocomplete: 'current-password',
  required: false,
  invalid: false,
  readonly: false,
  toggleMask: true,
  feedback: false
}

/**
 * Prop mappings from wrapper props to PrimeVue Password props
 */
export const passwordInputPropMappings = {
  // Direct mappings
  modelValue: 'modelValue',
  placeholder: 'placeholder',
  disabled: 'disabled',
  readonly: 'readonly',
  maxlength: 'maxlength',
  autocomplete: 'autocomplete',
  invalid: 'invalid',
  toggleMask: 'toggleMask',
  feedback: 'feedback',
  promptLabel: 'promptLabel',
  weakLabel: 'weakLabel',
  mediumLabel: 'mediumLabel',
  strongLabel: 'strongLabel',
  
  // Custom mappings
  variant: (value: string) => ({
    variant: value === 'filled' ? 'filled' : 'outlined'
  })
}

/**
 * CSS classes for different variants
 */
export const passwordInputVariantClasses = {
  filled: 'p-password-filled',
  outlined: 'p-password-outlined'
}