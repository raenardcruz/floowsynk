/**
 * Configuration and defaults for TextCodeInput wrapper component
 */

import type { TextCodeInputWrapperProps } from './TextCodeInput.types'

export const defaultTextCodeInputProps: Partial<TextCodeInputWrapperProps> = {
  placeholder: '',
  disabled: false,
  required: false,
  invalid: false,
  type: 'text',
  showEditorButton: true,
  variant: 'outlined',
  size: 'medium'
}

export const textCodeInputVariantClasses = {
  filled: 'p-inputtext-filled',
  outlined: 'p-inputtext-outlined'
}

export const textCodeInputSizeClasses = {
  small: 'p-inputtext-sm',
  medium: '',
  large: 'p-inputtext-lg'
}