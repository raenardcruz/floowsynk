/**
 * TypeScript interfaces for PasswordInput wrapper component
 */

import type { BaseComponentProps } from '../types/base'

/**
 * Props for the PasswordInput wrapper component
 */
export interface PasswordInputProps extends BaseComponentProps {
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
  /** Autocomplete attribute */
  autocomplete?: string
  /** Whether to show the toggle mask button */
  toggleMask?: boolean
  /** Whether to show password strength indicator */
  feedback?: boolean
  /** Custom prompt text for password strength */
  promptLabel?: string
  /** Custom weak password text */
  weakLabel?: string
  /** Custom medium password text */
  mediumLabel?: string
  /** Custom strong password text */
  strongLabel?: string
}

/**
 * Events emitted by the PasswordInput wrapper component
 */
export interface PasswordInputEmits {
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
 * Exposed methods and properties from the PasswordInput wrapper
 */
export interface PasswordInputExposed {
  /** Reference to the underlying PrimeVue Password component */
  primevueRef: any
  /** Focus the input */
  focus: () => void
  /** Blur the input */
  blur: () => void
  /** Select all text in the input */
  select: () => void
}