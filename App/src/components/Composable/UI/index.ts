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

// Components will be exported individually as they are created
export { default as SideBar } from './Sidebar'
export { default as Modal } from './Modal'
export { default as Loading } from './Loading'
export { default as Notif } from './Notif'
export * from './Buttons'