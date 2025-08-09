/**
 * Utility functions for PrimeVue component migration
 */

import { defineComponent, h, ref, computed, warn } from 'vue'
import type { 
  MigrationUtility, 
  MigrationConfig
} from './types'

/**
 * Creates a migration wrapper component for PrimeVue components
 */
export const createMigrationWrapper: MigrationUtility = (
  primevueComponent,
  defaultProps = {},
  propMappings = {}
) => {
  return defineComponent({
    name: `${primevueComponent.name || 'Component'}Wrapper`,
    inheritAttrs: false,
    props: {
      // Base wrapper props
      id: String,
      class: [String, Object, Array],
      style: [String, Object],
      disabled: Boolean,
      'data-testid': String,
      // Allow any additional props
      ...Object.keys(defaultProps).reduce((acc, key) => {
        acc[key] = null
        return acc
      }, {} as Record<string, any>)
    },
    emits: ['update:modelValue'],
    setup(props, { slots, attrs, expose }) {
      const primevueRef = ref()

      // Map wrapper props to PrimeVue props
      const mappedProps = computed(() => {
        const mapped = { ...defaultProps }
        
        // Apply prop mappings
        Object.entries(props).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            const mappedKey = propMappings[key] || key
            mapped[mappedKey] = value
          }
        })

        // Merge with attrs
        Object.assign(mapped, attrs)
        
        return mapped
      })

      // Expose component methods
      const focus = () => {
        if (primevueRef.value?.focus) {
          primevueRef.value.focus()
        }
      }

      const blur = () => {
        if (primevueRef.value?.blur) {
          primevueRef.value.blur()
        }
      }

      expose({
        primevueRef,
        focus,
        blur
      })

      return () => h(primevueComponent, {
        ref: primevueRef,
        ...mappedProps.value,
        // Forward all events
        ...Object.keys(attrs).reduce((events, key) => {
          if (key.startsWith('on')) {
            events[key] = attrs[key]
          }
          return events
        }, {} as Record<string, any>)
      }, slots)
    }
  })
}

/**
 * Creates a wrapper component with advanced configuration
 */
export const createAdvancedWrapper = (config: MigrationConfig) => {
  return defineComponent({
    name: `${config.name}Wrapper`,
    inheritAttrs: false,
    setup(props: any, { slots, attrs, expose }) {
      const primevueRef = ref()

      // Apply prop mappings
      const mappedProps = computed(() => {
        const mapped = { ...config.defaultProps }
        
        if (config.propMappings) {
          config.propMappings.forEach(mapping => {
            if (props[mapping.from] !== undefined) {
              // Warn about deprecated props
              if (mapping.deprecated) {
                console.warn(`Prop "${mapping.from}" is deprecated. Use "${mapping.to}" instead.`)
              }
              
              const value = mapping.transform 
                ? mapping.transform(props[mapping.from])
                : props[mapping.from]
              
              mapped[mapping.to] = value
            }
          })
        }

        // Add remaining props
        Object.entries(props).forEach(([key, value]) => {
          if (!config.propMappings?.some(m => m.from === key)) {
            mapped[key] = value
          }
        })

        return mapped
      })

      // Expose methods
      expose({
        primevueRef,
        focus: () => primevueRef.value?.focus?.(),
        blur: () => primevueRef.value?.blur?.()
      })

      // Use custom wrapper logic if provided
      if (config.customWrapper) {
        return config.customWrapper(props, slots, attrs, () => {})
      }

      return () => h(config.primevueComponent, {
        ref: primevueRef,
        ...mappedProps.value,
        ...attrs
      }, slots)
    }
  })
}

/**
 * Migrates CSS custom properties to PrimeVue theme tokens
 */
export const migrateThemeProperties = (
  oldProperties: Record<string, string>,
  mappings: Record<string, string>
): Record<string, string> => {
  const migrated: Record<string, string> = {}
  
  Object.entries(oldProperties).forEach(([key, value]) => {
    const newKey = mappings[key] || key
    migrated[newKey] = value
  })
  
  return migrated
}

/**
 * Validates component props against expected interface
 */
export const validateWrapperProps = (
  props: Record<string, any>,
  expectedProps: string[]
): boolean => {
  const invalidProps = Object.keys(props).filter(
    key => !expectedProps.includes(key)
  )
  
  if (invalidProps.length > 0) {
    warn(`Invalid props detected: ${invalidProps.join(', ')}`)
    return false
  }
  
  return true
}

/**
 * Creates a deprecation warning for old component usage
 */
export const createDeprecationWarning = (
  oldComponentName: string,
  newComponentName: string,
  migrationNotes?: string
) => {
  return () => {
    warn(
      `Component "${oldComponentName}" is deprecated. ` +
      `Use "${newComponentName}" instead. ` +
      (migrationNotes ? `Migration notes: ${migrationNotes}` : '')
    )
  }
}

/**
 * Merges component classes with PrimeVue classes
 */
export const mergeComponentClasses = (
  wrapperClasses: string | object | Array<string | object> | undefined,
  primevueClasses: string | undefined
): string | object | Array<string | object> | undefined => {
  if (!wrapperClasses && !primevueClasses) return undefined
  if (!wrapperClasses) return primevueClasses
  if (!primevueClasses) return wrapperClasses
  
  if (typeof wrapperClasses === 'string') {
    return `${wrapperClasses} ${primevueClasses}`
  }
  
  if (Array.isArray(wrapperClasses)) {
    return [...wrapperClasses, primevueClasses]
  }
  
  return [wrapperClasses, primevueClasses]
}

/**
 * Extracts event handlers from attributes
 */
export const extractEventHandlers = (attrs: Record<string, any>) => {
  const events: Record<string, any> = {}
  const otherAttrs: Record<string, any> = {}
  
  Object.entries(attrs).forEach(([key, value]) => {
    if (key.startsWith('on') && typeof value === 'function') {
      events[key] = value
    } else {
      otherAttrs[key] = value
    }
  })
  
  return { events, otherAttrs }
}