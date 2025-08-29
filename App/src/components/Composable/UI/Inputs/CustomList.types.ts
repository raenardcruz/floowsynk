import type { BaseComponentProps } from '../types/base'

export interface CustomListProps extends BaseComponentProps {
  modelValue: string
  label?: string
  template: any
}