import Section from '../Tools/Section/Section.vue'
import Heading from '../Tools/Heading/Heading.vue'
import Paragraph from '../Tools/Paragraph/Paragraph.vue'

import { section_styles } from '@/views/Pages/Tools/Section/styles.config'
import { heading_styles } from '@/views/Pages/Tools/Heading/styles.config'
import { paragraph_styles } from '@/views/Pages/Tools/Paragraph/style.config'

import { heading_properties } from '@/views/Pages/Tools/Heading/properties.config'

export enum COMPONENT_GROUPS {
  TEXT = 'Text',
  MEDIA = 'Media',
  BUTTONS_AND_LINKS = 'Buttons and Links',
  CONTAINERS = 'Containers',
  GRID = 'Grid',
  FLEXBOX = 'Flexbox',
  NAVIGATION = 'Navigation',
  SECTIONS = 'Sections',
  INPUT_FIELDS = 'Input Fields',
  SELECTION_AND_OPTIONS = 'Selection and Options',
  FORM_BUTTON = 'Form Button',
  DYNAMIC_CONTENT = 'Dynamic Content',
  SOCIAL = 'Social',
  EMBEDDINGS = 'Embeddings',
  INTERACTIVE = 'Interactive',
}

export const SECTIONS = [
  {
    id: 1,
    name: 'Basic',
    icon: 'src/components/Icons/components/basic.svg',
    groups: [
      COMPONENT_GROUPS.TEXT,
      COMPONENT_GROUPS.MEDIA,
      COMPONENT_GROUPS.BUTTONS_AND_LINKS,
      COMPONENT_GROUPS.CONTAINERS
    ]
  },
  {
    id: 2,
    name: 'Layout',
    icon: 'src/components/Icons/components/layout.svg',
    groups: [
      COMPONENT_GROUPS.GRID,
      COMPONENT_GROUPS.FLEXBOX,
      COMPONENT_GROUPS.NAVIGATION,
      COMPONENT_GROUPS.SECTIONS
    ]
  },
  {
    id: 3,
    name: 'Forms',
    icon: 'src/components/Icons/components/forms.svg',
    groups: [
      COMPONENT_GROUPS.INPUT_FIELDS,
      COMPONENT_GROUPS.SELECTION_AND_OPTIONS,
      COMPONENT_GROUPS.FORM_BUTTON
    ]
  },
  {
    id: 4,
    name: 'Advanced',
    icon: 'src/components/Icons/components/advanced.svg',
    groups: [
      COMPONENT_GROUPS.DYNAMIC_CONTENT,
      COMPONENT_GROUPS.SOCIAL,
      COMPONENT_GROUPS.EMBEDDINGS,
      COMPONENT_GROUPS.INTERACTIVE
    ]
  }
]

export enum COMPONENT_NAMES {
  HEADING = 'heading',
  PARAGRAPH = 'paragraph',
  LIST = 'list',
  IMAGE = 'image',
  BUTTON = 'button',
  LINK = 'link',
  SECTION = 'section',
  ROW = 'row',
  COLUMN = 'column',
  CONTAINER = 'container',
  CARD = 'card',
  GRID_CONTAINER = 'grid-container',
  GRID_ITEM = 'grid-item',
  FLEX_CONTAINER = 'flex-container',
  FLEX_ITEM = 'flex-item',
  NAVBAR = 'navbar',
  MENU = 'menu',
  BREADCRUMBS = 'breadcrumbs',
  HEADER = 'header',
  FOOTER = 'footer',
  CALL_TO_ACTION = 'call-to-action',
  TESTIMONIAL_SECTION = 'testimonial-section',
  CONTACT_FORM_SECTION = 'contact-form-section',
  TEXT_INPUT = 'text-input',
  TEXT_AREA = 'text-area',
  EMAIL_INPUT = 'email-input',
  PASSWORD_INPUT = 'password-input',
  NUMBER_INPUT = 'number-input',
  DATE_PICKER = 'date-picker',
  TIME_PICKER = 'time-picker',
  FILE_UPLOAD = 'file-upload',
  CHECKBOX = 'checkbox',
  RADIO_BUTTON = 'radio-button',
  DROPDOWN = 'dropdown',
  MULTI_SELECT = 'multi-select',
  SUBMIT_BUTTON = 'submit-button',
  RESET_BUTTON = 'reset-button',
  IMAGE_GALLERY = 'image-gallery',
  SLIDER = 'slider',
  ACCORDION = 'accordion',
  TABS = 'tabs',
  MODAL = 'modal',
  SOCIAL_SHARE_BUTTONS = 'social-share-buttons',
  CUSTOM_HTML = 'custom-html',
  MAP_EMBED = 'map-embed',
  IFRAME = 'iframe',
  COUNTER = 'counter',
  PROGRESS_BAR = 'progress-bar',
  TIMELINE = 'timeline',
}

