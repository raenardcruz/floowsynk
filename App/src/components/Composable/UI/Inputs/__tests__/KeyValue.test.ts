/**
 * Unit tests for KeyValue wrapper component
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import KeyValue from '../KeyValue.vue'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import type { KeyValuePair } from '../KeyValue.types'

// Test setup
const createWrapper = (props = {}) => {
  return mount(KeyValue, {
    props: {
      modelValue: { key: '', value: '' },
      ...props
    },
    global: {
      plugins: [
        [PrimeVue, { theme: { preset: Aura } }]
      ]
    }
  })
}

describe('KeyValue', () => {
  describe('Rendering', () => {
    it('should render with default props', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.keyvalue-wrapper').exists()).toBe(true)
      expect(wrapper.find('.keyvalue-wrapper__inputs').exists()).toBe(true)
    })

    it('should render label when provided', () => {
      const wrapper = createWrapper({ label: 'Test Label' })
      const label = wrapper.find('.keyvalue-wrapper__label')
      expect(label.exists()).toBe(true)
      expect(label.text()).toContain('Test Label')
    })

    it('should show required indicator when required', () => {
      const wrapper = createWrapper({ 
        label: 'Test Label',
        required: true 
      })
      const required = wrapper.find('.keyvalue-wrapper__required')
      expect(required.exists()).toBe(true)
      expect(required.text()).toBe('*')
    })

    it('should apply disabled class when disabled', () => {
      const wrapper = createWrapper({ disabled: true })
      expect(wrapper.find('.keyvalue-wrapper--disabled').exists()).toBe(true)
    })

    it('should apply invalid class when invalid', () => {
      const wrapper = createWrapper({ invalid: true })
      expect(wrapper.find('.keyvalue-wrapper--invalid').exists()).toBe(true)
    })
  })

  describe('Model Value', () => {
    it('should display initial key and value', () => {
      const modelValue: KeyValuePair = { key: 'testKey', value: 'testValue' }
      const wrapper = createWrapper({ modelValue })
      
      const keyInput = wrapper.find('.keyvalue-wrapper__key-input')
      const valueInput = wrapper.find('.keyvalue-wrapper__value-input')
      
      expect((keyInput.element as HTMLInputElement).value).toBe('testKey')
      expect((valueInput.element as HTMLInputElement).value).toBe('testValue')
    })

    it('should emit update:modelValue when key changes', async () => {
      const wrapper = createWrapper()
      const keyInput = wrapper.find('.keyvalue-wrapper__key-input')
      
      await keyInput.setValue('newKey')
      
      const emitted = wrapper.emitted('update:modelValue')
      expect(emitted).toBeTruthy()
      expect(emitted![0][0]).toEqual({ key: 'newKey', value: '' })
    })

    it('should emit update:modelValue when value changes', async () => {
      const wrapper = createWrapper()
      const valueInput = wrapper.find('.keyvalue-wrapper__value-input')
      
      await valueInput.setValue('newValue')
      
      const emitted = wrapper.emitted('update:modelValue')
      expect(emitted).toBeTruthy()
      expect(emitted![0][0]).toEqual({ key: '', value: 'newValue' })
    })

    it('should preserve existing key when updating value', async () => {
      const modelValue: KeyValuePair = { key: 'existingKey', value: '' }
      const wrapper = createWrapper({ modelValue })
      const valueInput = wrapper.find('.keyvalue-wrapper__value-input')
      
      await valueInput.setValue('newValue')
      
      const emitted = wrapper.emitted('update:modelValue')
      expect(emitted![0][0]).toEqual({ key: 'existingKey', value: 'newValue' })
    })

    it('should preserve existing value when updating key', async () => {
      const modelValue: KeyValuePair = { key: '', value: 'existingValue' }
      const wrapper = createWrapper({ modelValue })
      const keyInput = wrapper.find('.keyvalue-wrapper__key-input')
      
      await keyInput.setValue('newKey')
      
      const emitted = wrapper.emitted('update:modelValue')
      expect(emitted![0][0]).toEqual({ key: 'newKey', value: 'existingValue' })
    })
  })

  describe('Events', () => {
    it('should emit key-focus when key input is focused', async () => {
      const wrapper = createWrapper()
      const keyInput = wrapper.find('.keyvalue-wrapper__key-input')
      
      await keyInput.trigger('focus')
      
      expect(wrapper.emitted('key-focus')).toBeTruthy()
    })

    it('should emit key-blur when key input is blurred', async () => {
      const wrapper = createWrapper()
      const keyInput = wrapper.find('.keyvalue-wrapper__key-input')
      
      await keyInput.trigger('blur')
      
      expect(wrapper.emitted('key-blur')).toBeTruthy()
    })

    it('should emit value-focus when value input is focused', async () => {
      const wrapper = createWrapper()
      const valueInput = wrapper.find('.keyvalue-wrapper__value-input')
      
      await valueInput.trigger('focus')
      
      expect(wrapper.emitted('value-focus')).toBeTruthy()
    })

    it('should emit value-blur when value input is blurred', async () => {
      const wrapper = createWrapper()
      const valueInput = wrapper.find('.keyvalue-wrapper__value-input')
      
      await valueInput.trigger('blur')
      
      expect(wrapper.emitted('value-blur')).toBeTruthy()
    })
  })

  describe('Exposed Methods', () => {
    it('should expose keyInputRef and valueInputRef', () => {
      const wrapper = createWrapper()
      const vm = wrapper.vm as any
      
      expect(vm.keyInputRef).toBeDefined()
      expect(vm.valueInputRef).toBeDefined()
    })

    it('should expose focus and blur methods', () => {
      const wrapper = createWrapper()
      const vm = wrapper.vm as any
      
      expect(typeof vm.focusKey).toBe('function')
      expect(typeof vm.focusValue).toBe('function')
      expect(typeof vm.blurKey).toBe('function')
      expect(typeof vm.blurValue).toBe('function')
    })
  })

  describe('Accessibility', () => {
    it('should have proper labels for inputs', () => {
      const wrapper = createWrapper()
      const labels = wrapper.findAll('label')
      
      expect(labels).toHaveLength(2)
      expect(labels[0].text()).toBe('Key')
      expect(labels[1].text()).toBe('Value')
    })

    it('should associate labels with inputs via for/id attributes', () => {
      const wrapper = createWrapper()
      const keyInput = wrapper.find('.keyvalue-wrapper__key-input')
      const valueInput = wrapper.find('.keyvalue-wrapper__value-input')
      const labels = wrapper.findAll('label')
      
      expect(labels[0].attributes('for')).toBe(keyInput.attributes('id'))
      expect(labels[1].attributes('for')).toBe(valueInput.attributes('id'))
    })

    it('should apply data-testid when provided', () => {
      const wrapper = createWrapper({ 'data-testid': 'test-keyvalue' })
      expect(wrapper.find('[data-testid="test-keyvalue"]').exists()).toBe(true)
    })
  })

  describe('Styling Variants', () => {
    it('should apply variant classes', () => {
      const wrapper = createWrapper({ variant: 'filled' })
      const keyInput = wrapper.find('.keyvalue-wrapper__key-input')
      const valueInput = wrapper.find('.keyvalue-wrapper__value-input')
      
      expect(keyInput.classes()).toContain('p-inputtext-filled')
      expect(valueInput.classes()).toContain('p-inputtext-filled')
    })

    it('should apply size classes', () => {
      const wrapper = createWrapper({ size: 'large' })
      const keyInput = wrapper.find('.keyvalue-wrapper__key-input')
      const valueInput = wrapper.find('.keyvalue-wrapper__value-input')
      
      expect(keyInput.classes()).toContain('p-inputtext-lg')
      expect(valueInput.classes()).toContain('p-inputtext-lg')
    })
  })

  describe('Form Integration', () => {
    it('should handle empty modelValue gracefully', () => {
      const wrapper = createWrapper({ modelValue: undefined })
      const keyInput = wrapper.find('.keyvalue-wrapper__key-input')
      const valueInput = wrapper.find('.keyvalue-wrapper__value-input')
      
      expect((keyInput.element as HTMLInputElement).value).toBe('')
      expect((valueInput.element as HTMLInputElement).value).toBe('')
    })

    it('should work with form validation', async () => {
      const wrapper = createWrapper({ 
        required: true,
        invalid: true 
      })
      
      expect(wrapper.find('.keyvalue-wrapper--required').exists()).toBe(true)
      expect(wrapper.find('.keyvalue-wrapper--invalid').exists()).toBe(true)
    })
  })
})