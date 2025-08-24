import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PrimaryButton from '../PrimaryButton.vue'
import Button from '../Button.vue'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'

// Mock PrimeVue Button for testing
vi.mock('primevue/button', () => ({
  default: {
    name: 'PrimeButton',
    props: ['id', 'class', 'style', 'disabled', 'loading', 'label', 'icon', 'iconPos', 'severity', 'size', 'outlined', 'text', 'raised', 'rounded', 'aria-label', 'title'],
    template: `<button class="p-button" :disabled="disabled || loading" @click="$emit('click', $event)" @focus="$emit('focus', $event)" @blur="$emit('blur', $event)"><span v-if="loading" class="p-button-loading-icon"></span><span v-if="icon" :class="icon"></span><span v-if="label" class="p-button-label">{{ label }}</span><slot /><slot name="icon" /></button>`,
    emits: ['click', 'focus', 'blur']
  }
}))

const createWrapper = (props = {}) => {
  return mount(PrimaryButton, {
    props,
    global: {
      plugins: [
        [PrimeVue, { 
          theme: { preset: Aura }
        }]
      ]
    }
  })
}

describe('PrimaryButton Component', () => {
  describe('Basic Rendering', () => {
    it('should render with default props', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('button').exists()).toBe(true)
      expect(wrapper.find('button').classes()).toContain('p-button')
    })

    it('should render with label', () => {
      const wrapper = createWrapper({ label: 'Primary Button' })
      expect(wrapper.find('.p-button-label').text()).toBe('Primary Button')
    })

    it('should render with slot content', () => {
      const wrapper = mount(PrimaryButton, {
        slots: {
          default: 'Slot Content'
        },
        global: {
          plugins: [[PrimeVue, { theme: { preset: Aura } }]]
        }
      })
      expect(wrapper.text()).toContain('Slot Content')
    })
  })

  describe('Button Wrapper Integration', () => {
    it('should use the Button wrapper component', () => {
      const wrapper = createWrapper()
      expect(wrapper.findComponent(Button).exists()).toBe(true)
    })

    it('should force variant to primary', () => {
      const wrapper = createWrapper()
      const buttonWrapper = wrapper.findComponent(Button)
      expect(buttonWrapper.props('variant')).toBe('primary')
    })

    it('should pass through other props to Button wrapper', () => {
      const wrapper = createWrapper({ 
        disabled: true,
        loading: true,
        size: 'large'
      })
      const buttonWrapper = wrapper.findComponent(Button)
      expect(buttonWrapper.props('disabled')).toBe(true)
      expect(buttonWrapper.props('loading')).toBe(true)
      expect(buttonWrapper.props('size')).toBe('large')
    })
  })

  describe('Event Handling', () => {
    it('should emit click event', async () => {
      const wrapper = createWrapper()
      await wrapper.find('button').trigger('click')
      expect(wrapper.emitted('click')).toHaveLength(1)
    })

    it('should emit focus event', async () => {
      const wrapper = createWrapper()
      await wrapper.find('button').trigger('focus')
      expect(wrapper.emitted('focus')).toHaveLength(1)
    })

    it('should emit blur event', async () => {
      const wrapper = createWrapper()
      await wrapper.find('button').trigger('blur')
      expect(wrapper.emitted('blur')).toHaveLength(1)
    })
  })

  describe('Styling', () => {
    it('should apply primary button class', () => {
      const wrapper = createWrapper()
      const buttonWrapper = wrapper.findComponent(Button)
      const classes = buttonWrapper.props('class')
      expect(Array.isArray(classes) ? classes.includes('button-primary') : classes === 'button-primary').toBe(true)
    })

    it('should combine custom classes with primary class', () => {
      const wrapper = createWrapper({ class: 'custom-class' })
      const buttonWrapper = wrapper.findComponent(Button)
      const classes = buttonWrapper.props('class')
      
      // Check if classes contain both primary and custom class
      if (Array.isArray(classes)) {
        expect(classes).toContain('button-primary')
        expect(classes).toContain('custom-class')
      } else if (typeof classes === 'string') {
        expect(classes).toContain('button-primary')
        expect(classes).toContain('custom-class')
      } else {
        // If it's an object, check the keys
        expect(classes).toHaveProperty('button-primary')
        expect(classes).toHaveProperty('custom-class')
      }
    })
  })

  describe('Slots', () => {
    it('should render icon slot', () => {
      const wrapper = mount(PrimaryButton, {
        slots: {
          icon: '<i class="custom-icon"></i>'
        },
        global: {
          plugins: [[PrimeVue, { theme: { preset: Aura } }]]
        }
      })
      expect(wrapper.find('.custom-icon').exists()).toBe(true)
    })

    it('should render default slot', () => {
      const wrapper = mount(PrimaryButton, {
        slots: {
          default: '<span class="custom-content">Custom Content</span>'
        },
        global: {
          plugins: [[PrimeVue, { theme: { preset: Aura } }]]
        }
      })
      expect(wrapper.find('.custom-content').exists()).toBe(true)
    })
  })
})