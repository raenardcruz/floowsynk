/**
 * Tabs Components - PrimeVue TabView Wrapper
 * 
 * The Tabs component has been migrated to use PrimeVue TabView as the underlying
 * implementation with a simplified wrapper API that maintains backward compatibility.
 * 
 * Migration Status: ✅ COMPLETED
 * - Tabs: Migrated to PrimeVue TabView wrapper with simplified API
 * - Tab: Maintained for backward compatibility and slot content management
 * 
 * Features:
 * - Simplified tab switching and content management
 * - Dynamic tab creation and removal support
 * - Enhanced accessibility and keyboard navigation
 * - Consistent theming with PrimeVue design system
 * - Full TypeScript support
 */

// Component exports
export { default as Tabs } from './Tabs.vue'
export { default as Tab } from './Tab.vue' // Maintained for backward compatibility

// TypeScript type exports
export * from './Tabs.types'

// Configuration exports
export * from './Tabs.config'

// Re-export types for backward compatibility
export type {
  TabsWrapperProps,
  TabsWrapperEmits,
  TabContent
} from './Tabs.types'