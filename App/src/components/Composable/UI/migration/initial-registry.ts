/**
 * Initial component registry setup
 * This file sets up the initial mappings for component migration
 */

import { registerComponents } from './registry'
import type { ComponentRegistryEntry } from './types'

// Import existing components that will be replaced
// Note: These imports will be updated as we create wrapper components
import Button from '../Buttons/Button.vue'
import PrimaryButton from '../Buttons/PrimaryButton.vue'
import Modal from '../Modal/Modal.vue'
import SideBar from '../Sidebar/Sidebar.vue'

/**
 * Initial component mappings
 * This will be expanded as we create more wrapper components
 */
const initialMappings: Record<string, ComponentRegistryEntry> = {
  // Button components - will be replaced with PrimeVue wrappers
  'Button': {
    component: Button,
    deprecated: false,
    migrationNotes: 'Will be replaced with PrimeVue Button wrapper in upcoming tasks'
  },
  'PrimaryButton': {
    component: PrimaryButton,
    deprecated: false,
    migrationNotes: 'Will be replaced with PrimeVue Button wrapper variant in upcoming tasks'
  },
  
  // Layout components - will be replaced with PrimeVue wrappers
  'Modal': {
    component: Modal,
    deprecated: false,
    migrationNotes: 'Will be replaced with PrimeVue Dialog wrapper in upcoming tasks'
  },
  'SideBar': {
    component: SideBar,
    deprecated: false,
    migrationNotes: 'Will be replaced with PrimeVue Sidebar wrapper in upcoming tasks'
  }
}

/**
 * Initialize the component registry with initial mappings
 */
export const initializeComponentRegistry = (): void => {
  registerComponents(initialMappings)
  
  if (process.env.NODE_ENV === 'development') {
    console.log('Component registry initialized with initial mappings')
    console.log('Registered components:', Object.keys(initialMappings))
  }
}

// Auto-initialize when module is imported
initializeComponentRegistry()