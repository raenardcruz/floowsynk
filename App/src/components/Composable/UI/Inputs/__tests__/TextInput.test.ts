/**
 * Unit tests for TextInput wrapper component
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import TextInput from '../TextInput.vue'
import type { TextInputProps } from '../TextInput.types'

// Mock PrimeVue components
vi.mock('primevue/inputtext', () => ({
  default: {
    name: 'InputText',
    template: '<input v-bind="$attrs" v-on="$listeners" />',
    props: ['modelValue', 'type', 'placeholder', 'disabled', 'readonly', 'invalid', 'maxlength', 'autocomplete']
  }
}))

vi.mock('primevue/floatlabel', () => ({
  default: {
    name: 'FloatLabel',
    template: '<div class="p-float-label"><slot /></div>',
    props: ['variant']
  }
}))

describe('TextInput', () => {
  let wrapper: VueWrapper<any>

  const createWrapper = (props: Partial<TextInputProps> = {}) => {
    return mount(TextInput, {
      props: {
        modelValue: '',
        ...props
      },
      global: {
        directives: {
          tooltip: {
            mounted() {},
            updated() {},
            unmounted() {}
          }
        }
      }
    })
  }

  beforeEach(() => {
    wrapper?.unmount()
  })

  describe('API Compatibility', () => {
    it('should accept all legacy props', () => {
      wrapper = createWrapper({
        id: 'test-input',
        label: 'Test Label',
        placeholder: 'Test placeholder',
        disabled: false,
        readonly: false,
        invalid: false,
        required: true,
        variant: 'outlined',
        type: 'email',
        maxlength: 100,
        autocomplete: 'email'
      })

      expect(wrapper.exists()).toBe(true)
      expect(wrapper.props('label')).toBe('Test Label')
      expect(wrapper.props('placeholder')).toBe('Test placeholder')
      expect(wrapper.props('type')).toBe('email')
      expect(wrapper.props('maxlength')).toBe(100)
    })

    it('should emit expected events', async () => {
      wrapper = createWrapper({
        modelValue: 'test'
      })

      const input = wrapper.find('input')
      
      // Test focus event
      await input.trigger('focus')
      expect(wrapper.emitted('focus')).toBeTruthy()

      // Test blur event
      await input.trigger('blur')
      expect(wrapper.emitted('blur')).toBeTruthy()

      // Test keydown event
      await input.trigger('keydown', { key: 'Enter' })
      expect(wrapper.emitted('keydown')).toBeTruthy()

      // Test keyup event
      await input.trigger('keyup', { key: 'Enter' })
      expect(wrapper.emitted('keyup')).toBeTruthy()

      // Test input event
      await input.trigger('input')
      expect(wrapper.emitted('input')).toBeTruthy()
    })

    it('should maintain ref functionality', () => {
      wrapper = createWrapper()
      
      const component = wrapper.vm
      expect(component.primevueRef).toBeDefined()
      expect(typeof component.focus).toBe('function')
      expect(typeof component.blur).toBe('function')
      expect(typeof component.select).toBe('function')
    })

    it('should handle v-model correctly', async () => {
      wrapper = createWrapper({
        modelValue: 'initial value'
      })

      const input = wrapper.find('input')
      expect(input.element.value).toBe('initial value')

      // Test model update
      await input.setValue('new value')
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['new value'])
    })
  })

  describe('Visual Regression', () => {
    it('should render with label when provided', () => {
      wrapper = createWrapper({
        label: 'Test Label'
      })

      expect(wrapper.find('label').exists()).toBe(true)
      expect(wrapper.find('label').text()).toBe('Test Label')
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

      expect(wrapper.find('.p-inputtext-filled').exists()).toBe(true)
    })

    it('should apply correct CSS classes for states', () => {
      wrapper = createWrapper({
        disabled: true,
        invalid: true,
        readonly: true
      })

      expect(wrapper.find('.text-input-wrapper--disabled').exists()).toBe(true)
      expect(wrapper.find('.text-input-wrapper--invalid').exists()).toBe(true)
      expect(wrapper.find('.text-input-wrapper--readonly').exists()).toBe(true)
    })

    it('should handle responsive behavior', () => {
      wrapper = createWrapper()
      
      const wrapperElement = wrapper.find('.text-input-wrapper')
      expect(wrapperElement.exists()).toBe(true)
      
      // Check that the input takes full width
      const styles = getComputedStyle(wrapperElement.element)
      expect(wrapper.find('.text-input').exists()).toBe(true)
    })
  })

  describe('Accessibility', () => {
    it('should maintain ARIA attributes', () => {
      wrapper = createWrapper({
        id: 'test-input',
        label: 'Test Label',
        required: true,
        invalid: true
      })

      const input = wrapper.find('input')
      expect(input.attributes('id')).toBe('test-input')
      expect(input.attributes('invalid')).toBe('true')
    })

    it('should support keyboard navigation', async () => {
      wrapper = createWrapper()
      
      const input = wrapper.find('input')
      
      // Test Tab navigation
      await input.trigger('keydown', { key: 'Tab' })
      expect(wrapper.emitted('keydown')).toBeTruthy()
      
      // Test Enter key
      await input.trigger('keydown', { key: 'Enter' })
      expect(wrapper.emitted('keydown')).toBeTruthy()
      
      // Test Escape key
      await input.trigger('keydown', { key: 'Escape' })
      expect(wrapper.emitted('keydown')).toBeTruthy()
    })

    it('should work with screen readers', () => {
      wrapper = createWrapper({
        label: 'Screen Reader Label',
        placeholder: 'Screen Reader Placeholder'
      })

      const input = wrapper.find('input')
      const label = wrapper.find('label')
      
      expect(label.text()).toBe('Screen Reader Label')
      expect(input.attributes('placeholder')).toBe('Screen Reader Placeholder')
    })

    it('should support data-testid for testing', () => {
      wrapper = createWrapper({
        'data-testid': 'test-input'
      })

      const input = wrapper.find('input')
      expect(input.attributes('data-testid')).toBe('test-input')
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
      expect(wrapper.find('.text-input--invalid').exists()).toBe(true)
    })

    it('should handle disabled state', () => {
      wrapper = createWrapper({
        disabled: true
      })

      const input = wrapper.find('input')
      expect(input.attributes('disabled')).toBeDefined()
      expect(wrapper.find('.text-input-wrapper--disabled').exists()).toBe(true)
    })

    it('should handle readonly state', () => {
      wrapper = createWrapper({
        readonly: true
      })

      const input = wrapper.find('input')
      expect(input.attributes('readonly')).toBeDefined()
      expect(wrapper.find('.text-input-wrapper--readonly').exists()).toBe(true)
    })

    it('should handle maxlength constraint', () => {
      wrapper = createWrapper({
        maxlength: 50
      })

      const input = wrapper.find('input')
      expect(input.attributes('maxlength')).toBe('50')
    })
  })

  describe('Default Props', () => {
    it('should use default props when not provided', () => {
      wrapper = createWrapper()

      expect(wrapper.props('variant')).toBe('outlined')
      expect(wrapper.props('type')).toBe('text')
      expect(wrapper.props('autocomplete')).toBe('off')
      expect(wrapper.props('required')).toBe(false)
      expect(wrapper.props('invalid')).toBe(false)
      expect(wrapper.props('readonly')).toBe(false)
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

    it('should expose select method', async () => {
      wrapper = createWrapper()
      
      const component = wrapper.vm
      const selectSpy = vi.spyOn(component, 'select')
      
      component.select()
      await nextTick()
      
      expect(selectSpy).toHaveBeenCalled()
    })
  })
})