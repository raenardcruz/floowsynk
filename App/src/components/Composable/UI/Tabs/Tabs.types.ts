/**
 * TypeScript interfaces for Tabs wrapper component
 */

import type { Component } from 'vue'
import type { BaseWrapperProps } from '../migration/types'

/**
 * Tab content configuration
 */
export interface TabContent {
  /** Unique identifier for the tab */
  id: string
  /** Icon component to display in tab header */
  icon?: Component
  /** Text label for the tab */
  label: string
  /** Content to display in tab panel - can be a component or string */
  content: Component | string
  /** Layout direction for tab label (icon + text) */
  direction?: 'row' | 'column'
  /** Whether the tab can be closed */
  canClose?: boolean
}

/**
 * Props for the Tabs wrapper component
 */
export interface TabsWrapperProps extends BaseWrapperProps {
  /** Array of tab configurations */
  tabContents: TabContent[]
  /** Currently active tab ID */
  modelValue?: string | number
  /** Whether tabs are scrollable */
  scrollable?: boolean
  /** Position of tab headers */
  tabPosition?: 'top' | 'bottom' | 'left' | 'right'
}

/**
 * Events emitted by the Tabs wrapper component
 */
export interface TabsWrapperEmits {
  /** Emitted when active tab changes */
  'update:modelValue': [value: string | number]
  /** Emitted when a tab close button is clicked */
  'close': [id: string]
  /** Emitted when a tab is clicked */
  'tab-click': [event: { originalEvent: Event, index: number, tab: TabContent }]
}