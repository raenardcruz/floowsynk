export interface CollapsibleProps {
  /**
   * The title text displayed in the collapsible header
   */
  title: string
  
  /**
   * Optional caption text displayed below the title
   */
  caption?: string
  
  /**
   * Optional ID for the component (used for accessibility)
   * If not provided, a random ID will be generated
   */
  id?: string
  
  /**
   * Controls whether the collapsible content is expanded
   * @default false
   */
  modelValue?: boolean
}

export interface CollapsibleEmits {
  /**
   * Emitted when the expanded state changes
   */
  'update:modelValue': [value: boolean]
}