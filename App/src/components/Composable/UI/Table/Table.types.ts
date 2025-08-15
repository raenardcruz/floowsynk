/**
 * TypeScript interfaces for Table wrapper component
 */

import type { Component } from 'vue'
import type { BaseWrapperProps } from '../types'

/**
 * Column configuration for the table
 */
export interface TableColumn {
  /** Unique field identifier */
  field: string
  /** Column header text */
  header: string
  /** Column width (CSS value) */
  width?: string
  /** Whether column is sortable */
  sortable?: boolean
  /** Whether column is filterable */
  filterable?: boolean
  /** Custom component for rendering cell content */
  component?: Component
  /** Custom styling for the column */
  style?: string | object
  /** Custom CSS classes for the column */
  class?: string | object | Array<string | object>
}

/**
 * Props for the Table wrapper component
 */
export interface TableWrapperProps extends BaseWrapperProps {
  /** Array of data to display */
  value: any[]
  /** Column configurations */
  columns: TableColumn[]
  /** Whether to show selection checkboxes */
  selectable?: boolean
  /** Selected rows (for selectable tables) */
  selection?: any[]
  /** Whether to enable pagination */
  paginator?: boolean
  /** Number of rows per page */
  rows?: number
  /** Whether to enable sorting */
  sortable?: boolean
  /** Whether to enable filtering */
  filterable?: boolean
  /** Whether to show grid lines */
  showGridlines?: boolean
  /** Whether to enable row hover effect */
  rowHover?: boolean
  /** Custom row styling function */
  rowClass?: (data: any) => string | object
  /** Loading state */
  loading?: boolean
  /** Empty message when no data */
  emptyMessage?: string
  /** Whether to enable virtual scrolling */
  virtualScroll?: boolean
  /** Height for virtual scrolling */
  scrollHeight?: string
  /** Item size for virtual scrolling */
  virtualScrollItemSize?: number
}

/**
 * Events emitted by the Table wrapper component
 */
export interface TableWrapperEmits {
  /** Emitted when selection changes */
  'update:selection': [value: any[]]
  /** Emitted when a row is clicked */
  'row-click': [event: { originalEvent: Event, data: any, index: number }]
  /** Emitted when a row is selected */
  'row-select': [event: { originalEvent: Event, data: any, index: number }]
  /** Emitted when a row is unselected */
  'row-unselect': [event: { originalEvent: Event, data: any, index: number }]
}

/**
 * Legacy props for backward compatibility with Headers component
 */
export interface HeadersProps {
  /** Grid column style (e.g., 'repeat(3, 1fr)') */
  columnstyle?: string
}

/**
 * Legacy props for backward compatibility with Row component
 */
export interface RowProps {
  /** Grid column style (e.g., 'repeat(3, 1fr)') */
  columnstyle?: string
  /** Whether the row is selected */
  selected?: boolean
}