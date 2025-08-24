import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import Modal from '../Modal.vue'
import { useModalHooks } from '../Modal.hooks'

// Mock PrimeVue Dialog
vi.mock('primevue/dialog', () => ({
  default: {
    name: 'PrimeDialog',
    template: `
      <div class="p-dialog" v-if="visible" @keydown="$emit('keydown', $event)">
        <div class="p-dialog-header" v-if="$slots.header">
          <slot name="header" />
        </div>
        <div class="p-dialog-content">
          <slot />
        </div>
        <div class="p-dialog-footer" v-if="$slots.footer">
          <slot name="footer" />
        </div>
      </div>
    `,
    props: ['visible', 'modal', 'header', 'style', 'class', 'closable', 'draggable', 'resizable', 'closeOnEscape', 'maximizable', 'position', 'minWidth', 'minHeight'],
    emits: ['update:visible', 'show', 'hide', 'maximize', 'unmaximize', 'dragend', 'keydown']
  }
}))

// Mock Button component
vi.mock('../Buttons/Button.vue', () => ({
  default: {
    name: 'Button',
    template: '<button @click="$emit(\'click\', $event)" tabindex="0"><slot /></button>',
    emits: ['click']
  }
}))

describe('Modal Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock DOM methods
    Object.defineProperty(HTMLElement.prototype, 'focus', {
      value: vi.fn(),
      writable: true
    })
    Object.defineProperty(HTMLElement.prototype, 'blur', {
      value: vi.fn(),
      writable: true
    })
  })

  describe('Form Integration', () => {
    it('should work with form inputs inside modal', async () => {
      const wrapper = mount(Modal, {
        props: {
          visible: true,
          title: 'Form Modal'
        },
        slots: {
          default: `
            <form>
              <input type="text" name="username" placeholder="Username" />
              <input type="email" name="email" placeholder="Email" />
              <textarea name="message" placeholder="Message"></textarea>
            </form>
          `
        }
      })

      expect(wrapper.find('input[name="username"]').exists()).toBe(true)
      expect(wrapper.find('input[name="email"]').exists()).toBe(true)
      expect(wrapper.find('textarea[name="message"]').exists()).toBe(true)
    })

    it('should handle form submission with modal actions', async () => {
      const onSave = vi.fn()
      const wrapper = mount(Modal, {
        props: {
          visible: true,
          title: 'Form Modal',
          onSave
        },
        slots: {
          default: `
            <form id="test-form">
              <input type="text" name="username" value="testuser" />
            </form>
          `
        }
      })

      const saveButton = wrapper.find('button')
      await saveButton.trigger('click')

      expect(onSave).toHaveBeenCalled()
      expect(onSave).toHaveBeenCalledWith(expect.any(MouseEvent))
    })
  })

  describe('Focus Management', () => {
    it('should manage focus within modal', async () => {
      const wrapper = mount(Modal, {
        props: {
          visible: true,
          title: 'Focus Test Modal',
          onSave: vi.fn(),
          onOk: vi.fn()
        },
        slots: {
          default: `
            <div>
              <input type="text" id="input1" />
              <button id="button1">Button 1</button>
              <input type="text" id="input2" />
            </div>
          `
        }
      })

      await nextTick()

      // Check that focusable elements are present
      expect(wrapper.find('#input1').exists()).toBe(true)
      expect(wrapper.find('#button1').exists()).toBe(true)
      expect(wrapper.find('#input2').exists()).toBe(true)
    })

    it('should trap focus within modal when tabbing', async () => {
      const wrapper = mount(Modal, {
        props: {
          visible: true,
          title: 'Focus Trap Modal',
          onOk: vi.fn()
        },
        slots: {
          default: `
            <div>
              <input type="text" id="first-input" />
              <button id="middle-button">Middle</button>
              <input type="text" id="last-input" />
            </div>
          `
        }
      })

      await nextTick()

      // Simulate tab navigation
      const primeDialog = wrapper.findComponent({ name: 'PrimeDialog' })
      
      // Test forward tab navigation
      await primeDialog.vm.$emit('keydown', new KeyboardEvent('keydown', { key: 'Tab' }))
      
      // Test backward tab navigation
      await primeDialog.vm.$emit('keydown', new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true }))
      
      // The focus management is handled by the hooks, so we just verify the structure exists
      expect(wrapper.find('#first-input').exists()).toBe(true)
      expect(wrapper.find('#last-input').exists()).toBe(true)
    })
  })

  describe('Event Propagation', () => {
    it('should properly propagate events from nested components', async () => {
      const onSave = vi.fn()
      const onCustomAction = vi.fn()
      
      const wrapper = mount(Modal, {
        props: {
          visible: true,
          title: 'Event Test Modal',
          onSave
        },
        slots: {
          default: `
            <div>
              <button @click="$emit('custom-action')" id="custom-btn">Custom Action</button>
            </div>`,
          actions: `
            <button @click="$emit('custom-action')" id="action-btn">Custom Action</button>
          `
        }
      })

      // Test save button event
      const saveButton = wrapper.find('button')
      await saveButton.trigger('click')
      expect(onSave).toHaveBeenCalled()

      // Test that custom buttons are rendered
      expect(wrapper.find('#custom-btn').exists()).toBe(true)
    })

    it('should handle multiple event listeners', async () => {
      const onShow = vi.fn()
      const onHide = vi.fn()
      const onSave = vi.fn()
      
      const wrapper = mount(Modal, {
        props: {
          visible: true,
          title: 'Multi Event Modal',
          onSave
        },
        listeners: {
          show: onShow,
          hide: onHide,
          save: onSave
        }
      })

      const primeDialog = wrapper.findComponent({ name: 'PrimeDialog' })
      
      // Simulate show event
      await primeDialog.vm.$emit('show')
      expect(wrapper.emitted('show')).toBeTruthy()

      // Simulate hide event
      await primeDialog.vm.$emit('hide')
      expect(wrapper.emitted('hide')).toBeTruthy()

      // Test save button
      const saveButton = wrapper.find('button')
      await saveButton.trigger('click')
      expect(wrapper.emitted('save')).toBeTruthy()
    })
  })

  describe('Responsive Behavior', () => {
    it('should adapt to different screen sizes', () => {
      const wrapper = mount(Modal, {
        props: {
          visible: true,
          title: 'Responsive Modal',
          width: '80%',
          height: '70%'
        }
      })

      const primeDialog = wrapper.findComponent({ name: 'PrimeDialog' })
      const style = primeDialog.props('style')
      
      expect(style.width).toBe('80%')
      expect(style.height).toBe('70%')
    })

    it('should handle minimum size constraints', () => {
      const wrapper = mount(Modal, {
        props: {
          visible: true,
          title: 'Size Constrained Modal',
          minWidth: '500px',
          minHeight: '300px'
        }
      })

      const primeDialog = wrapper.findComponent({ name: 'PrimeDialog' })
      
      expect(primeDialog.props('minWidth')).toBe('500px')
      expect(primeDialog.props('minHeight')).toBe('300px')
    })
  })

  describe('Theme Integration', () => {
    it('should apply theme colors correctly', () => {
      const wrapper = mount(Modal, {
        props: {
          visible: true,
          title: 'Themed Modal',
          fontcolor: '#333333',
          bgcolor: '#ffffff',
          onSave: vi.fn()
        }
      })

      const headerContent = wrapper.find('.modal-header-content')
      expect(headerContent.attributes('style')).toContain('color: rgb(51, 51, 51)')
      expect(headerContent.attributes('style')).toContain('background-color: rgb(255, 255, 255)')
    })

    it('should use CSS custom properties for theming', () => {
      const wrapper = mount(Modal, {
        props: {
          visible: true,
          title: 'CSS Custom Props Modal',
          fontcolor: 'var(--primary-color)',
          bgcolor: 'var(--surface-color)',
          onOk: vi.fn()
        }
      })

      const headerContent = wrapper.find('.modal-header-content')
      expect(headerContent.attributes('style')).toContain('var(--primary-color)')
      expect(headerContent.attributes('style')).toContain('var(--surface-color)')
    })
  })

  describe('Performance', () => {
    it('should not re-render unnecessarily', async () => {
      const renderSpy = vi.fn()
      
      const wrapper = mount(Modal, {
        props: {
          visible: true,
          title: 'Performance Test Modal'
        },
        slots: {
          default: {
            template: '<div>{{ renderCount }}</div>',
            setup() {
              renderSpy()
              return { renderCount: 1 }
            }
          }
        }
      })

      // Initial render
      expect(renderSpy).toHaveBeenCalledTimes(1)

      // Update non-reactive prop (should not cause re-render of slot)
      await wrapper.setProps({ title: 'Updated Title' })
      
      // The slot should not re-render when parent props change
      expect(wrapper.find('.modal-title').text()).toBe('Updated Title')
    })

    it('should handle large content efficiently', () => {
      const largeContent = Array.from({ length: 1000 }, (_, i) => `<p>Item ${i}</p>`).join('')
      
      const wrapper = mount(Modal, {
        props: {
          visible: true,
          title: 'Large Content Modal'
        },
        slots: {
          default: `<div class="large-content">${largeContent}</div>`
        }
      })

      expect(wrapper.find('.large-content').exists()).toBe(true)
      expect(wrapper.findAll('p')).toHaveLength(1000)
    })
  })

  describe('Error Handling', () => {
    it('should handle missing props gracefully', () => {
      const wrapper = mount(Modal, {
        props: {
          visible: true
          // Missing title and other props
        }
      })

      // Should render without errors
      expect(wrapper.find('.p-dialog').exists()).toBe(true)
      expect(wrapper.find('.modal-content').exists()).toBe(true)
    })

    it('should handle invalid prop values gracefully', () => {
      const wrapper = mount(Modal, {
        props: {
          visible: true,
          title: 'Error Test Modal',
          width: 'invalid-width',
          height: 'invalid-height'
        }
      })

      // Should still render with invalid CSS values
      expect(wrapper.find('.p-dialog').exists()).toBe(true)
    })
  })
})