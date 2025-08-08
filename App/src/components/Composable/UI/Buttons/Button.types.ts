import type { Component, CSSProperties } from 'vue'

export interface BaseComponentProps {
  id?: string
  class?: string | string[] | Record<string, boolean>
  style?: string | CSSProperties
  disabled?: boolean
  loading?: boolean
}

export interface ButtonProps extends BaseComponentProps {
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

export interface ButtonEmits {
  click: [event: MouseEvent]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}

export interface ButtonSlots {
  default?: () => any
  icon?: () => any
  loading?: () => any
}