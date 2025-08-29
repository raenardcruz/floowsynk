import Section from '../Tools/Section/Section.vue'
import MenuBar from './MenuBar/MenuBar.vue'

import { section_styles } from '@/views/Pages/Tools/Section/config'
import { menu_bar_properties } from '@/views/Pages/Tools/MenuBar/config'

export enum COMPONENT_GROUPS {
  CONTAINERS = 'Containers',
  COMPONENTS = 'Components',
}

export const SECTIONS = [
  {
    id: 1,
    name: 'Basic',
    icon: 'src/components/Icons/components/common.svg',
    groups: [
      COMPONENT_GROUPS.CONTAINERS
    ]
  },
  {
    id: 2,
    name: 'Menu',
    icon: 'src/components/Icons/components/menu.svg',
    groups: [
      COMPONENT_GROUPS.COMPONENTS
    ]
  }
]

export enum COMPONENT_NAMES {
  SECTION = 'section',
  MENUABR = 'menuabr'
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
  [COMPONENT_NAMES.SECTION]: {
    icon: 'src/components/Icons/components/section.svg',
    label: 'Div / Section',
    group: COMPONENT_GROUPS.CONTAINERS,
    component: Section,
    styleConfig: section_styles
  },
  [COMPONENT_NAMES.MENUABR]: {
    icon: 'src/components/Icons/components/header.svg',
    label: 'Menu bar',
    group: COMPONENT_GROUPS.COMPONENTS,
    component: MenuBar,
    propertiesConfig: menu_bar_properties
  }
}

