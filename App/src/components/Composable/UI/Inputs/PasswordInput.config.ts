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