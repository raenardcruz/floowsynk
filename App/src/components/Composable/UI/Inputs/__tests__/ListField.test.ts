/**
 * Unit tests for ListField wrapper component
 */

import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ListField from '../ListField.vue'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import { ArrayDataType } from 'proto/workflow/workflow_pb'

// Mock the protocol buffer imports
vi.mock('proto/workflow/workflow_pb', () => ({
  ArrayDataType: {
    STRING: 0,
    INT: 1,
    BOOL: 2,
    KEYVALUE: 3
  },
  NodeDataArray: {},
  KeyValue: {}
}))

// Test setup
const createWrapper = (props = {}) => {
  return mount(ListField, {
    props: {
      modelValue: [],
      ...props
    },
    global: {
      plugins: [
        [PrimeVue, { theme: { preset: Aura } }]
      ]
    }
  })
}

describe('ListField', () => {
  describe('Rendering', () => {
    it('should render with default props', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.listfield-wrapper').exists()).toBe(true)
      expect(wrapper.find('.listfield-wrapper__items').exists()).toBe(true)
      expect(wrapper.find('.listfield-wrapper__actions').exists()).toBe(true)
    })

    it('should render label when provided', () => {
      const wrapper = createWrapper({ label: 'Test List' })
      const label = wrapper.find('.listfield-wrapper__label')
      expect(label.exists()).toBe(true)
      expect(label.text()).toContain('Test List')
    })

    it('should show required indicator when required', () => {
      const wrapper = createWrapper({ 
        label: 'Test List',
        required: true 
      })
      const required = wrapper.find('.listfield-wrapper__required')
      expect(required.exists()).toBe(true)
      expect(required.text()).toBe('*')
    })

    it('should apply disabled class when disabled', () => {
      const wrapper = createWrapper({ disabled: true })
      expect(wrapper.find('.listfield-wrapper--disabled').exists()).toBe(true)
    })

    it('should apply invalid class when invalid', () => {
      const wrapper = createWrapper({ invalid: true })
      expect(wrapper.find('.listfield-wrapper--invalid').exists()).toBe(true)
    })
  })

  describe('Type Selector', () => {
    it('should show type selector by default', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.listfield-wrapper__type-selector').exists()).toBe(true)
    })

    it('should hide type selector when showTypeSelector is false', () => {
      const wrapper = createWrapper({ showTypeSelector: false })
      expect(wrapper.find('.listfield-wrapper__type-selector').exists()).toBe(false)
    })

    it('should filter available types based on availableTypes prop', () => {
      const wrapper = createWrapper({ 
        availableTypes: ['string', 'number'] 
      })
      const select = wrapper.findComponent({ name: 'Select' })
      expect(select.exists()).toBe(true)
      // Note: We can't easily test the options without mocking the Select component
    })
  })

  describe('Add/Remove Items', () => {
    it('should show add button', () => {
      const wrapper = createWrapper()
      const addBtn = wrapper.find('.listfield-wrapper__add-btn')
      expect(addBtn.exists()).toBe(true)
    })

    it('should disable add button when disabled', () => {
      const wrapper = createWrapper({ disabled: true })
      const addBtn = wrapper.findComponent({ name: 'Button' })
      expect(addBtn.props('disabled')).toBe(true)
    })

    it('should disable add button when max items reached', () => {
      const wrapper = createWrapper({ 
        maxItems: 2,
        modelValue: ['item1', 'item2']
      })
      const addBtn = wrapper.find('.listfield-wrapper__add-btn')
      const buttonComponent = addBtn.findComponent({ name: 'Button' })
      expect(buttonComponent.props('disabled')).toBe(true)
    })

    it('should show item count when maxItems is set', () => {
      const wrapper = createWrapper({ 
        maxItems: 5,
        modelValue: ['item1', 'item2']
      })
      const info = wrapper.find('.listfield-wrapper__info')
      expect(info.exists()).toBe(true)
      expect(info.text()).toContain('2 items')
      expect(info.text()).toContain('max 5')
    })
  })

  describe('Protocol Buffer Compatibility', () => {
    it('should handle protocol buffer model format', () => {
      const pbModel = {
        type: ArrayDataType.STRING,
        stringitemsList: ['item1', 'item2'],
        intitemsList: [],
        boolitemsList: [],
        keyvalueitemsList: []
      }
      
      const wrapper = createWrapper({ modelValue: pbModel })
      const items = wrapper.findAll('.listfield-wrapper__item')
      expect(items).toHaveLength(2)
    })

    it('should handle empty protocol buffer model', () => {
      const pbModel = {
        type: ArrayDataType.STRING,
        stringitemsList: [],
        intitemsList: [],
        boolitemsList: [],
        keyvalueitemsList: []
      }
      
      const wrapper = createWrapper({ modelValue: pbModel })
      const items = wrapper.findAll('.listfield-wrapper__item')
      expect(items).toHaveLength(0)
    })
  })

  describe('Simple Array Compatibility', () => {
    it('should handle simple array format', () => {
      const wrapper = createWrapper({ modelValue: ['item1', 'item2', 'item3'] })
      const items = wrapper.findAll('.listfield-wrapper__item')
      expect(items).toHaveLength(3)
    })

    it('should handle empty array', () => {
      const wrapper = createWrapper({ modelValue: [] })
      const items = wrapper.findAll('.listfield-wrapper__item')
      expect(items).toHaveLength(0)
    })
  })

  describe('Events', () => {
    it('should emit update:modelValue when items change', async () => {
      const wrapper = createWrapper({ modelValue: [] })
      
      // Simulate adding an item through exposed method
      const vm = wrapper.vm as any
      vm.addItem()
      
      await wrapper.vm.$nextTick()
      
      const emitted = wrapper.emitted('update:modelValue')
      expect(emitted).toBeTruthy()
    })

    it('should emit item-added when item is added', async () => {
      const wrapper = createWrapper({ modelValue: [] })
      
      const vm = wrapper.vm as any
      vm.addItem()
      
      await wrapper.vm.$nextTick()
      
      const emitted = wrapper.emitted('item-added')
      expect(emitted).toBeTruthy()
    })

    it('should emit item-removed when item is removed', async () => {
      const wrapper = createWrapper({ modelValue: ['item1'] })
      
      const vm = wrapper.vm as any
      vm.removeItem(0)
      
      await wrapper.vm.$nextTick()
      
      const emitted = wrapper.emitted('item-removed')
      expect(emitted).toBeTruthy()
    })

    it('should emit type-changed when data type changes', async () => {
      const wrapper = createWrapper()
      
      const vm = wrapper.vm as any
      vm.setDataType('number')
      
      await wrapper.vm.$nextTick()
      
      const emitted = wrapper.emitted('type-changed')
      expect(emitted).toBeTruthy()
      expect(emitted![0]).toEqual(['number', 'string'])
    })
  })

  describe('Exposed Methods', () => {
    it('should expose required methods', () => {
      const wrapper = createWrapper()
      const vm = wrapper.vm as any
      
      expect(typeof vm.addItem).toBe('function')
      expect(typeof vm.removeItem).toBe('function')
      expect(typeof vm.clearItems).toBe('function')
      expect(typeof vm.getItems).toBe('function')
      expect(typeof vm.setDataType).toBe('function')
    })

    it('should clear items when clearItems is called', async () => {
      const wrapper = createWrapper({ modelValue: ['item1', 'item2'] })
      const vm = wrapper.vm as any
      
      vm.clearItems()
      await wrapper.vm.$nextTick()
      
      const items = wrapper.findAll('.listfield-wrapper__item')
      expect(items).toHaveLength(0)
    })

    it('should return current items when getItems is called', () => {
      const wrapper = createWrapper({ modelValue: ['item1', 'item2'] })
      const vm = wrapper.vm as any
      
      const items = vm.getItems()
      expect(items).toHaveLength(2)
      expect(items[0].value).toBe('item1')
      expect(items[1].value).toBe('item2')
    })
  })

  describe('Accessibility', () => {
    it('should apply data-testid when provided', () => {
      const wrapper = createWrapper({ 'data-testid': 'test-listfield' })
      expect(wrapper.find('[data-testid="test-listfield"]').exists()).toBe(true)
    })

    it('should have proper aria-label for remove buttons', () => {
      const wrapper = createWrapper({ modelValue: ['item1'] })
      const removeBtn = wrapper.find('.listfield-wrapper__remove-btn')
      const buttonComponent = removeBtn.findComponent({ name: 'Button' })
      expect(buttonComponent.attributes('aria-label')).toBe('Remove item 1')
    })
  })

  describe('Validation', () => {
    it('should respect maxItems constraint', () => {
      const wrapper = createWrapper({ 
        maxItems: 2,
        modelValue: ['item1', 'item2']
      })
      
      const vm = wrapper.vm as any
      expect(vm.isMaxItemsReached).toBe(true)
    })

    it('should show appropriate add button label when max reached', () => {
      const wrapper = createWrapper({ 
        maxItems: 1,
        modelValue: ['item1']
      })
      
      const addBtn = wrapper.findComponent({ name: 'Button' })
      expect(addBtn.props('label')).toBe('Maximum reached')
    })
  })

  describe('Edge Cases', () => {
    it('should handle undefined modelValue gracefully', () => {
      const wrapper = createWrapper({ modelValue: undefined })
      const items = wrapper.findAll('.listfield-wrapper__item')
      expect(items).toHaveLength(0)
    })

    it('should handle null modelValue gracefully', () => {
      const wrapper = createWrapper({ modelValue: null })
      const items = wrapper.findAll('.listfield-wrapper__item')
      expect(items).toHaveLength(0)
    })
  })
})