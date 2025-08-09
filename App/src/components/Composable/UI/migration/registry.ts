/**
 * Component registry system for mapping old components to new PrimeVue wrappers
 */

import { reactive } from 'vue'
import type { Component } from 'vue'
import type { ComponentRegistry, ComponentRegistryEntry } from './types'
import { createDeprecationWarning } from './utils'

/**
 * Global component registry
 */
const componentRegistry = reactive<ComponentRegistry>({
  mappings: {}
})

/**
 * Registers a component mapping in the registry
 */
export const registerComponent = (
  oldName: string,
  entry: ComponentRegistryEntry
): void => {
  componentRegistry.mappings[oldName] = {
    ...entry,
    originalName: oldName
  }
  
  // Log registration for debugging
  if (process.env.NODE_ENV === 'development') {
    console.log(`Registered component mapping: ${oldName} -> ${entry.component.name}`)
  }
}

/**
 * Gets a component from the registry
 */
export const getComponent = (name: string): ComponentRegistryEntry | null => {
  const entry = componentRegistry.mappings[name]
  
  if (!entry) {
    return null
  }
  
  // Show deprecation warning if component is deprecated
  if (entry.deprecated) {
    const warning = createDeprecationWarning(
      name,
      entry.component.name || 'NewComponent',
      entry.migrationNotes
    )
    warning()
  }
  
  return entry
}

/**
 * Checks if a component is registered
 */
export const hasComponent = (name: string): boolean => {
  return name in componentRegistry.mappings
}

/**
 * Lists all registered components
 */
export const listComponents = (): string[] => {
  return Object.keys(componentRegistry.mappings)
}

/**
 * Gets all deprecated components
 */
export const getDeprecatedComponents = (): Record<string, ComponentRegistryEntry> => {
  return Object.entries(componentRegistry.mappings)
    .filter(([, entry]) => entry.deprecated)
    .reduce((acc, [name, entry]) => {
      acc[name] = entry
      return acc
    }, {} as Record<string, ComponentRegistryEntry>)
}

/**
 * Removes a component from the registry
 */
export const unregisterComponent = (name: string): boolean => {
  if (hasComponent(name)) {
    delete componentRegistry.mappings[name]
    return true
  }
  return false
}

/**
 * Clears all component mappings
 */
export const clearRegistry = (): void => {
  Object.keys(componentRegistry.mappings).forEach(key => {
    delete componentRegistry.mappings[key]
  })
}

/**
 * Bulk register components
 */
export const registerComponents = (
  mappings: Record<string, ComponentRegistryEntry>
): void => {
  Object.entries(mappings).forEach(([name, entry]) => {
    registerComponent(name, entry)
  })
}

/**
 * Creates a component resolver for auto-imports
 */
export const createComponentResolver = () => {
  return (name: string): Component | undefined => {
    const entry = getComponent(name)
    return entry?.component
  }
}

/**
 * Migration helper to check for unmigrated components
 */
export const checkUnmigratedComponents = (
  componentNames: string[]
): string[] => {
  return componentNames.filter(name => !hasComponent(name))
}

/**
 * Export the registry for external access
 */
export const registry = componentRegistry

/**
 * Development helper to log registry state
 */
export const debugRegistry = (): void => {
  if (process.env.NODE_ENV === 'development') {
    console.group('Component Registry State')
    console.table(
      Object.entries(componentRegistry.mappings).map(([name, entry]) => ({
        oldName: name,
        newName: entry.component.name,
        deprecated: entry.deprecated || false,
        hasNotes: !!entry.migrationNotes
      }))
    )
    console.groupEnd()
  }
}