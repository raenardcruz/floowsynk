/**
 * Unit tests for Checkbox wrapper component
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import Checkbox from '../Checkbox.vue'
import type { CheckboxProps } from '../Checkbox.types'

describe('Checkbox', () => {
  let wrapper: VueWrapper<any>

  const createWrapper = (props: Partial<CheckboxProps> = {}) => {
    return mount(Checkbox, {
      props: {
        modelValue: false,
        ...props
      }
    })
  }

  beforeEach(() => {
    wrapper?.unmount()
  })

  describe('API Compatibility', () => {
    it('should accept all legacy props', () => {
      wrapper = createWrapper({
        id: 'test-checkbox',
        label: 'Checkbox Label',
        value: 'checkbox-value',
        disabled: false,
        readonly: false,
        invalid: false,
        required: true,
        indeterminate: false,
        name: 'test-name',
        tabindex: 1,
        ariaLabel: 'Test checkbox',
        ariaLabelledby: 'label-id'
      })

      expect(wrapper.exists()).toBe(true)
      expect(wrapper.props('label')).toBe('Checkbox Label')
      expect(wrapper.props('value')).toBe('checkbox-value')
      expect(wrapper.props('name')).toBe('test-name')
      expect(wrapper.props('tabindex')).toBe(1)
      expect(wrapper.props('ariaLabel')).toBe('Test checkbox')
    })

    it('should emit expected events', async () => {
      wrapper = createWrapper({
        modelValue: false
      })

      const checkbox = wrapper.findComponent({ name: 'Checkbox' })
      
      // Test focus event
      await checkbox.vm.$emit('focus', new FocusEvent('focus'))
      expect(wrapper.emitted('focus')).toBeTruthy()

      // Test blur event
      await checkbox.vm.$emit('blur', new FocusEvent('blur'))
      expect(wrapper.emitted('blur')).toBeTruthy()

      // Test change event
      await checkbox.vm.$emit('change', new Event('change'))
      expect(wrapper.emitted('change')).toBeTruthy()
    })

    it('should maintain ref functionality', () => {
      wrapper = createWrapper()
      
      const component = wrapper.vm
      expect(component.primevueRef).toBeDefined()
      expect(typeof component.focus).toBe('function')
      expect(typeof component.blur).toBe('function')
    })

    it('should handle v-model correctly with boolean', async () => {
      wrapper = createWrapper({
        modelValue: true
      })

      expect(wrapper.props('modelValue')).toBe(true)

      // Test model update
      await wrapper.setProps({ modelValue: false })
      expect(wrapper.props('modelValue')).toBe(false)
    })

    it('should handle v-model correctly with array', async () => {
      wrapper = createWrapper({
        modelValue: ['option1', 'option2'],
        value: 'option1'
      })

      expect(wrapper.props('modelValue')).toEqual(['option1', 'option2'])
      expect(wrapper.props('value')).toBe('option1')
    })
  })

  describe('Visual Regression', () => {
    it('should render with label when provided', () => {
      wrapper = createWrapper({
        label: 'Checkbox Label'
      })

      expect(wrapper.find('.checkbox-label').exists()).toBe(true)
      expect(wrapper.find('.checkbox-label').text()).toBe('Checkbox Label')
    })

    it('should render without label when not provided', () => {
      wrapper = createWrapper()

      expect(wrapper.find('.checkbox-label').exists()).toBe(false)
    })

    it('should apply correct CSS classes for states', () => {
      wrapper = createWrapper({
        disabled: true,
        invalid: true,
        readonly: true,
        indeterminate: true
      })

      expect(wrapper.find('.checkbox-wrapper--disabled').exists()).toBe(true)
      expect(wrapper.find('.checkbox-wrapper--invalid').exists()).toBe(true)
      expect(wrapper.find('.checkbox-wrapper--readonly').exists()).toBe(true)
      expect(wrapper.find('.checkbox-container--indeterminate').exists()).toBe(true)
    })

    it('should show checked state correctly', () => {
      wrapper = createWrapper({
        modelValue: true
      })

      expect(wrapper.find('.checkbox-container--checked').exists()).toBe(true)
      expect(wrapper.find('.custom-checkmark--checked').exists()).toBe(true)
    })

    it('should show indeterminate state correctly', () => {
      wrapper = createWrapper({
        indeterminate: true
      })

      expect(wrapper.find('.custom-checkmark--indeterminate').exists()).toBe(true)
    })

    it('should handle responsive behavior', () => {
      wrapper = createWrapper()
      
      const wrapperElement = wrapper.find('.checkbox-wrapper')
      expect(wrapperElement.exists()).toBe(true)
      
      // Check that the checkbox container exists
      expect(wrapper.find('.checkbox-container').exists()).toBe(true)
    })
  })

  describe('Accessibility', () => {
    it('should maintain ARIA attributes', () => {
      wrapper = createWrapper({
        id: 'test-checkbox',
        label: 'Checkbox Label',
        required: true,
        invalid: true,
        ariaLabel: 'Test checkbox',
        ariaLabelledby: 'label-id'
      })

      const checkbox = wrapper.findComponent({ name: 'Checkbox' })
      expect(checkbox.attributes('id')).toBe('test-checkbox')
      expect(checkbox.attributes('aria-label')).toBe('Test checkbox')
      expect(checkbox.attributes('aria-labelledby')).toBe('label-id')
    })

    it('should support keyboard navigation', async () => {
      wrapper = createWrapper()
      
      const checkbox = wrapper.findComponent({ name: 'Checkbox' })
      
      // Test focus
      await checkbox.vm.$emit('focus', new FocusEvent('focus'))
      expect(wrapper.emitted('focus')).toBeTruthy()
      
      // Test blur
      await checkbox.vm.$emit('blur', new FocusEvent('blur'))
      expect(wrapper.emitted('blur')).toBeTruthy()
    })

    it('should work with screen readers', () => {
      wrapper = createWrapper({
        label: 'Screen Reader Checkbox',
        ariaLabel: 'Screen Reader Label'
      })

      const label = wrapper.find('.checkbox-label')
      const checkbox = wrapper.findComponent({ name: 'Checkbox' })
      
      expect(label.text()).toBe('Screen Reader Checkbox')
      expect(checkbox.attributes('aria-label')).toBe('Screen Reader Label')
    })

    it('should support data-testid for testing', () => {
      wrapper = createWrapper({
        'data-testid': 'test-checkbox'
      })

      const checkbox = wrapper.findComponent({ name: 'Checkbox' })
      expect(checkbox.attributes('data-testid')).toBe('test-checkbox')
    })

    it('should handle tabindex correctly', () => {
      wrapper = createWrapper({
        tabindex: 5
      })

      const checkbox = wrapper.findComponent({ name: 'Checkbox' })
      expect(checkbox.attributes('tabindex')).toBe('5')
    })
  })

  describe('Form Integration', () => {
    it('should handle required validation', () => {
      wrapper = createWrapper({
        required: true,
        invalid: true
      })

      expect(wrapper.props('required')).toBe(true)
      expect(wrapper.props('invalid')).toBe(true)
      expect(wrapper.find('.checkbox-wrapper--invalid').exists()).toBe(true)
    })

    it('should handle disabled state', () => {
      wrapper = createWrapper({
        disabled: true
      })

      const checkbox = wrapper.findComponent({ name: 'Checkbox' })
      expect(checkbox.props('disabled')).toBe(true)
      expect(wrapper.find('.checkbox-wrapper--disabled').exists()).toBe(true)
      expect(wrapper.find('.checkbox-container--disabled').exists()).toBe(true)
    })

    it('should handle readonly state', () => {
      wrapper = createWrapper({
        readonly: true
      })

      const checkbox = wrapper.findComponent({ name: 'Checkbox' })
      expect(checkbox.props('readonly')).toBe(true)
      expect(wrapper.find('.checkbox-wrapper--readonly').exists()).toBe(true)
      expect(wrapper.find('.checkbox-container--readonly').exists()).toBe(true)
    })

    it('should handle name attribute for form submission', () => {
      wrapper = createWrapper({
        name: 'checkbox-field'
      })

      const checkbox = wrapper.findComponent({ name: 'Checkbox' })
      expect(checkbox.props('name')).toBe('checkbox-field')
    })
  })

  describe('Checkbox-specific Features', () => {
    it('should handle boolean model value', () => {
      wrapper = createWrapper({
        modelValue: true
      })

      expect(wrapper.props('modelValue')).toBe(true)
      expect(wrapper.find('.checkbox-container--checked').exists()).toBe(true)
    })

    it('should handle array model value', () => {
      wrapper = createWrapper({
        modelValue: ['option1', 'option2'],
        value: 'option1'
      })

      expect(wrapper.props('modelValue')).toEqual(['option1', 'option2'])
      expect(wrapper.props('value')).toBe('option1')
      expect(wrapper.find('.checkbox-container--checked').exists()).toBe(true)
    })

    it('should handle indeterminate state', () => {
      wrapper = createWrapper({
        indeterminate: true
      })

      const checkbox = wrapper.findComponent({ name: 'Checkbox' })
      expect(checkbox.props('indeterminate')).toBe(true)
      expect(wrapper.find('.checkbox-container--indeterminate').exists()).toBe(true)
      expect(wrapper.find('.custom-checkmark--indeterminate').exists()).toBe(true)
    })

    it('should show custom checkmark styling', () => {
      wrapper = createWrapper({
        modelValue: true
      })

      expect(wrapper.find('.custom-checkmark').exists()).toBe(true)
      expect(wrapper.find('.custom-checkmark--checked').exists()).toBe(true)
    })
  })

  describe('Default Props', () => {
    it('should use default props when not provided', () => {
      wrapper = createWrapper()

      expect(wrapper.props('required')).toBe(false)
      expect(wrapper.props('invalid')).toBe(false)
      expect(wrapper.props('readonly')).toBe(false)
      expect(wrapper.props('indeterminate')).toBe(false)
      expect(wrapper.props('tabindex')).toBe(0)
    })
  })

  describe('Component Methods', () => {
    it('should expose focus method', async () => {
      wrapper = createWrapper()
      
      const component = wrapper.vm
      const focusSpy = vi.spyOn(component, 'focus')
      
      component.focus()
      await nextTick()
      
      expect(focusSpy).toHaveBeenCalled()
    })

    it('should expose blur method', async () => {
      wrapper = createWrapper()
      
      const component = wrapper.vm
      const blurSpy = vi.spyOn(component, 'blur')
      
      component.blur()
      await nextTick()
      
      expect(blurSpy).toHaveBeenCalled()
    })
  })

  describe('Array Model Behavior', () => {
    it('should correctly determine checked state with array model', () => {
      wrapper = createWrapper({
        modelValue: ['option1', 'option3'],
        value: 'option1'
      })

      expect(wrapper.find('.checkbox-container--checked').exists()).toBe(true)
    })

    it('should correctly determine unchecked state with array model', () => {
      wrapper = createWrapper({
        modelValue: ['option1', 'option3'],
        value: 'option2'
      })

      expect(wrapper.find('.checkbox-container--checked').exists()).toBe(false)
    })
  })
})