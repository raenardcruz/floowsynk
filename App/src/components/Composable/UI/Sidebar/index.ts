/**
 * Sidebar Components - PrimeVue Sidebar Wrapper
 * 
 * The Sidebar components have been migrated to use PrimeVue Sidebar as the underlying
 * implementation with simplified wrapper APIs that maintain backward compatibility.
 * 
 * Migration Status: ✅ COMPLETED
 * - Sidebar: Migrated to PrimeVue Sidebar wrapper with drawer functionality
 * - BaseSidebar: Base implementation for sidebar functionality
 * - CollapsibleSidebar: Collapsible variant with enhanced interaction
 * 
 * Features:
 * - Enhanced drawer functionality and positioning
 * - Responsive behavior and overlay management
 * - Integration with main application layout
 * - Smooth animations and transitions
 * - Integration with PrimeVue theme system
 * - Full TypeScript support
 */

import Sidebar from './Sidebar.vue'
import BaseSidebar from './BaseSidebar.vue'
import CollapsibleSidebar from './CollapsibleSidebar.vue'
import type { 
  SidebarWrapperProps, 
  SidebarWrapperEmits, 
  SidebarProps,
  BaseSidebarProps,
  CollapsibleSidebarProps 
} from './Sidebar.types'
import { EMIT_VISIBLE } from './Sidebar.constants'

// Export the main component as default
export default Sidebar

// Component exports
export { 
  Sidebar, 
  BaseSidebar, 
  CollapsibleSidebar 
}

// TypeScript type exports
export type { 
  SidebarWrapperProps, 
  SidebarWrapperEmits, 
  SidebarProps,
  BaseSidebarProps,
  CollapsibleSidebarProps 
}

// Constant exports
export { EMIT_VISIBLE }

// Re-export types for backward compatibility
export type {
  SidebarWrapperProps as SidebarComponentProps,
  SidebarWrapperEmits as SidebarComponentEmits,
  SidebarProps as SidebarConfiguration
} from './Sidebar.types'