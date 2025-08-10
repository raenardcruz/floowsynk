/**
 * TypeScript interfaces for TextCodeInput wrapper component
 */

import type { BaseComponentProps } from '../types/base'

export interface EditorConfig {
  variables: any[]
  target: string
}

export interface TextCodeInputWrapperProps extends BaseComponentProps {
  /** The input value */
  modelValue: string | number
  /** Label text for the input */
  label?: string
  /** Placeholder text */
  placeholder?: string
  /** Whether the input is disabled */
  disabled?: boolean
  /** Whether the input is required */
  required?: boolean
  /** Whether the input is in an invalid state */
  invalid?: boolean
  /** Input type */
  type?: 'text' | 'number' | 'email' | 'url' | 'tel'
  /** Editor configuration for Monaco Editor integration */
  editorConfig?: EditorConfig
  /** Whether to show the code editor button */
  showEditorButton?: boolean
  /** Input variant style */
  variant?: 'filled' | 'outlined'
  /** Size of the input */
  size?: 'small' | 'medium' | 'large'
}

export interface TextCodeInputWrapperEmits {
  /** Emitted when the input value changes */
  'update:modelValue': [value: string | number]
  /** Emitted when the input gains focus */
  focus: [event: FocusEvent]
  /** Emitted when the input loses focus */
  blur: [event: FocusEvent]
  /** Emitted when the editor is opened */
  'editor-opened': []
  /** Emitted when the editor is closed */
  'editor-closed': []
  /** Emitted when a key is pressed */
  keydown: [event: KeyboardEvent]
  /** Emitted when a key is released */
  keyup: [event: KeyboardEvent]
}

export interface TextCodeInputWrapperExposed {
  /** Reference to the underlying PrimeVue InputText component */
  primevueRef: any
  /** Focus the input */
  focus: () => void
  /** Blur the input */
  blur: () => void
  /** Select all text in the input */
  select: () => void
  /** Open the code editor modal */
  openEditor: () => void
  /** Close the code editor modal */
  closeEditor: () => void
  /** Toggle the code editor modal */
  toggleEditor: () => void
}