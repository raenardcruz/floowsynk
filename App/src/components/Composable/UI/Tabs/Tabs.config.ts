/**
 * Default configuration for Tabs wrapper component
 */

import type { TabsWrapperProps } from './Tabs.types'

/**
 * Default props for the Tabs wrapper component
 */
export const defaultTabsProps = {
  scrollable: false,
  tabPosition: 'top' as const,
  modelValue: ''
}

/**
 * CSS class mappings for different tab positions
 */
export const tabPositionClasses = {
  top: 'tabs-top',
  bottom: 'tabs-bottom',
  left: 'tabs-left',
  right: 'tabs-right'
} as const

/**
 * Default styling configuration
 */
export const defaultTabsStyle = {
  borderRadius: '16px',
  overflow: 'auto'
} as const