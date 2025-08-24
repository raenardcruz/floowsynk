/**
 * Unit tests for Loading wrapper component
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import Loading from '../Loading.vue'
import type { LoadingWrapperProps } from '../Loading.types'

describe('Loading Wrapper Component', () => {
  let wrapper: any

  beforeEach(() => {
    wrapper = null
  })

  describe('Component Rendering', () => {
    it('should render with default props', () => {
      wrapper = mount(Loading)
      
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('.loading-wrapper').exists()).toBe(true)
      expect(wrapper.find('.loading-heading').text()).toBe('Loading')
      expect(wrapper.find('.loading-caption').text()).toBe('Please wait')
    })

    it('should render with custom text', () => {
      const customText = 'Processing your request...'
      wrapper = mount(Loading, {
        props: {
          text: customText
        }
      })
      
      expect(wrapper.find('.loading-caption').text()).toBe(customText)
    })

    it('should hide heading when showHeading is false', () => {
      wrapper = mount(Loading, {
        props: {
          showHeading: false
        }
      })
      
      expect(wrapper.find('.loading-heading').exists()).toBe(false)
    })

    it('should hide text when showText is false', () => {
      wrapper = mount(Loading, {
        props: {
          showText: false
        }
      })
      
      expect(wrapper.find('.loading-caption').exists()).toBe(false)
    })

    it('should hide text when text is empty', () => {
      wrapper = mount(Loading, {
        props: {
          text: ''
        }
      })
      
      expect(wrapper.find('.loading-caption').exists()).toBe(false)
    })
  })

  describe('Props and Styling', () => {
    it('should apply custom id', () => {
      const customId = 'custom-loading-id'
      wrapper = mount(Loading, {
        props: {
          id: customId
        }
      })
      
      expect(wrapper.find('.loading-wrapper').attributes('id')).toBe(customId)
    })

    it('should apply custom class', () => {
      const customClass = 'custom-loading-class'
      wrapper = mount(Loading, {
        props: {
          class: customClass
        }
      })
      
      expect(wrapper.find('.loading-wrapper').classes()).toContain(customClass)
    })

    it('should apply custom data-testid', () => {
      const customTestId = 'custom-loading-test'
      wrapper = mount(Loading, {
        props: {
          dataTestid: customTestId
        }
      })
      
      expect(wrapper.find('.loading-wrapper').attributes('data-testid')).toBe(customTestId)
    })

    it('should apply default data-testid when not provided', () => {
      wrapper = mount(Loading)
      
      expect(wrapper.find('.loading-wrapper').attributes('data-testid')).toBe('loading-component')
    })
  })

  describe('Size Variants', () => {
    it('should apply small size styling', () => {
      wrapper = mount(Loading, {
        props: {
          size: 'small'
        }
      })
      
      const spinner = wrapper.findComponent({ name: 'ProgressSpinner' })
      expect(spinner.classes()).toContain('loading-spinner--small')
    })

    it('should apply medium size styling (default)', () => {
      wrapper = mount(Loading)
      
      const spinner = wrapper.findComponent({ name: 'ProgressSpinner' })
      expect(spinner.classes()).toContain('loading-spinner--medium')
    })

    it('should apply large size styling', () => {
      wrapper = mount(Loading, {
        props: {
          size: 'large'
        }
      })
      
      const spinner = wrapper.findComponent({ name: 'ProgressSpinner' })
      expect(spinner.classes()).toContain('loading-spinner--large')
    })
  })

  describe('Color Variants', () => {
    it('should apply primary color styling (default)', () => {
      wrapper = mount(Loading)
      
      const spinner = wrapper.findComponent({ name: 'ProgressSpinner' })
      expect(spinner.classes()).toContain('loading-spinner--primary')
    })

    it('should apply secondary color styling', () => {
      wrapper = mount(Loading, {
        props: {
          color: 'secondary'
        }
      })
      
      const spinner = wrapper.findComponent({ name: 'ProgressSpinner' })
      expect(spinner.classes()).toContain('loading-spinner--secondary')
    })

    it('should apply success color styling', () => {
      wrapper = mount(Loading, {
        props: {
          color: 'success'
        }
      })
      
      const spinner = wrapper.findComponent({ name: 'ProgressSpinner' })
      expect(spinner.classes()).toContain('loading-spinner--success')
    })

    it('should apply danger color styling', () => {
      wrapper = mount(Loading, {
        props: {
          color: 'danger'
        }
      })
      
      const spinner = wrapper.findComponent({ name: 'ProgressSpinner' })
      expect(spinner.classes()).toContain('loading-spinner--danger')
    })
  })

  describe('PrimeVue Integration', () => {
    it('should render PrimeVue ProgressSpinner component', () => {
      wrapper = mount(Loading)
      
      const spinner = wrapper.findComponent({ name: 'ProgressSpinner' })
      expect(spinner.exists()).toBe(true)
    })

    it('should pass strokeWidth to ProgressSpinner', () => {
      const customStrokeWidth = '4'
      wrapper = mount(Loading, {
        props: {
          strokeWidth: customStrokeWidth
        }
      })
      
      const spinner = wrapper.findComponent({ name: 'ProgressSpinner' })
      expect(spinner.props('strokeWidth')).toBe(customStrokeWidth)
    })

    it('should pass animationDuration to ProgressSpinner', () => {
      const customDuration = '3s'
      wrapper = mount(Loading, {
        props: {
          animationDuration: customDuration
        }
      })
      
      const spinner = wrapper.findComponent({ name: 'ProgressSpinner' })
      expect(spinner.props('animationDuration')).toBe(customDuration)
    })
  })

  describe('Component Exposure', () => {
    it('should expose primevueRef', () => {
      wrapper = mount(Loading)
      
      expect(wrapper.vm.primevueRef).toBeDefined()
    })
  })

  describe('Accessibility', () => {
    it('should maintain proper structure for screen readers', () => {
      wrapper = mount(Loading, {
        props: {
          text: 'Loading data'
        }
      })
      
      expect(wrapper.find('.loading-heading').exists()).toBe(true)
      expect(wrapper.find('.loading-caption').exists()).toBe(true)
    })

    it('should work without text for minimal loading states', () => {
      wrapper = mount(Loading, {
        props: {
          showHeading: false,
          showText: false
        }
      })
      
      expect(wrapper.find('.loading-heading').exists()).toBe(false)
      expect(wrapper.find('.loading-caption').exists()).toBe(false)
      expect(wrapper.findComponent({ name: 'ProgressSpinner' }).exists()).toBe(true)
    })
  })

  describe('API Compatibility', () => {
    it('should maintain backward compatibility with original Loading component', () => {
      // Test that the wrapper accepts the same props as the original
      const originalProps: LoadingWrapperProps = {
        text: 'Custom loading text'
      }
      
      wrapper = mount(Loading, {
        props: originalProps
      })
      
      expect(wrapper.find('.loading-caption').text()).toBe(originalProps.text)
    })

    it('should provide enhanced functionality over original', () => {
      // Test new features not available in original
      wrapper = mount(Loading, {
        props: {
          size: 'large',
          color: 'success',
          showHeading: false
        }
      })
      
      const spinner = wrapper.findComponent({ name: 'ProgressSpinner' })
      expect(spinner.classes()).toContain('loading-spinner--large')
      expect(spinner.classes()).toContain('loading-spinner--success')
      expect(wrapper.find('.loading-heading').exists()).toBe(false)
    })
  })
})