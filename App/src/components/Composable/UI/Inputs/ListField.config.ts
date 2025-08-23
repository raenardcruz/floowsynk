/**
 * Configuration and defaults for ListField wrapper component
 */

import type { ListFieldWrapperProps, ListFieldOption } from './ListField.types'
import TextInput from './TextInput.vue'
import Checkbox from './Checkbox.vue'
import KeyValue from './KeyValue.vue'

export const defaultListFieldProps: Partial<ListFieldWrapperProps> = {
  disabled: false,
  required: false,
  invalid: false,
  draggable: false,
  maxItems: undefined,
  minItems: 0,
}

export const listFieldTypeOptions: ListFieldOption[] = [
  {
    value: 'string',
    label: 'String',
    component: TextInput,
    defaultValue: ''
  },
  {
    value: 'number',
    label: 'Number',
    component: TextInput,
    defaultValue: 0
  },
  {
    value: 'boolean',
    label: 'Boolean',
    component: Checkbox,
    defaultValue: false
  },
  {
    value: 'keyvalue',
    label: 'Key Value Pair',
    component: KeyValue,
    defaultValue: { key: '', value: '' }
  }
]

export const getComponentPropsForType = (type: string, index: number) => {
  const propsMap = {
    string: {
      placeholder: 'Enter text',
      label: `List Item ${index + 1}`
    },
    number: {
      placeholder: 'Enter number',
      label: `List Item ${index + 1}`
    },
    boolean: {
      label: `List Item ${index + 1}`
    },
    keyvalue: {
      label: `List Item ${index + 1}`
    }
  }
  
  return propsMap[type as keyof typeof propsMap] || {}
}