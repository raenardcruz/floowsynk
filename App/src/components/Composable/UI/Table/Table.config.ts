/**
 * Default configuration for Table wrapper component
 */

import type { TableWrapperProps } from './Table.types'

/**
 * Default props for the Table wrapper component
 */
export const defaultTableProps = {
  selectable: false,
  paginator: false,
  rows: 10,
  sortable: true,
  filterable: false,
  showGridlines: false,
  rowHover: true,
  loading: false,
  emptyMessage: 'No data available',
  virtualScroll: false,
  scrollHeight: '400px',
  virtualScrollItemSize: 40
} as const

/**
 * Default styling configuration
 */
export const defaultTableStyle = {
  borderRadius: '8px',
  overflow: 'hidden'
} as const

/**
 * CSS class mappings for different table variants
 */
export const tableVariantClasses = {
  default: 'table-default',
  compact: 'table-compact',
  striped: 'table-striped'
} as const