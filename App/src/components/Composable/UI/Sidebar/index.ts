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

// Export all components
export { 
  Sidebar, 
  BaseSidebar, 
  CollapsibleSidebar 
}

// Export types and constants
export type { 
  SidebarWrapperProps, 
  SidebarWrapperEmits, 
  SidebarProps,
  BaseSidebarProps,
  CollapsibleSidebarProps 
}

export { EMIT_VISIBLE }