export interface ComponentInfo {
  icon: string
  label: string
  group: string
  component: any | null
  description?: string
  styleConfig?: Array<any> | null
  propertiesConfig?: Array<any> | null
}

export const COMPONENT_MAPPING: Record<COMPONENT_NAMES, ComponentInfo> = {
  [COMPONENT_NAMES.HEADING]: {
    icon: 'src/components/Icons/components/heading.svg',
    label: 'Heading',
    group: COMPONENT_GROUPS.TEXT,
    component: Heading,
    styleConfig: heading_styles,
    propertiesConfig: heading_properties
  },
  [COMPONENT_NAMES.PARAGRAPH]: {
    icon: 'src/components/Icons/components/paragraph.svg',
    label: 'Paragraph',
    group: COMPONENT_GROUPS.TEXT,
    component: Paragraph,
    styleConfig: paragraph_styles
  },
  [COMPONENT_NAMES.LIST]: {
    icon: 'src/components/Icons/components/list.svg',
    label: 'List',
    group: COMPONENT_GROUPS.TEXT,
    component: null
  },
  [COMPONENT_NAMES.IMAGE]: {
    icon: 'src/components/Icons/components/image.svg',
    label: 'Image',
    group: COMPONENT_GROUPS.MEDIA,
    component: null
  },
  [COMPONENT_NAMES.BUTTON]: {
    icon: 'src/components/Icons/components/button.svg',
    label: 'Button',
    group: COMPONENT_GROUPS.BUTTONS_AND_LINKS,
    component: null
  },
  [COMPONENT_NAMES.LINK]: {
    icon: 'src/components/Icons/components/link.svg',
    label: 'Link',
    group: COMPONENT_GROUPS.BUTTONS_AND_LINKS,
    component: null
  },
  [COMPONENT_NAMES.SECTION]: {
    icon: 'src/components/Icons/components/section.svg',
    label: 'Div / Section',
    group: COMPONENT_GROUPS.CONTAINERS,
    component: Section,
    styleConfig: section_styles
  },
  [COMPONENT_NAMES.ROW]: {
    icon: 'src/components/Icons/components/row.svg',
    label: 'Row',
    group: COMPONENT_GROUPS.CONTAINERS,
    component: null
  },
  [COMPONENT_NAMES.COLUMN]: {
    icon: 'src/components/Icons/components/column.svg',
    label: 'Column',
    group: COMPONENT_GROUPS.CONTAINERS,
    component: null
  },
  [COMPONENT_NAMES.CONTAINER]: {
    icon: 'src/components/Icons/components/container.svg',
    label: 'Container',
    group: COMPONENT_GROUPS.CONTAINERS,
    component: null
  },
  [COMPONENT_NAMES.CARD]: {
    icon: 'src/components/Icons/components/card.svg',
    label: 'Card',
    group: COMPONENT_GROUPS.CONTAINERS,
    component: null
  },
  [COMPONENT_NAMES.GRID_CONTAINER]: {
    icon: 'src/components/Icons/components/grid-container.svg',
    label: 'Grid Container',
    group: COMPONENT_GROUPS.GRID,
    component: null
  },
  [COMPONENT_NAMES.GRID_ITEM]: {
    icon: 'src/components/Icons/components/grid-item.svg',
    label: 'Grid Item',
    group: COMPONENT_GROUPS.GRID,
    component: null
  },
  [COMPONENT_NAMES.FLEX_CONTAINER]: {
    icon: 'src/components/Icons/components/flex-container.svg',
    label: 'Flex Container',
    group: COMPONENT_GROUPS.FLEXBOX,
    component: null
  },
  [COMPONENT_NAMES.FLEX_ITEM]: {
    icon: 'src/components/Icons/components/flex-item.svg',
    label: 'Flex Item',
    group: COMPONENT_GROUPS.FLEXBOX,
    component: null
  },
  [COMPONENT_NAMES.NAVBAR]: {
    icon: 'src/components/Icons/components/navbar.svg',
    label: 'Navbar',
    group: COMPONENT_GROUPS.NAVIGATION,
    component: null
  },
  [COMPONENT_NAMES.MENU]: {
    icon: 'src/components/Icons/components/menu.svg',
    label: 'Menu',
    group: COMPONENT_GROUPS.NAVIGATION,
    component: null
  },
  [COMPONENT_NAMES.BREADCRUMBS]: {
    icon: 'src/components/Icons/components/breadcrumbs.svg',
    label: 'Breadcrumbs',
    group: COMPONENT_GROUPS.NAVIGATION,
    component: null
  },
  [COMPONENT_NAMES.HEADER]: {
    icon: 'src/components/Icons/components/header.svg',
    label: 'Header',
    group: COMPONENT_GROUPS.SECTIONS,
    component: null
  },
  [COMPONENT_NAMES.FOOTER]: {
    icon: 'src/components/Icons/components/footer.svg',
    label: 'Footer',
    group: COMPONENT_GROUPS.SECTIONS,
    component: null
  },
  [COMPONENT_NAMES.CALL_TO_ACTION]: {
    icon: 'src/components/Icons/components/call-to-action.svg',
    label: 'Call to Action',
    group: COMPONENT_GROUPS.SECTIONS,
    component: null
  },
  [COMPONENT_NAMES.TESTIMONIAL_SECTION]: {
    icon: 'src/components/Icons/components/testimonial-section.svg',
    label: 'Testimonial Section',
    group: COMPONENT_GROUPS.SECTIONS,
    component: null
  },
  [COMPONENT_NAMES.CONTACT_FORM_SECTION]: {
    icon: 'src/components/Icons/components/contact-form-section.svg',
    label: 'Contact Form Section',
    group: COMPONENT_GROUPS.SECTIONS,
    component: null
  },
  [COMPONENT_NAMES.TEXT_INPUT]: {
    icon: 'src/components/Icons/components/input.svg',
    label: 'Text Input',
    group: COMPONENT_GROUPS.INPUT_FIELDS,
    component: null
  },
  [COMPONENT_NAMES.TEXT_AREA]: {
    icon: 'src/components/Icons/components/text-area.svg',
    label: 'Text Area',
    group: COMPONENT_GROUPS.INPUT_FIELDS,
    component: null
  },
  [COMPONENT_NAMES.EMAIL_INPUT]: {
    icon: 'src/components/Icons/components/email-input.svg',
    label: 'Email Input',
    group: COMPONENT_GROUPS.INPUT_FIELDS,
    component: null
  },
  [COMPONENT_NAMES.PASSWORD_INPUT]: {
    icon: 'src/components/Icons/components/password-input.svg',
    label: 'Password Input',
    group: COMPONENT_GROUPS.INPUT_FIELDS,
    component: null
  },
  [COMPONENT_NAMES.NUMBER_INPUT]: {
    icon: 'src/components/Icons/components/number-input.svg',
    label: 'Number Input',
    group: COMPONENT_GROUPS.INPUT_FIELDS,
    component: null
  },
  [COMPONENT_NAMES.DATE_PICKER]: {
    icon: 'src/components/Icons/components/date-picker.svg',
    label: 'Date Picker',
    group: COMPONENT_GROUPS.INPUT_FIELDS,
    component: null
  },
  [COMPONENT_NAMES.TIME_PICKER]: {
    icon: 'src/components/Icons/components/time-picker.svg',
    label: 'Time Picker',
    group: COMPONENT_GROUPS.INPUT_FIELDS,
    component: null
  },
  [COMPONENT_NAMES.FILE_UPLOAD]: {
    icon: 'src/components/Icons/components/file-upload.svg',
    label: 'File Upload',
    group: COMPONENT_GROUPS.INPUT_FIELDS,
    component: null
  },
  [COMPONENT_NAMES.CHECKBOX]: {
    icon: 'src/components/Icons/components/checkbox.svg',
    label: 'Checkbox',
    group: COMPONENT_GROUPS.SELECTION_AND_OPTIONS,
    component: null
  },
  [COMPONENT_NAMES.RADIO_BUTTON]: {
    icon: 'src/components/Icons/components/radio-button.svg',
    label: 'Radio Button',
    group: COMPONENT_GROUPS.SELECTION_AND_OPTIONS,
    component: null
  },
  [COMPONENT_NAMES.DROPDOWN]: {
    icon: 'src/components/Icons/components/dropdown.svg',
    label: 'Dropdown',
    group: COMPONENT_GROUPS.SELECTION_AND_OPTIONS,
    component: null
  },
  [COMPONENT_NAMES.MULTI_SELECT]: {
    icon: 'src/components/Icons/components/multi-select.svg',
    label: 'Multi-Select',
    group: COMPONENT_GROUPS.SELECTION_AND_OPTIONS,
    component: null
  },
  [COMPONENT_NAMES.SUBMIT_BUTTON]: {
    icon: 'src/components/Icons/components/submit-button.svg',
    label: 'Submit Button',
    group: COMPONENT_GROUPS.FORM_BUTTON,
    component: null
  },
  [COMPONENT_NAMES.RESET_BUTTON]: {
    icon: 'src/components/Icons/components/reset-button.svg',
    label: 'Reset Button',
    group: COMPONENT_GROUPS.FORM_BUTTON,
    component: null
  },
  [COMPONENT_NAMES.IMAGE_GALLERY]: {
    icon: 'src/components/Icons/components/image-gallery.svg',
    label: 'Image Gallery/Carousel',
    group: COMPONENT_GROUPS.DYNAMIC_CONTENT,
    component: null
  },
  [COMPONENT_NAMES.SLIDER]: {
    icon: 'src/components/Icons/components/slider.svg',
    label: 'Slider',
    group: COMPONENT_GROUPS.DYNAMIC_CONTENT,
    component: null
  },
  [COMPONENT_NAMES.ACCORDION]: {
    icon: 'src/components/Icons/components/accordion.svg',
    label: 'Accordion',
    group: COMPONENT_GROUPS.DYNAMIC_CONTENT,
    component: null
  },
  [COMPONENT_NAMES.TABS]: {
    icon: 'src/components/Icons/components/tabs.svg',
    label: 'Tabs',
    group: COMPONENT_GROUPS.DYNAMIC_CONTENT,
    component: null
  },
  [COMPONENT_NAMES.MODAL]: {
    icon: 'src/components/Icons/components/modal.svg',
    label: 'Modal/Popup',
    group: COMPONENT_GROUPS.DYNAMIC_CONTENT,
    component: null
  },
  [COMPONENT_NAMES.SOCIAL_SHARE_BUTTONS]: {
    icon: 'src/components/Icons/components/social-share-buttons.svg',
    label: 'Social Share Buttons',
    group: COMPONENT_GROUPS.SOCIAL,
    component: null
  },
  [COMPONENT_NAMES.CUSTOM_HTML]: {
    icon: 'src/components/Icons/components/custom-html.svg',
    label: 'Custom Html Code Embed',
    group: COMPONENT_GROUPS.EMBEDDINGS,
    component: null
  },
  [COMPONENT_NAMES.MAP_EMBED]: {
    icon: 'src/components/Icons/components/map-embed.svg',
    label: 'Map Embed',
    group: COMPONENT_GROUPS.EMBEDDINGS,
    component: null
  },
  [COMPONENT_NAMES.IFRAME]: {
    icon: 'src/components/Icons/components/iframe.svg',
    label: 'iframe',
    group: COMPONENT_GROUPS.EMBEDDINGS,
    component: null
  },
  [COMPONENT_NAMES.COUNTER]: {
    icon: 'src/components/Icons/components/counter.svg',
    label: 'Counter',
    group: COMPONENT_GROUPS.INTERACTIVE,
    component: null
  },
  [COMPONENT_NAMES.PROGRESS_BAR]: {
    icon: 'src/components/Icons/components/progress-bar.svg',
    label: 'Progress Bar',
    group: COMPONENT_GROUPS.INTERACTIVE,
    component: null
  },
  [COMPONENT_NAMES.TIMELINE]: {
    icon: 'src/components/Icons/components/timeline.svg',
    label: 'Timeline',
    group: COMPONENT_GROUPS.INTERACTIVE,
    component: null
  }
}

