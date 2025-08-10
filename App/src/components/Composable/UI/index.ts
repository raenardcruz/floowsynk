/**
 * FloowSynk UI Component Library - Main Export File
 * 
 * This file exports all UI components, utilities, and types.
 * Components have been migrated to PrimeVue wrappers for consistency and maintainability.
 * 
 * MIGRATION GUIDE:
 * ================
 * All components now use PrimeVue as the underlying implementation with simplified wrapper APIs.
 * The existing component APIs have been preserved for backward compatibility.
 * 
 * For detailed migration information, see:
 * - .kiro/specs/primevue-migration/design.md
 * - .kiro/specs/primevue-migration/requirements.md
 * 
 * Component Status:
 * - ✅ Input Components: Migrated to PrimeVue wrappers (TextInput, PasswordInput, Select, Checkbox)
 * - ✅ Button Components: Migrated to PrimeVue Button wrapper
 * - ✅ Layout Components: Migrated to PrimeVue wrappers (Modal, Sidebar)
 * - ✅ Feedback Components: Migrated to PrimeVue wrappers (Loading, Notif)
 * - ✅ Navigation Components: Migrated to PrimeVue TabView wrapper
 * - ✅ Data Components: Migrated to PrimeVue DataTable wrapper
 * - ✅ Complex Input Components: Migrated with enhanced functionality (KeyValue, ListField, TextCodeInput)
 * - ✅ Specialized Components: Evaluated and maintained (Collapsible, MonacoEditor)
 */

// Export composables
export * from './composables'

// Export types
export * from './types'

// Export utilities
export * from './utils'

// Export migration utilities (selective to avoid conflicts)
export {
  createMigrationWrapper,
  createAdvancedWrapper,
  migrateThemeProperties,
  registerComponent,
  getComponent,
  hasComponent,
  listComponents,
  registry,
  defaultThemeConfig,
  applyThemeIntegration,
  initializeThemeIntegration
} from './migration'

// Export migration types with aliases to avoid conflicts
export type {
  BaseWrapperProps as MigrationBaseWrapperProps,
  WrapperComponent,
  ComponentRegistryEntry,
  ComponentRegistry,
  ThemeConfig as MigrationThemeConfig,
  MigrationUtility,
  PropMapping,
  MigrationConfig
} from './migration'

// Export component-specific types
export type { MonacoEditorProps } from './MonacoEditor'

// ============================================================================
// COMPONENT EXPORTS
// ============================================================================

// Layout Components (PrimeVue Dialog and Sidebar wrappers)
export { default as SideBar } from './Sidebar'
export { default as Modal } from './Modal'

// Feedback Components (PrimeVue ProgressSpinner and Toast wrappers)
export { default as Loading } from './Loading'
export { default as Notif } from './Notif'

// Specialized Components (Maintained with PrimeVue integration)
export { default as MonacoEditor } from './MonacoEditor'

// Component Groups (exported from their respective index files)
export * from './Buttons'      // Button, PrimaryButton (PrimeVue Button wrappers)
export * from './Inputs'       // All input components (PrimeVue input wrappers)
export * from './Tabs'         // Tabs, Tab (PrimeVue TabView wrapper)
export * from './Table'        // Table, Headers, Row (PrimeVue DataTable wrapper)
export * from './Collapsible'  // Collapsible (Evaluated - maintained as custom)

// ============================================================================
// DEPRECATION WARNINGS
// ============================================================================

/**
 * @deprecated Legacy component imports are being phased out.
 * All components now use PrimeVue wrappers with enhanced functionality.
 * 
 * If you encounter any issues with the new components:
 * 1. Check the component's TypeScript interface for updated props
 * 2. Review the migration notes in the component registry
 * 3. Consult the PrimeVue documentation for advanced features
 * 
 * For support, see: App/src/components/Composable/UI/migration/
 */

// Development helper to warn about deprecated usage patterns
if (process.env.NODE_ENV === 'development') {
  console.info('FloowSynk UI Components: All components migrated to PrimeVue wrappers')
  console.info('For migration details, see: .kiro/specs/primevue-migration/')
}