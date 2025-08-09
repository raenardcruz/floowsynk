import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Button from '../Button.vue'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'

const createWrapper = (props = {}) => {
  return mount(Button, {
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

describe('Button Wrapper Component', () => {
  describe('Basic Functionality', () => {
    it('should render successfully', () => {
      const wrapper = createWrapper()
      expect(wrapper.exists()).toBe(true)
    })

    it('should render with label', () => {
      const wrapper = createWrapper({ label: 'Test Button' })
      expect(wrapper.text()).toContain('Test Button')
    })

    it('should handle disabled state', () => {
      const wrapper = createWrapper({ disabled: true })
      const button = wrapper.find('button')
      expect(button.attributes('disabled')).toBeDefined()
    })

    it('should handle loading state', () => {
      const wrapper = createWrapper({ loading: true })
      const button = wrapper.find('button')
      expect(button.attributes('disabled')).toBeDefined()
    })

    it('should emit click event when not disabled', async () => {
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

  describe('Variant Support', () => {
    it('should handle primary variant', () => {
      const wrapper = createWrapper({ variant: 'primary' })
      expect(wrapper.exists()).toBe(true)
    })

    it('should handle secondary variant', () => {
      const wrapper = createWrapper({ variant: 'secondary' })
      expect(wrapper.exists()).toBe(true)
    })

    it('should handle outline variant', () => {
      const wrapper = createWrapper({ variant: 'outline' })
      expect(wrapper.exists()).toBe(true)
    })

    it('should handle ghost variant', () => {
      const wrapper = createWrapper({ variant: 'ghost' })
      expect(wrapper.exists()).toBe(true)
    })

    it('should handle danger variant', () => {
      const wrapper = createWrapper({ variant: 'danger' })
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Size Support', () => {
    it('should handle small size', () => {
      const wrapper = createWrapper({ size: 'small' })
      expect(wrapper.exists()).toBe(true)
    })

    it('should handle medium size', () => {
      const wrapper = createWrapper({ size: 'medium' })
      expect(wrapper.exists()).toBe(true)
    })

    it('should handle large size', () => {
      const wrapper = createWrapper({ size: 'large' })
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Icon Support', () => {
    it('should handle string icon', () => {
      const wrapper = createWrapper({ 
        icon: 'pi pi-check',
        iconPosition: 'left'
      })
      expect(wrapper.exists()).toBe(true)
    })

    it('should handle right icon position', () => {
      const wrapper = createWrapper({ 
        icon: 'pi pi-arrow-right',
        iconPosition: 'right'
      })
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Component API', () => {
    it('should expose primevueRef', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.primevueRef).toBeDefined()
    })

    it('should expose focus method', () => {
      const wrapper = createWrapper()
      expect(typeof wrapper.vm.focus).toBe('function')
    })

    it('should expose blur method', () => {
      const wrapper = createWrapper()
      expect(typeof wrapper.vm.blur).toBe('function')
    })
  })

  describe('Slots', () => {
    it('should render default slot content', () => {
      const wrapper = mount(Button, {
        slots: {
          default: 'Slot Content'
        },
        global: {
          plugins: [[PrimeVue, { theme: { preset: Aura } }]]
        }
      })
      expect(wrapper.text()).toContain('Slot Content')
    })

    it('should render icon slot', () => {
      const wrapper = mount(Button, {
        slots: {
          icon: '<i class="custom-icon">🔥</i>'
        },
        global: {
          plugins: [[PrimeVue, { theme: { preset: Aura } }]]
        }
      })
      expect(wrapper.text()).toContain('🔥')
    })
  })
})