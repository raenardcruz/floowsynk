/**
 * Base interfaces and types for PrimeVue component migration
 */

import type { Component, Ref } from 'vue'

/**
 * Base props that all wrapper components should support
 */
export interface BaseWrapperProps {
  /** Unique identifier for the component */
  id?: string
  /** CSS classes to apply to the component */
  class?: string | object | Array<string | object>
  /** Inline styles to apply to the component */
  style?: string | object
  /** Whether the component is disabled */
  disabled?: boolean
  /** Data test identifier for testing */
  'data-testid'?: string
}

/**
 * Base interface for wrapper components
 */
export interface WrapperComponent<T = any> {
  /** Reference to the underlying PrimeVue component instance */
  primevueRef: Ref<T>
  /** Focus the component */
  focus?: () => void
  /** Blur the component */
  blur?: () => void
}

/**
 * Component size variants
 */
export type ComponentSize = 'small' | 'medium' | 'large'

/**
 * Component variant types
 */
export type ComponentVariant = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'danger' | 'text'

/**
 * Component registry entry
 */
export interface ComponentRegistryEntry {
  /** The wrapper component */
  component: Component
  /** Default props for the component */
  props?: Record<string, any>
  /** Whether the component is deprecated */
  deprecated?: boolean
  /** Migration notes for developers */
  migrationNotes?: string
  /** Original component name being replaced */
  originalName?: string
}

/**
 * Component registry mapping old component names to new wrapper components
 */
export interface ComponentRegistry {
  mappings: Record<string, ComponentRegistryEntry>
}

/**
 * Theme configuration for PrimeVue integration
 */
export interface ThemeConfig {
  /** PrimeVue theme configuration */
  theme: {
    /** Theme preset to use */
    preset: 'Aura' | 'Lara' | 'Nora'
    /** Theme options */
    options: {
      /** Dark mode selector */
      darkModeSelector: string
      /** CSS layer configuration */
      cssLayer: {
        name: string
        order: string
      }
    }
  }
  /** Custom CSS properties for brand colors */
  customProperties: Record<string, string>
}

/**
 * Migration utility function type
 */
export type MigrationUtility<T extends Component = Component> = (
  primevueComponent: T,
  defaultProps?: Partial<any>,
  propMappings?: Record<string, string>
) => Component

/**
 * Props mapping configuration for component migration
 */
export interface PropMapping {
  /** Old prop name */
  from: string
  /** New prop name */
  to: string
  /** Value transformation function */
  transform?: (value: any) => any
  /** Whether the old prop is deprecated */
  deprecated?: boolean
}

/**
 * Component migration configuration
 */
export interface MigrationConfig {
  /** Component name */
  name: string
  /** PrimeVue component to wrap */
  primevueComponent: Component
  /** Default props */
  defaultProps?: Record<string, any>
  /** Prop mappings from old to new */
  propMappings?: PropMapping[]
  /** Custom wrapper logic */
  customWrapper?: (props: any, slots: any, attrs: any, emit: any) => any
}