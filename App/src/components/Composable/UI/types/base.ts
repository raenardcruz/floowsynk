import type { Component, CSSProperties } from 'vue'

/**
 * Base props interface that all custom components should extend
 */
export interface BaseComponentProps {
  /** Unique identifier for the component */
  id?: string
  /** CSS classes to apply to the component */
  class?: string | string[] | Record<string, boolean>
  /** Inline styles to apply to the component */
  style?: string | CSSProperties
  /** Whether the component is disabled */
  disabled?: boolean
  /** Whether the component is in a loading state */
  loading?: boolean
}

/**
 * Base component state interface for internal state management
 */
export interface ComponentState {
  /** Whether the component is currently loading */
  loading: boolean
  /** Whether the component is disabled */
  disabled: boolean
  /** Current error message, if any */
  error: string | null
  /** Whether the component is currently focused */
  focused: boolean
  /** Whether the component is currently hovered */
  hovered: boolean
}

/**
 * Form field state interface extending base component state
 */
export interface FormFieldState extends ComponentState {
  /** Current field value */
  value: any
  /** Whether the field has been touched by the user */
  touched: boolean
  /** Whether the field value has been modified */
  dirty: boolean
  /** Whether the field value is valid */
  valid: boolean
  /** Current validation message */
  validationMessage: string | null
}

/**
 * Size variants for components
 */
export type ComponentSize = 'small' | 'medium' | 'large'

/**
 * Color variants for components
 */
export type ComponentVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'

/**
 * Button specific props interface
 */
export interface ButtonProps extends BaseComponentProps {
  /** Button visual variant */
  variant?: ComponentVariant | 'outline' | 'ghost'
  /** Button size */
  size?: ComponentSize
  /** Icon component to display */
  icon?: Component
  /** Position of the icon relative to text */
  iconPosition?: 'left' | 'right'
  /** Text to display when loading */
  loadingText?: string
  /** Button type attribute */
  type?: 'button' | 'submit' | 'reset'
}

/**
 * Input field props interface
 */
export interface InputProps extends BaseComponentProps {
  /** Input value (for v-model) */
  modelValue?: string | number
  /** Input label */
  label?: string
  /** Placeholder text */
  placeholder?: string
  /** Input type */
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'
  /** Whether the field is required */
  required?: boolean
  /** Error message to display */
  error?: string
  /** Hint text to display */
  hint?: string
  /** Whether the input is readonly */
  readonly?: boolean
  /** Maximum length of input */
  maxlength?: number
  /** Minimum length of input */
  minlength?: number
}

/**
 * Tab item interface for tab components
 */
export interface TabItem {
  /** Unique identifier for the tab */
  id: string | number
  /** Display label for the tab */
  label: string
  /** Optional icon component */
  icon?: Component
  /** Tab content component or string */
  content: Component | string
  /** Whether the tab is disabled */
  disabled?: boolean
  /** Whether the tab can be closed */
  closable?: boolean
  /** Additional data associated with the tab */
  data?: Record<string, any>
}

/**
 * Tabs component props interface
 */
export interface TabsProps extends BaseComponentProps {
  /** Currently active tab ID */
  modelValue?: string | number
  /** Array of tab items */
  tabs: TabItem[]
  /** Tab orientation */
  orientation?: 'horizontal' | 'vertical'
  /** Visual variant of tabs */
  variant?: 'default' | 'pills' | 'underline'
}

/**
 * Modal props interface
 */
export interface ModalProps extends BaseComponentProps {
  /** Whether the modal is visible */
  modelValue?: boolean
  /** Modal title */
  title?: string
  /** Modal size */
  size?: ComponentSize | 'fullscreen'
  /** Whether clicking outside closes the modal */
  closeOnOutsideClick?: boolean
  /** Whether pressing escape closes the modal */
  closeOnEscape?: boolean
  /** Whether to show the close button */
  showCloseButton?: boolean
}

/**
 * Validation rule function type
 */
export type ValidationRule<T = any> = (value: T) => string | boolean

/**
 * Validation rules object type
 */
export type ValidationRules<T extends Record<string, any>> = {
  [K in keyof T]?: ValidationRule<T[K]>[]
}

/**
 * Theme configuration interface
 */
export interface ThemeConfig {
  /** Color palette */
  colors: {
    primary: string
    secondary: string
    success: string
    warning: string
    error: string
    info: string
    background: string
    surface: string
    text: string
  }
  /** Spacing scale */
  spacing: {
    xs: string
    sm: string
    md: string
    lg: string
    xl: string
  }
  /** Border radius scale */
  borderRadius: {
    sm: string
    md: string
    lg: string
    full: string
  }
  /** Shadow scale */
  shadows: {
    sm: string
    md: string
    lg: string
  }
}

/**
 * Theme mode type
 */
export type ThemeMode = 'light' | 'dark' | 'auto'