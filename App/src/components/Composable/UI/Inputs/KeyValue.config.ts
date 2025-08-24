/**
 * Configuration and defaults for KeyValue wrapper component
 */

import type { KeyValueWrapperProps } from './KeyValue.types'

export const defaultKeyValueProps: Partial<KeyValueWrapperProps> = {
  keyPlaceholder: 'Enter Key',
  valuePlaceholder: 'Enter Value',
  disabled: false,
  required: false,
  invalid: false,
  variant: 'outlined',
  size: 'medium'
}

export const keyValueVariantClasses = {
  filled: 'p-inputtext-filled',
  outlined: 'p-inputtext-outlined'
}

export const keyValueSizeClasses = {
  small: 'p-inputtext-sm',
  medium: '',
  large: 'p-inputtext-lg'
}