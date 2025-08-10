/**
 * Collapsible Component - Custom Implementation
 * 
 * The Collapsible component has been evaluated for migration to PrimeVue Accordion
 * but has been maintained as a custom implementation due to specific requirements
 * and existing usage patterns in the application.
 * 
 * Migration Status: ✅ EVALUATED - MAINTAINED AS CUSTOM
 * - Collapsible: Maintained as custom implementation with PrimeVue theme integration
 * 
 * Decision Rationale:
 * - Existing component meets all current requirements
 * - PrimeVue Accordion has different interaction patterns
 * - Custom implementation provides better control over animations and behavior
 * - Integration with PrimeVue theme system has been added
 * 
 * Features:
 * - Smooth expand/collapse animations
 * - Customizable trigger and content areas
 * - Integration with PrimeVue theme system
 * - Full TypeScript support
 * - Maintains existing API for backward compatibility
 * 
 * For detailed analysis, see: ./MIGRATION_ANALYSIS.md
 */

// Component export
export { default as Collapsible } from './Collapsible.vue'

// TypeScript type exports
export type { CollapsibleProps, CollapsibleEmits } from './Collapsible.types'

// Re-export types for backward compatibility
export type {
  CollapsibleProps as CollapsibleComponentProps,
  CollapsibleEmits as CollapsibleComponentEmits
} from './Collapsible.types'