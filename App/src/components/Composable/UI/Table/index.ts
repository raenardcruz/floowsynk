/**
 * Table Components - PrimeVue DataTable Wrapper
 * 
 * The Table component has been migrated to use PrimeVue DataTable as the underlying
 * implementation, replacing the custom Headers and Row components with a more powerful
 * and feature-rich data table solution.
 * 
 * Uses PrimeVue DataTable with column configuration and legacy component support.
 * 
 * New Features:
 * - Built-in sorting, filtering, and pagination
 * - Column resizing and reordering
 * - Row selection and expansion
 * - Enhanced performance with virtual scrolling
 * - Responsive design support
 * - Full TypeScript support
 * 
 * Note: Legacy Headers and Row components are maintained for backward compatibility.
 */

// Primary component export (PrimeVue DataTable wrapper)
export { default as Table } from './Table.vue'

// Legacy components (deprecated but maintained for backward compatibility)
/**
 * @deprecated Use the new Table component with column configuration instead
 * These components will be removed in a future version
 */
export { default as Headers } from './Headers.vue'
/**
 * @deprecated Use the new Table component with column configuration instead
 * These components will be removed in a future version
 */
export { default as Row } from './Row.vue'

// TypeScript type exports
export * from './Table.types'

// Configuration exports
export * from './Table.config'

// Re-export types for backward compatibility
export type {
  TableWrapperProps,
  TableWrapperEmits,
  TableColumn,
  HeadersProps,
  RowProps
} from './Table.types'