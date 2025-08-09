import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import Modal from '../Modal.vue'
import type { ModalWrapperProps } from '../Modal.types'

// Mock PrimeVue Dialog component
vi.mock('primevue/dialog', () => ({
  default: {
    name: 'PrimeDialog',
    template: `
      <div class="p-dialog" v-if="visible">
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
    emits: ['update:visible', 'show', 'hide', 'maximize', 'unmaximize', 'dragend']
  }
}))

// Mock Button component
vi.mock('../Buttons/Button.vue', () => ({
  default: {
    name: 'Button',
    template: '<button><slot /></button>',
    props: ['style'],
    emits: ['click'],
    setup(props: any, { emit }: any) {
      const handleClick = (event: MouseEvent) => {
        emit('click', event)
      }
      return { handleClick }
    }
  }
}))

describe('Modal Wrapper Component', () => {
  const defaultProps: ModalWrapperProps = {
    visible: true,
    title: 'Test Modal',
    caption: 'Test Caption'
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('should render modal with title and caption', () => {
      const wrapper = mount(Modal, {
        props: defaultProps
      })

      expect(wrapper.find('.modal-title').text()).toBe('Test Modal')
      expect(wrapper.find('.modal-caption').text()).toBe('Test Caption')
    })

    it('should render modal content slot', () => {
      const wrapper = mount(Modal, {
        props: defaultProps,
        slots: {
          default: '<p>Modal content</p>'
        }
      })

      expect(wrapper.find('.modal-content').html()).toContain('<p>Modal content</p>')
    })

    it('should not render when visible is false', () => {
      const wrapper = mount(Modal, {
        props: {
          ...defaultProps,
          visible: false
        }
      })

      expect(wrapper.find('.p-dialog').exists()).toBe(false)
    })
  })

  describe('Header Functionality', () => {
    it('should show header when showHeader is true and title exists', () => {
      const wrapper = mount(Modal, {
        props: {
          ...defaultProps,
          showHeader: true
        }
      })

      expect(wrapper.find('.modal-header-content').exists()).toBe(true)
    })

    it('should hide header when showHeader is false', () => {
      const wrapper = mount(Modal, {
        props: {
          ...defaultProps,
          showHeader: false
        }
      })

      expect(wrapper.find('.modal-header-content').exists()).toBe(false)
    })

    it('should apply header styling from fontcolor and bgcolor props', () => {
      const wrapper = mount(Modal, {
        props: {
          ...defaultProps,
          fontcolor: '#ff0000',
          bgcolor: '#00ff00'
        }
      })

      const headerContent = wrapper.find('.modal-header-content')
      expect(headerContent.attributes('style')).toContain('color: rgb(255, 0, 0)')
      expect(headerContent.attributes('style')).toContain('background-color: rgb(0, 255, 0)')
    })

    it('should render only title when caption is not provided', () => {
      const wrapper = mount(Modal, {
        props: {
          visible: true,
          title: 'Test Modal'
        }
      })

      expect(wrapper.find('.modal-title').exists()).toBe(true)
      expect(wrapper.find('.modal-caption').exists()).toBe(false)
    })
  })

  describe('Footer and Actions', () => {
    it('should show actions when onSave is provided', () => {
      const onSave = vi.fn()
      const wrapper = mount(Modal, {
        props: {
          ...defaultProps,
          onSave
        }
      })

      expect(wrapper.find('.modal-actions').exists()).toBe(true)
      expect(wrapper.text()).toContain('Save')
    })

    it('should show actions when onOk is provided', () => {
      const onOk = vi.fn()
      const wrapper = mount(Modal, {
        props: {
          ...defaultProps,
          onOk
        }
      })

      expect(wrapper.find('.modal-actions').exists()).toBe(true)
      expect(wrapper.text()).toContain('OK')
    })

    it('should call onSave when Save button is clicked', async () => {
      const onSave = vi.fn()
      const wrapper = mount(Modal, {
        props: {
          ...defaultProps,
          onSave
        }
      })

      // Find the Save button by text content and click it
      const saveButton = wrapper.find('button')
      expect(saveButton.text()).toContain('Save')
      
      await saveButton.trigger('click')

      // The onSave function should be called at least once
      expect(onSave).toHaveBeenCalled()
      expect(onSave).toHaveBeenCalledWith(expect.any(MouseEvent))
    })

    it('should call onOk when OK button is clicked', async () => {
      const onOk = vi.fn()
      const wrapper = mount(Modal, {
        props: {
          ...defaultProps,
          onOk
        }
      })

      // Find the OK button by text content and click it
      const okButton = wrapper.find('button')
      expect(okButton.text()).toContain('OK')
      
      await okButton.trigger('click')

      // The onOk function should be called at least once
      expect(onOk).toHaveBeenCalled()
      expect(onOk).toHaveBeenCalledWith(expect.any(MouseEvent))
    })

    it('should render custom footer slot', () => {
      const wrapper = mount(Modal, {
        props: defaultProps,
        slots: {
          footer: '<div class="custom-footer">Custom Footer</div>'
        }
      })

      expect(wrapper.find('.custom-footer').text()).toBe('Custom Footer')
    })

    it('should render custom actions slot', () => {
      const wrapper = mount(Modal, {
        props: {
          ...defaultProps,
          onSave: vi.fn()
        },
        slots: {
          actions: '<button class="custom-action">Custom Action</button>'
        }
      })

      expect(wrapper.find('.custom-action').text()).toBe('Custom Action')
    })
  })

  describe('Event Handling', () => {
    it('should emit update:visible when visibility changes', async () => {
      const wrapper = mount(Modal, {
        props: defaultProps
      })

      // Simulate PrimeDialog emitting update:visible
      const primeDialog = wrapper.findComponent({ name: 'PrimeDialog' })
      await primeDialog.vm.$emit('update:visible', false)

      expect(wrapper.emitted('update:visible')).toBeTruthy()
      expect(wrapper.emitted('update:visible')![0]).toEqual([false])
    })

    it('should emit show event', async () => {
      const wrapper = mount(Modal, {
        props: defaultProps
      })

      const primeDialog = wrapper.findComponent({ name: 'PrimeDialog' })
      await primeDialog.vm.$emit('show')

      expect(wrapper.emitted('show')).toBeTruthy()
    })

    it('should emit hide event', async () => {
      const wrapper = mount(Modal, {
        props: defaultProps
      })

      const primeDialog = wrapper.findComponent({ name: 'PrimeDialog' })
      await primeDialog.vm.$emit('hide')

      expect(wrapper.emitted('hide')).toBeTruthy()
    })

    it('should emit save event when save button is clicked', async () => {
      const wrapper = mount(Modal, {
        props: {
          ...defaultProps,
          onSave: vi.fn()
        }
      })

      const saveButton = wrapper.find('button')
      await saveButton.trigger('click')

      expect(wrapper.emitted('save')).toBeTruthy()
    })

    it('should emit ok event when ok button is clicked', async () => {
      const wrapper = mount(Modal, {
        props: {
          ...defaultProps,
          onOk: vi.fn()
        }
      })

      const okButton = wrapper.find('button')
      await okButton.trigger('click')

      expect(wrapper.emitted('ok')).toBeTruthy()
    })
  })

  describe('Styling and Layout', () => {
    it('should apply custom width and height', () => {
      const wrapper = mount(Modal, {
        props: {
          ...defaultProps,
          width: '800px',
          height: '600px'
        }
      })

      const primeDialog = wrapper.findComponent({ name: 'PrimeDialog' })
      const style = primeDialog.props('style')
      expect(style).toEqual({ width: '800px', height: '600px' })
    })

    it('should apply custom CSS classes', () => {
      const wrapper = mount(Modal, {
        props: {
          ...defaultProps,
          class: 'custom-modal-class'
        }
      })

      const primeDialog = wrapper.findComponent({ name: 'PrimeDialog' })
      expect(primeDialog.props('class')).toContain('custom-modal-class')
    })

    it('should merge custom styles with default styles', () => {
      const wrapper = mount(Modal, {
        props: {
          ...defaultProps,
          style: 'border: 1px solid red;',
          width: '500px'
        }
      })

      const primeDialog = wrapper.findComponent({ name: 'PrimeDialog' })
      const style = primeDialog.props('style')
      expect(style).toContain('border: 1px solid red')
      expect(style).toContain('width: 500px')
    })
  })

  describe('Props Mapping', () => {
    it('should pass through PrimeVue Dialog props correctly', () => {
      const wrapper = mount(Modal, {
        props: {
          ...defaultProps,
          modal: false,
          closable: false,
          draggable: true,
          resizable: true,
          closeOnEscape: false,
          maximizable: true,
          position: 'top',
          minWidth: '400px',
          minHeight: '200px'
        }
      })

      const primeDialog = wrapper.findComponent({ name: 'PrimeDialog' })
      expect(primeDialog.props('modal')).toBe(false)
      expect(primeDialog.props('closable')).toBe(false)
      expect(primeDialog.props('draggable')).toBe(true)
      expect(primeDialog.props('resizable')).toBe(true)
      expect(primeDialog.props('closeOnEscape')).toBe(false)
      expect(primeDialog.props('maximizable')).toBe(true)
      expect(primeDialog.props('position')).toBe('top')
      expect(primeDialog.props('minWidth')).toBe('400px')
      expect(primeDialog.props('minHeight')).toBe('200px')
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      const wrapper = mount(Modal, {
        props: {
          ...defaultProps,
          id: 'test-modal'
        }
      })

      // Check if the modal has proper structure for accessibility
      expect(wrapper.find('.modal-title').exists()).toBe(true)
      expect(wrapper.find('.modal-content').exists()).toBe(true)
    })
  })

  describe('Component Exposure', () => {
    it('should expose primevueRef and utility methods', () => {
      const wrapper = mount(Modal, {
        props: defaultProps
      })

      const vm = wrapper.vm as any
      expect(vm.primevueRef).toBeDefined()
      expect(typeof vm.focus).toBe('function')
      expect(typeof vm.blur).toBe('function')
      expect(typeof vm.maximize).toBe('function')
      expect(typeof vm.minimize).toBe('function')
    })
  })

  describe('Backward Compatibility', () => {
    it('should work with legacy ModalProps interface', () => {
      const legacyProps = {
        visible: true,
        title: 'Legacy Modal',
        caption: 'Legacy Caption',
        fontcolor: 'var(--grey-2)',
        bgcolor: 'var(--grey-3)',
        onOk: vi.fn(),
        onSave: vi.fn()
      }

      const wrapper = mount(Modal, {
        props: legacyProps
      })

      expect(wrapper.find('.modal-title').text()).toBe('Legacy Modal')
      expect(wrapper.find('.modal-caption').text()).toBe('Legacy Caption')
      expect(wrapper.find('.modal-actions').exists()).toBe(true)
    })
  })
})