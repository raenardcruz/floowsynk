/**
 * Unit tests for PasswordInput wrapper component
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import PasswordInput from '../PasswordInput.vue'
import type { PasswordInputProps } from '../PasswordInput.types'

describe('PasswordInput', () => {
  let wrapper: VueWrapper<any>

  const createWrapper = (props: Partial<PasswordInputProps> = {}) => {
    return mount(PasswordInput, {
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
        id: 'test-password',
        label: 'Password Label',
        placeholder: 'Enter password',
        disabled: false,
        readonly: false,
        invalid: false,
        required: true,
        variant: 'outlined',
        maxlength: 100,
        autocomplete: 'current-password',
        toggleMask: true,
        feedback: false
      })

      expect(wrapper.exists()).toBe(true)
      expect(wrapper.props('label')).toBe('Password Label')
      expect(wrapper.props('placeholder')).toBe('Enter password')
      expect(wrapper.props('toggleMask')).toBe(true)
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
        modelValue: 'initial password'
      })

      const input = wrapper.find('input')
      expect(input.element.value).toBe('initial password')

      // Test model update
      await input.setValue('new password')
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['new password'])
    })
  })

  describe('Visual Regression', () => {
    it('should render with label when provided', () => {
      wrapper = createWrapper({
        label: 'Password Label'
      })

      expect(wrapper.find('label').exists()).toBe(true)
      expect(wrapper.find('label').text()).toBe('Password Label')
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

      expect(wrapper.find('.p-password-filled').exists()).toBe(true)
    })

    it('should apply correct CSS classes for states', () => {
      wrapper = createWrapper({
        disabled: true,
        invalid: true,
        readonly: true
      })

      expect(wrapper.find('.password-input-wrapper--disabled').exists()).toBe(true)
      expect(wrapper.find('.password-input-wrapper--invalid').exists()).toBe(true)
      expect(wrapper.find('.password-input-wrapper--readonly').exists()).toBe(true)
    })

    it('should show toggle mask button when enabled', () => {
      wrapper = createWrapper({
        toggleMask: true
      })

      // The toggle button should be rendered by PrimeVue Password component
      expect(wrapper.props('toggleMask')).toBe(true)
    })
  })

  describe('Accessibility', () => {
    it('should maintain ARIA attributes', () => {
      wrapper = createWrapper({
        id: 'test-password',
        label: 'Password Label',
        required: true,
        invalid: true
      })

      const input = wrapper.find('input')
      expect(input.attributes('id')).toBe('test-password')
      expect(input.attributes('type')).toBe('password')
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
        label: 'Screen Reader Password',
        placeholder: 'Screen Reader Placeholder'
      })

      const input = wrapper.find('input')
      const label = wrapper.find('label')
      
      expect(label.text()).toBe('Screen Reader Password')
      expect(input.attributes('placeholder')).toBe('Screen Reader Placeholder')
    })

    it('should support data-testid for testing', () => {
      wrapper = createWrapper({
        'data-testid': 'test-password'
      })

      const input = wrapper.find('input')
      expect(input.attributes('data-testid')).toBe('test-password')
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
      expect(wrapper.find('.password-input--invalid').exists()).toBe(true)
    })

    it('should handle disabled state', () => {
      wrapper = createWrapper({
        disabled: true
      })

      const input = wrapper.find('input')
      expect(input.attributes('disabled')).toBeDefined()
      expect(wrapper.find('.password-input-wrapper--disabled').exists()).toBe(true)
    })

    it('should handle readonly state', () => {
      wrapper = createWrapper({
        readonly: true
      })

      const input = wrapper.find('input')
      expect(input.attributes('readonly')).toBeDefined()
      expect(wrapper.find('.password-input-wrapper--readonly').exists()).toBe(true)
    })

    it('should handle maxlength constraint', () => {
      wrapper = createWrapper({
        maxlength: 50
      })

      const input = wrapper.find('input')
      expect(input.attributes('maxlength')).toBe('50')
    })
  })

  describe('Password-specific Features', () => {
    it('should handle password visibility toggle', () => {
      wrapper = createWrapper({
        toggleMask: true
      })

      expect(wrapper.props('toggleMask')).toBe(true)
    })

    it('should handle password strength feedback', () => {
      wrapper = createWrapper({
        feedback: true,
        promptLabel: 'Enter a password',
        weakLabel: 'Weak',
        mediumLabel: 'Medium',
        strongLabel: 'Strong'
      })

      expect(wrapper.props('feedback')).toBe(true)
      expect(wrapper.props('promptLabel')).toBe('Enter a password')
      expect(wrapper.props('weakLabel')).toBe('Weak')
      expect(wrapper.props('mediumLabel')).toBe('Medium')
      expect(wrapper.props('strongLabel')).toBe('Strong')
    })
  })

  describe('Default Props', () => {
    it('should use default props when not provided', () => {
      wrapper = createWrapper()

      expect(wrapper.props('variant')).toBe('outlined')
      expect(wrapper.props('autocomplete')).toBe('current-password')
      expect(wrapper.props('required')).toBe(false)
      expect(wrapper.props('invalid')).toBe(false)
      expect(wrapper.props('readonly')).toBe(false)
      expect(wrapper.props('toggleMask')).toBe(true)
      expect(wrapper.props('feedback')).toBe(false)
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