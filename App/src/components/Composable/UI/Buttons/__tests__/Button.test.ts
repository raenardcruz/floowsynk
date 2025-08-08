import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import Button from '../Button.vue'
import type { ButtonProps } from '../Button.types'

// Mock VueUse composables
vi.mock('@vueuse/core', () => ({
  useElementSize: vi.fn(() => ({
    width: { value: 100 },
    height: { value: 40 }
  })),
  useTimeoutFn: vi.fn(() => ({
    start: vi.fn(),
    stop: vi.fn()
  })),
  useEventListener: vi.fn()
}))

describe('Button Component', () => {
  let wrapper: VueWrapper<any>

  const createWrapper = (props: Partial<ButtonProps> = {}) => {
    return mount(Button, {
      props: {
        ...props
      }
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders with default props', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('button').exists()).toBe(true)
      expect(wrapper.classes()).toContain('btn')
      expect(wrapper.classes()).toContain('btn-primary')
      expect(wrapper.classes()).toContain('btn-medium')
    })

    it('renders with custom label', () => {
      wrapper = createWrapper({ label: 'Click me' })
      
      expect(wrapper.text()).toContain('Click me')
    })

    it('renders with slot content', () => {
      wrapper = mount(Button, {
        slots: {
          default: 'Slot content'
        }
      })
      
      expect(wrapper.text()).toContain('Slot content')
    })

    it('renders with custom id', () => {
      wrapper = createWrapper({ id: 'custom-button' })
      
      expect(wrapper.find('button').attributes('id')).toBe('custom-button')
    })

    it('renders with tooltip', () => {
      wrapper = createWrapper({ tooltip: 'Button tooltip' })
      
      expect(wrapper.find('button').attributes('title')).toBe('Button tooltip')
      expect(wrapper.find('button').attributes('aria-label')).toBe('Button tooltip')
    })
  })

  describe('Variants', () => {
    it('renders primary variant by default', () => {
      wrapper = createWrapper()
      
      expect(wrapper.classes()).toContain('btn-primary')
    })

    it('renders secondary variant', () => {
      wrapper = createWrapper({ variant: 'secondary' })
      
      expect(wrapper.classes()).toContain('btn-secondary')
    })

    it('renders outline variant', () => {
      wrapper = createWrapper({ variant: 'outline' })
      
      expect(wrapper.classes()).toContain('btn-outline')
    })

    it('renders ghost variant', () => {
      wrapper = createWrapper({ variant: 'ghost' })
      
      expect(wrapper.classes()).toContain('btn-ghost')
    })

    it('renders danger variant', () => {
      wrapper = createWrapper({ variant: 'danger' })
      
      expect(wrapper.classes()).toContain('btn-danger')
    })
  })

  describe('Sizes', () => {
    it('renders medium size by default', () => {
      wrapper = createWrapper()
      
      expect(wrapper.classes()).toContain('btn-medium')
    })

    it('renders small size', () => {
      wrapper = createWrapper({ size: 'small' })
      
      expect(wrapper.classes()).toContain('btn-small')
    })

    it('renders large size', () => {
      wrapper = createWrapper({ size: 'large' })
      
      expect(wrapper.classes()).toContain('btn-large')
    })
  })

  describe('States', () => {
    it('renders disabled state', () => {
      wrapper = createWrapper({ disabled: true })
      
      expect(wrapper.find('button').attributes('disabled')).toBeDefined()
      expect(wrapper.classes()).toContain('btn-disabled')
    })

    it('renders loading state', () => {
      wrapper = createWrapper({ loading: true })
      
      expect(wrapper.find('button').attributes('aria-busy')).toBe('true')
      expect(wrapper.classes()).toContain('btn-loading')
      expect(wrapper.find('.btn-loading-spinner').exists()).toBe(true)
    })

    it('renders loading state with custom text', () => {
      wrapper = createWrapper({ 
        loading: true, 
        loadingText: 'Processing...' 
      })
      
      expect(wrapper.text()).toContain('Processing...')
    })

    it('renders block variant', () => {
      wrapper = createWrapper({ block: true })
      
      expect(wrapper.classes()).toContain('btn-block')
    })

    it('renders rounded variant', () => {
      wrapper = createWrapper({ rounded: true })
      
      expect(wrapper.classes()).toContain('btn-rounded')
    })
  })

  describe('Icons', () => {
    it('renders with icon on left by default', () => {
      wrapper = createWrapper({ 
        icon: 'test-icon',
        label: 'Button'
      })
      
      expect(wrapper.classes()).toContain('btn-icon-left')
      expect(wrapper.find('.btn-icon').exists()).toBe(true)
    })

    it('renders with icon on right', () => {
      wrapper = createWrapper({ 
        icon: 'test-icon',
        iconPosition: 'right',
        label: 'Button'
      })
      
      expect(wrapper.classes()).toContain('btn-icon-right')
    })

    it('renders icon slot', () => {
      wrapper = mount(Button, {
        props: { icon: 'test-icon' },
        slots: {
          icon: '<span class="custom-icon">Icon</span>'
        }
      })
      
      expect(wrapper.find('.custom-icon').exists()).toBe(true)
    })
  })

  describe('Events', () => {
    it('emits click event', async () => {
      wrapper = createWrapper()
      
      await wrapper.find('button').trigger('click')
      
      expect(wrapper.emitted('click')).toBeTruthy()
      expect(wrapper.emitted('click')).toHaveLength(1)
    })

    it('does not emit click when disabled', async () => {
      wrapper = createWrapper({ disabled: true })
      
      await wrapper.find('button').trigger('click')
      
      expect(wrapper.emitted('click')).toBeFalsy()
    })

    it('does not emit click when loading', async () => {
      wrapper = createWrapper({ loading: true })
      
      await wrapper.find('button').trigger('click')
      
      expect(wrapper.emitted('click')).toBeFalsy()
    })

    it('emits focus event', async () => {
      wrapper = createWrapper()
      
      await wrapper.find('button').trigger('focus')
      
      expect(wrapper.emitted('focus')).toBeTruthy()
      expect(wrapper.emitted('focus')).toHaveLength(1)
    })

    it('emits blur event', async () => {
      wrapper = createWrapper()
      
      await wrapper.find('button').trigger('blur')
      
      expect(wrapper.emitted('blur')).toBeTruthy()
      expect(wrapper.emitted('blur')).toHaveLength(1)
    })
  })

  describe('Keyboard Navigation', () => {
    it('handles Enter key press', async () => {
      wrapper = createWrapper()
      
      await wrapper.find('button').trigger('keydown', { key: 'Enter' })
      await wrapper.find('button').trigger('keyup', { key: 'Enter' })
      
      expect(wrapper.emitted('click')).toBeTruthy()
    })

    it('handles Space key press', async () => {
      wrapper = createWrapper()
      
      await wrapper.find('button').trigger('keydown', { key: ' ' })
      await wrapper.find('button').trigger('keyup', { key: ' ' })
      
      expect(wrapper.emitted('click')).toBeTruthy()
    })

    it('does not handle keyboard events when disabled', async () => {
      wrapper = createWrapper({ disabled: true })
      
      await wrapper.find('button').trigger('keydown', { key: 'Enter' })
      await wrapper.find('button').trigger('keyup', { key: 'Enter' })
      
      expect(wrapper.emitted('click')).toBeFalsy()
    })
  })

  describe('Accessibility', () => {
    it('has correct ARIA attributes', () => {
      wrapper = createWrapper({ 
        label: 'Test button',
        tooltip: 'Button tooltip'
      })
      
      const button = wrapper.find('button')
      expect(button.attributes('aria-label')).toBe('Button tooltip')
      expect(button.attributes('aria-pressed')).toBeDefined()
      expect(button.attributes('aria-busy')).toBe('false')
    })

    it('has correct ARIA attributes when loading', () => {
      wrapper = createWrapper({ loading: true })
      
      const button = wrapper.find('button')
      expect(button.attributes('aria-busy')).toBe('true')
    })

    it('has correct button type', () => {
      wrapper = createWrapper({ type: 'submit' })
      
      expect(wrapper.find('button').attributes('type')).toBe('submit')
    })

    it('defaults to button type', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('button').attributes('type')).toBe('button')
    })
  })

  describe('Custom Classes and Styles', () => {
    it('applies custom string class', () => {
      wrapper = createWrapper({ class: 'custom-class' })
      
      expect(wrapper.classes()).toContain('custom-class')
    })

    it('applies custom array classes', () => {
      wrapper = createWrapper({ class: ['class1', 'class2'] })
      
      expect(wrapper.classes()).toContain('class1')
      expect(wrapper.classes()).toContain('class2')
    })

    it('applies custom object classes', () => {
      wrapper = createWrapper({ 
        class: { 
          'active': true, 
          'inactive': false 
        } 
      })
      
      expect(wrapper.classes()).toContain('active')
      expect(wrapper.classes()).not.toContain('inactive')
    })

    it('applies custom styles', () => {
      wrapper = createWrapper({ 
        style: { color: 'red', fontSize: '16px' } 
      })
      
      const button = wrapper.find('button')
      expect(button.attributes('style')).toContain('color: red')
      expect(button.attributes('style')).toContain('font-size: 16px')
    })
  })

  describe('Component Exposure', () => {
    it('exposes button ref and state', () => {
      wrapper = createWrapper()
      
      const exposed = wrapper.vm
      expect(exposed.buttonRef).toBeDefined()
      expect(exposed.isDisabled).toBeDefined()
      expect(exposed.isLoading).toBeDefined()
      expect(exposed.isPressed).toBeDefined()
      expect(exposed.isFocused).toBeDefined()
      expect(exposed.isHovered).toBeDefined()
    })
  })
})