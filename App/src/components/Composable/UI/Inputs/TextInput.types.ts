/**
 * TypeScript interfaces for TextInput wrapper component
 */

import type { BaseComponentProps } from '../types/base'

/**
 * Props for the TextInput wrapper component
 */
export interface TextInputProps extends BaseComponentProps {
  /** The input value */
  modelValue: string
  /** Label text for the input */
  label?: string
  /** Placeholder text */
  placeholder?: string
  /** Whether the input is required */
  required?: boolean
  /** Whether the input is in an invalid state */
  invalid?: boolean
  /** Input variant style */
  variant?: 'filled' | 'outlined'
  /** Whether the input is readonly */
  readonly?: boolean
  /** Maximum length of input */
  maxlength?: number
  /** Input type */
  type?: 'text' | 'email' | 'url' | 'tel'
  /** Autocomplete attribute */
  autocomplete?: string
  tooltip?: string
  /** Unique identifier for the input */
}

/**
 * Events emitted by the TextInput wrapper component
 */
export interface TextInputEmits {
  /** Emitted when the input value changes */
  'update:modelValue': [value: string]
  /** Emitted when the input gains focus */
  focus: [event: FocusEvent]
  /** Emitted when the input loses focus */
  blur: [event: FocusEvent]
  /** Emitted when a key is pressed */
  keydown: [event: KeyboardEvent]
  /** Emitted when a key is released */
  keyup: [event: KeyboardEvent]
  /** Emitted when the input value changes */
  input: [event: Event]
}

/**
 * Exposed methods and properties from the TextInput wrapper
 */
export interface TextInputExposed {
  /** Reference to the underlying PrimeVue InputText component */
  primevueRef: any
  /** Focus the input */
  focus: () => void
  /** Blur the input */
  blur: () => void
  /** Select all text in the input */
  select: () => void
}