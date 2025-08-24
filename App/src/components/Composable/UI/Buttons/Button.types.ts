import type { Component, CSSProperties } from 'vue'

export interface BaseComponentProps {
  id?: string
  class?: string | string[] | Record<string, boolean>
  style?: string | CSSProperties
  disabled?: boolean
  loading?: boolean
}

// PrimeVue Button Wrapper types
export interface ButtonWrapperProps extends BaseComponentProps {
  label?: string
  icon?: Component | string
  iconPosition?: 'left' | 'right'
  variant?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'danger' | 'outline' | 'ghost'
  size?: 'small' | 'medium' | 'large'
  tooltip?: string
  rounded?: boolean
  block?: boolean
}

export interface ButtonWrapperEmits {
  click: [event: MouseEvent]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}

export interface ButtonWrapperSlots {
  default?: () => any
  icon?: () => any
}

// Legacy Button types (for backward compatibility)
export interface LegacyButtonProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'small' | 'medium' | 'large'
  icon?: Component | string
  iconPosition?: 'left' | 'right'
  label?: string
  loadingText?: string
  type?: 'button' | 'submit' | 'reset'
  tooltip?: string
  block?: boolean
  rounded?: boolean
}

export interface LegacyButtonEmits {
  click: [event: MouseEvent]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}

export interface LegacyButtonSlots {
  default?: () => any
  icon?: () => any
  loading?: () => any
}

// Export main types
export type ButtonProps = ButtonWrapperProps
export type ButtonEmits = ButtonWrapperEmits
export type ButtonSlots = ButtonWrapperSlots

// Export additional types for backward compatibility
export type ButtonVariant = ButtonWrapperProps['variant']
export type ButtonSize = ButtonWrapperProps['size']
export type ButtonIconPosition = ButtonWrapperProps['iconPosition']