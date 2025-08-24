/**
 * PrimeVue Configuration for Optimal Bundle Size
 * 
 * This configuration ensures that only the PrimeVue components we actually use
 * are included in the bundle, optimizing for tree shaking and minimal bundle size.
 */

// Import only the PrimeVue components we actually use
// This helps with tree shaking and reduces bundle size

// Core PrimeVue
export { default as PrimeVue } from 'primevue/config'
export { default as Aura } from '@primeuix/themes/aura'

// Components used in our wrappers
export { default as Button } from 'primevue/button'
export { default as InputText } from 'primevue/inputtext'
export { default as FloatLabel } from 'primevue/floatlabel'
export { default as Password } from 'primevue/password'
export { default as Select } from 'primevue/select'
export { default as Checkbox } from 'primevue/checkbox'
export { default as Dialog } from 'primevue/dialog'
export { default as Sidebar } from 'primevue/sidebar'
export { default as ProgressSpinner } from 'primevue/progressspinner'
export { default as Toast } from 'primevue/toast'
export { default as TabView } from 'primevue/tabview'
export { default as TabPanel } from 'primevue/tabpanel'
export { default as DataTable } from 'primevue/datatable'
export { default as Column } from 'primevue/column'

// Directives
export { default as Tooltip } from 'primevue/tooltip'

// Services (if needed)
export { default as ToastService } from 'primevue/toastservice'

/**
 * List of PrimeVue components we're using
 * This helps with documentation and bundle analysis
 */
export const USED_PRIMEVUE_COMPONENTS = [
  'Button',
  'InputText', 
  'FloatLabel',
  'Password',
  'Select',
  'Checkbox',
  'Dialog',
  'Sidebar',
  'ProgressSpinner',
  'Toast',
  'TabView',
  'TabPanel',
  'DataTable',
  'Column'
] as const

/**
 * Estimated bundle size impact of each component (approximate)
 * This helps identify which components have the biggest impact
 */
export const COMPONENT_SIZE_ESTIMATES = {
  'Button': '15KB',
  'InputText': '8KB',
  'FloatLabel': '5KB', 
  'Password': '12KB',
  'Select': '25KB',
  'Checkbox': '8KB',
  'Dialog': '20KB',
  'Sidebar': '15KB',
  'ProgressSpinner': '6KB',
  'Toast': '18KB',
  'TabView': '22KB',
  'TabPanel': '5KB',
  'DataTable': '45KB',
  'Column': '8KB'
} as const

/**
 * Components we're NOT using (for reference)
 * These should be excluded from the bundle through tree shaking
 */
export const UNUSED_PRIMEVUE_COMPONENTS = [
  'Accordion',
  'AutoComplete',
  'Avatar',
  'Badge',
  'Breadcrumb',
  'Calendar',
  'Card',
  'Carousel',
  'Chart',
  'Chip',
  'ColorPicker',
  'ConfirmDialog',
  'ContextMenu',
  'Divider',
  'Dropdown',
  'Editor',
  'Fieldset',
  'FileUpload',
  'Galleria',
  'Image',
  'InlineMessage',
  'Inplace',
  'InputGroup',
  'InputMask',
  'InputNumber',
  'InputSwitch',
  'Knob',
  'Listbox',
  'MegaMenu',
  'Menu',
  'Menubar',
  'Message',
  'MultiSelect',
  'OrderList',
  'OrganizationChart',
  'OverlayPanel',
  'Paginator',
  'Panel',
  'PanelMenu',
  'PickList',
  'ProgressBar',
  'RadioButton',
  'Rating',
  'ScrollPanel',
  'ScrollTop',
  'SelectButton',
  'Skeleton',
  'Slider',
  'SpeedDial',
  'SplitButton',
  'Splitter',
  'Steps',
  'Tag',
  'Terminal',
  'Textarea',
  'TieredMenu',
  'Timeline',
  'ToggleButton',
  'Toolbar',
  'Tree',
  'TreeSelect',
  'TreeTable',
  'TriStateCheckbox'
] as const

/**
 * Bundle optimization tips
 */
export const OPTIMIZATION_TIPS = [
  'Import PrimeVue components individually rather than the entire library',
  'Use dynamic imports for heavy components that are not always needed',
  'Configure Vite to split PrimeVue components into separate chunks',
  'Enable tree shaking in your build configuration',
  'Consider lazy loading for components used in specific routes only',
  'Monitor bundle size regularly with tools like webpack-bundle-analyzer',
  'Use PrimeVue\'s unstyled mode if you need maximum customization',
  'Consider using PrimeVue\'s headless components for minimal bundle impact'
] as const