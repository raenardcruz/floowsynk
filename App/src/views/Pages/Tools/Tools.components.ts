import Section from '../Tools/Section/Section.vue'

import { section_styles } from '@/views/Pages/Tools/Section/styles.config'

export enum COMPONENT_GROUPS {
  CONTAINERS = 'Containers',
}

export const SECTIONS = [
  {
    id: 1,
    name: 'Basic',
    icon: 'src/components/Icons/components/basic.svg',
    groups: [
      COMPONENT_GROUPS.CONTAINERS
    ]
  }
]

export enum COMPONENT_NAMES {
  SECTION = 'section',
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
  }
}

