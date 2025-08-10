/**
 * TypeScript interfaces for KeyValue wrapper component
 */

import type { BaseComponentProps } from '../types/base'

export interface KeyValuePair {
  key: string
  value: string
}

export interface KeyValueWrapperProps extends BaseComponentProps {
  /** The key-value pair model */
  modelValue: KeyValuePair
  /** Label for the component */
  label?: string
  /** Placeholder for key input */
  keyPlaceholder?: string
  /** Placeholder for value input */
  valuePlaceholder?: string
  /** Whether the component is disabled */
  disabled?: boolean
  /** Whether the component is required */
  required?: boolean
  /** Whether the component is invalid */
  invalid?: boolean
  /** Input variant style */
  variant?: 'filled' | 'outlined'
  /** Size of the inputs */
  size?: 'small' | 'medium' | 'large'
}

export interface KeyValueWrapperEmits {
  /** Emitted when the model value changes */
  'update:modelValue': [value: KeyValuePair]
  /** Emitted when key input is focused */
  'key-focus': [event: FocusEvent]
  /** Emitted when key input is blurred */
  'key-blur': [event: FocusEvent]
  /** Emitted when value input is focused */
  'value-focus': [event: FocusEvent]
  /** Emitted when value input is blurred */
  'value-blur': [event: FocusEvent]
}

export interface KeyValueWrapperExposed {
  /** Reference to the key input component */
  keyInputRef: any
  /** Reference to the value input component */
  valueInputRef: any
  /** Focus the key input */
  focusKey: () => void
  /** Focus the value input */
  focusValue: () => void
  /** Blur the key input */
  blurKey: () => void
  /** Blur the value input */
  blurValue: () => void
}