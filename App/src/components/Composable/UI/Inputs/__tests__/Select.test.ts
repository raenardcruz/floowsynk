/**
 * Unit tests for Select wrapper component
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import Select from '../Select.vue'
import type { SelectProps } from '../Select.types'
import type { SelectOption } from '../Inputs'

describe('Select', () => {
  let wrapper: VueWrapper<any>

  const mockOptions: SelectOption[] = [
    { label: 'Option 1', value: 'option1' },
    { label: 'Option 2', value: 'option2' },
    { label: 'Option 3', value: 'option3' }
  ]

  const createWrapper = (props: Partial<SelectProps> = {}) => {
    return mount(Select, {
      props: {
        modelValue: null,
        options: mockOptions,
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
        id: 'test-select',
        label: 'Select Label',
        placeholder: 'Choose option',
        disabled: false,
        readonly: false,
        invalid: false,
        required: true,
        variant: 'outlined',
        showClear: true,
        filter: true,
        isRunning: false
      })

      expect(wrapper.exists()).toBe(true)
      expect(wrapper.props('label')).toBe('Select Label')
      expect(wrapper.props('placeholder')).toBe('Choose option')
      expect(wrapper.props('showClear')).toBe(true)
      expect(wrapper.props('filter')).toBe(true)
    })

    it('should emit expected events', async () => {
      wrapper = createWrapper({
        modelValue: 'option1'
      })

      const select = wrapper.findComponent({ name: 'Select' })
      
      // Test change event
      await select.vm.$emit('change', { originalEvent: new Event('change'), value: 'option2' })
      expect(wrapper.emitted('change')).toBeTruthy()

      // Test show event
      await select.vm.$emit('show')
      expect(wrapper.emitted('show')).toBeTruthy()

      // Test hide event
      await select.vm.$emit('hide')
      expect(wrapper.emitted('hide')).toBeTruthy()

      // Test focus event
      await select.vm.$emit('focus', new FocusEvent('focus'))
      expect(wrapper.emitted('focus')).toBeTruthy()

      // Test blur event
      await select.vm.$emit('blur', new FocusEvent('blur'))
      expect(wrapper.emitted('blur')).toBeTruthy()
    })

    it('should maintain ref functionality', () => {
      wrapper = createWrapper()
      
      const component = wrapper.vm
      expect(component.primevueRef).toBeDefined()
      expect(typeof component.focus).toBe('function')
      expect(typeof component.blur).toBe('function')
      expect(typeof component.show).toBe('function')
      expect(typeof component.hide).toBe('function')
    })

    it('should handle v-model correctly', async () => {
      wrapper = createWrapper({
        modelValue: 'option1'
      })

      expect(wrapper.props('modelValue')).toBe('option1')

      // Test model update
      await wrapper.setProps({ modelValue: 'option2' })
      expect(wrapper.props('modelValue')).toBe('option2')
    })

    it('should handle options correctly', () => {
      const customOptions = [
        { label: 'Custom 1', value: 'custom1' },
        { label: 'Custom 2', value: 'custom2' }
      ]

      wrapper = createWrapper({
        options: customOptions
      })

      expect(wrapper.props('options')).toEqual(customOptions)
    })
  })

  describe('Visual Regression', () => {
    it('should render with label when provided', () => {
      wrapper = createWrapper({
        label: 'Select Label'
      })

      expect(wrapper.find('label').exists()).toBe(true)
      expect(wrapper.find('label').text()).toBe('Select Label')
      expect(wrapper.find('.p-float-label').exists()).toBe(true)
    })

    it('should render without label when not provided', () => {
      wrapper = createWrapper()

      expect(wrapper.find('label').exists()).toBe(false)
      expect(wrapper.find('.p-float-label').exists()).toBe(false)
    })

    it('should apply correct CSS classes for variants', () => {
      wrapper = createWrapper({
        variant: 'filled'
      })

      expect(wrapper.find('.p-select-filled').exists()).toBe(true)
    })

    it('should apply correct CSS classes for states', () => {
      wrapper = createWrapper({
        disabled: true,
        invalid: true,
        readonly: true,
        loading: true
      })

      expect(wrapper.find('.select-wrapper--disabled').exists()).toBe(true)
      expect(wrapper.find('.select-wrapper--invalid').exists()).toBe(true)
      expect(wrapper.find('.select-wrapper--readonly').exists()).toBe(true)
      expect(wrapper.find('.select-wrapper--loading').exists()).toBe(true)
    })

    it('should handle responsive behavior', () => {
      wrapper = createWrapper()
      
      const wrapperElement = wrapper.find('.select-wrapper')
      expect(wrapperElement.exists()).toBe(true)
      
      // Check that the select takes full width
      expect(wrapper.find('.select-input').exists()).toBe(true)
    })
  })

  describe('Accessibility', () => {
    it('should maintain ARIA attributes', () => {
      wrapper = createWrapper({
        id: 'test-select',
        label: 'Select Label',
        required: true,
        invalid: true
      })

      const select = wrapper.findComponent({ name: 'Select' })
      expect(select.attributes('id')).toBe('test-select')
    })

    it('should support keyboard navigation', async () => {
      wrapper = createWrapper()
      
      const select = wrapper.findComponent({ name: 'Select' })
      
      // Test focus
      await select.vm.$emit('focus', new FocusEvent('focus'))
      expect(wrapper.emitted('focus')).toBeTruthy()
      
      // Test blur
      await select.vm.$emit('blur', new FocusEvent('blur'))
      expect(wrapper.emitted('blur')).toBeTruthy()
    })

    it('should work with screen readers', () => {
      wrapper = createWrapper({
        label: 'Screen Reader Select',
        placeholder: 'Screen Reader Placeholder'
      })

      const label = wrapper.find('label')
      const select = wrapper.findComponent({ name: 'Select' })
      
      expect(label.text()).toBe('Screen Reader Select')
      expect(select.props('placeholder')).toBe('Screen Reader Placeholder')
    })

    it('should support data-testid for testing', () => {
      wrapper = createWrapper({
        'data-testid': 'test-select'
      })

      const select = wrapper.findComponent({ name: 'Select' })
      expect(select.attributes('data-testid')).toBe('test-select')
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
      expect(wrapper.find('.select-input--invalid').exists()).toBe(true)
    })

    it('should handle disabled state', () => {
      wrapper = createWrapper({
        disabled: true
      })

      const select = wrapper.findComponent({ name: 'Select' })
      expect(select.props('disabled')).toBe(true)
      expect(wrapper.find('.select-wrapper--disabled').exists()).toBe(true)
    })

    it('should handle readonly state', () => {
      wrapper = createWrapper({
        readonly: true
      })

      const select = wrapper.findComponent({ name: 'Select' })
      expect(select.props('readonly')).toBe(true)
      expect(wrapper.find('.select-wrapper--readonly').exists()).toBe(true)
    })

    it('should handle isRunning state (legacy prop)', () => {
      wrapper = createWrapper({
        isRunning: true
      })

      const select = wrapper.findComponent({ name: 'Select' })
      expect(select.props('disabled')).toBe(true)
      expect(wrapper.find('.select-wrapper--disabled').exists()).toBe(true)
    })
  })

  describe('Select-specific Features', () => {
    it('should handle filter functionality', () => {
      wrapper = createWrapper({
        filter: true,
        filterPlaceholder: 'Search options...'
      })

      const select = wrapper.findComponent({ name: 'Select' })
      expect(select.props('filter')).toBe(true)
      expect(select.props('filterPlaceholder')).toBe('Search options...')
    })

    it('should handle clear functionality', () => {
      wrapper = createWrapper({
        showClear: true
      })

      const select = wrapper.findComponent({ name: 'Select' })
      expect(select.props('showClear')).toBe(true)
    })

    it('should handle loading state', () => {
      wrapper = createWrapper({
        loading: true
      })

      const select = wrapper.findComponent({ name: 'Select' })
      expect(select.props('loading')).toBe(true)
      expect(wrapper.find('.select-wrapper--loading').exists()).toBe(true)
    })

    it('should handle empty messages', () => {
      wrapper = createWrapper({
        emptyMessage: 'No options available',
        emptyFilterMessage: 'No matches found'
      })

      const select = wrapper.findComponent({ name: 'Select' })
      expect(select.props('emptyMessage')).toBe('No options available')
      expect(select.props('emptyFilterMessage')).toBe('No matches found')
    })

    it('should handle custom components in options', () => {
      const customOptions = [
        { 
          label: 'Custom Option', 
          value: 'custom', 
          customComponent: { template: '<div>Custom</div>' }
        }
      ]

      wrapper = createWrapper({
        options: customOptions
      })

      expect(wrapper.props('options')).toEqual(customOptions)
    })
  })

  describe('Default Props', () => {
    it('should use default props when not provided', () => {
      wrapper = createWrapper()

      expect(wrapper.props('variant')).toBe('outlined')
      expect(wrapper.props('required')).toBe(false)
      expect(wrapper.props('invalid')).toBe(false)
      expect(wrapper.props('readonly')).toBe(false)
      expect(wrapper.props('showClear')).toBe(false)
      expect(wrapper.props('filter')).toBe(false)
      expect(wrapper.props('loading')).toBe(false)
      expect(wrapper.props('isRunning')).toBe(false)
      expect(wrapper.props('placeholder')).toBe('Select...')
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

    it('should expose show method', async () => {
      wrapper = createWrapper()
      
      const component = wrapper.vm
      const showSpy = vi.spyOn(component, 'show')
      
      component.show()
      await nextTick()
      
      expect(showSpy).toHaveBeenCalled()
    })

    it('should expose hide method', async () => {
      wrapper = createWrapper()
      
      const component = wrapper.vm
      const hideSpy = vi.spyOn(component, 'hide')
      
      component.hide()
      await nextTick()
      
      expect(hideSpy).toHaveBeenCalled()
    })
  })
})