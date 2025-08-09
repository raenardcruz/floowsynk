/**
 * Migration utilities and components for PrimeVue integration
 * 
 * This module provides all the necessary utilities, types, and components
 * for migrating from custom UI components to PrimeVue components.
 */

// Export types
export type * from './types'

// Export utilities
export * from './utils'

// Export registry
export * from './registry'

// Export theme integration
export * from './theme-integration'

// Re-export commonly used utilities
export {
  createMigrationWrapper,
  createAdvancedWrapper,
  migrateThemeProperties
} from './utils'

export {
  registerComponent,
  getComponent,
  hasComponent,
  listComponents,
  registry
} from './registry'

export {
  defaultThemeConfig,
  applyThemeIntegration,
  initializeThemeIntegration
} from './theme-integration'