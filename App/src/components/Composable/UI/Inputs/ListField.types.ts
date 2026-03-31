/**
 * TypeScript interfaces for ListField wrapper component
 */

import type { BaseComponentProps } from '../types/base'
import type { Component } from 'vue'

// Re-export protocol buffer types for convenience
export type { NodeDataArray, ArrayDataType, KeyValue } from 'proto/workflow/workflow_pb'

export interface ListFieldItem {
  id: string | number
  value: any
  type: ListFieldItemType
}

export type ListFieldItemType = 'string' | 'number' | 'boolean' | 'keyvalue'

export interface ListFieldOption {
  value: ListFieldItemType
  label: string
  component: Component
  defaultValue: any
}

export interface ListFieldWrapperProps extends BaseComponentProps {
  /** The list data model */
  modelValue: any // NodeDataArray.AsObject or simplified array
  /** Label for the component */
  label?: string
  /** Whether the component is disabled */
  disabled?: boolean
  /** Whether the component is required */
  required?: boolean
  /** Whether the component is invalid */
  invalid?: boolean
  /** Available item types */
  availableTypes?: ListFieldItemType[]
  /** Whether drag and drop reordering is enabled */
  draggable?: boolean
  /** Maximum number of items allowed */
  maxItems?: number
  /** Minimum number of items required */
  minItems?: number
}

export interface ListFieldWrapperEmits {
  /** Emitted when the model value changes */
  'update:modelValue': [value: any]
  /** Emitted when an item is added */
  'item-added': [item: ListFieldItem, index: number]
  /** Emitted when an item is removed */
  'item-removed': [item: ListFieldItem, index: number]
  /** Emitted when items are reordered */
  'items-reordered': [items: ListFieldItem[]]
  /** Emitted when item type changes */
  'type-changed': [newType: ListFieldItemType, oldType: ListFieldItemType]
}

export interface ListFieldWrapperExposed {
  /** Add a new item to the list */
  addItem: (type?: ListFieldItemType) => void
  /** Remove an item at the specified index */
  removeItem: (index: number) => void
  /** Clear all items */
  clearItems: () => void
  /** Get the current items */
  getItems: () => ListFieldItem[]
  /** Set the current data type */
  setDataType: (type: ListFieldItemType) => void
}