/**
 * FloowSynk UI Component Library - Main Export File
 * 
 * This file exports all UI components, utilities, and types.
 * All components use PrimeVue as the underlying implementation.
 */

// Export composables
export * from './composables'

// Export types
export * from './types'

// Export utilities
export * from './utils'

// Export component-specific types
export type { MonacoEditorProps } from './MonacoEditor'

// ============================================================================
// COMPONENT EXPORTS
// ============================================================================

// Layout Components
export { default as SideBar } from './Sidebar'
export { default as Modal } from './Modal'

// Feedback Components
export { default as Loading } from './Loading'
export { default as Notif } from './Notif'

// Specialized Components
export { default as MonacoEditor } from './MonacoEditor'

// Component Groups (exported from their respective index files)
export * from './Buttons'      // Button, PrimaryButton
export * from './Inputs'       // All input components
export * from './Tabs'         // Tabs, Tab
export * from './Table'        // Table, Headers, Row
export * from './Collapsible'  // Collapsible