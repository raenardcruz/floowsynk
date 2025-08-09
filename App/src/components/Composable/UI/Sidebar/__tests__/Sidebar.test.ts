import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import Sidebar from '../Sidebar.vue'
import type { SidebarWrapperProps } from '../Sidebar.types'

// Mock PrimeVue Sidebar component
vi.mock('primevue/sidebar', () => ({
  default: {
    name: 'PrimeSidebar',
    template: `
      <div class="p-sidebar" v-if="visible" :class="'p-sidebar-' + position">
        <div class="p-sidebar-header" v-if="$slots.header">
          <slot name="header" />
        </div>
        <div class="p-sidebar-content">
          <slot />
        </div>
        <div class="p-sidebar-footer" v-if="$slots.footer">
          <slot name="footer" />
        </div>
      </div>
    `,
    props: [
      'visible', 'position', 'header', 'modal', 'dismissable', 'showCloseButton',
      'closeOnEscape', 'blockScroll', 'baseZIndex', 'autoZIndex', 'appendTo',
      'class', 'style', 'maskClass', 'transitionOptions'
    ],
    emits: ['update:visible', 'show', 'hide']
  }
}))

describe('Sidebar Wrapper Component', () => {
  const defaultProps: SidebarWrapperProps = {
    visible: true,
    title: 'Test Sidebar',
    caption: 'Test Caption'
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('should render sidebar with title and caption', () => {
      const wrapper = mount(Sidebar, {
        props: defaultProps
      })

      expect(wrapper.find('.sidebar-title').text()).toBe('Test Sidebar')
      expect(wrapper.find('.sidebar-caption').text()).toBe('Test Caption')
    })

    it('should render sidebar content slot', () => {
      const wrapper = mount(Sidebar, {
        props: defaultProps,
        slots: {
          default: '<p>Sidebar content</p>'
        }
      })

      expect(wrapper.find('.sidebar-content').html()).toContain('<p>Sidebar content</p>')
    })

    it('should not render when visible is false', () => {
      const wrapper = mount(Sidebar, {
        props: {
          ...defaultProps,
          visible: false
        }
      })

      expect(wrapper.find('.p-sidebar').exists()).toBe(false)
    })
  })

  describe('Header Functionality', () => {
    it('should show custom header when title exists', () => {
      const wrapper = mount(Sidebar, {
        props: {
          ...defaultProps,
          title: 'Custom Title'
        }
      })

      expect(wrapper.find('.sidebar-header-content').exists()).toBe(true)
      expect(wrapper.find('.sidebar-title').text()).toBe('Custom Title')
    })

    it('should show custom header when caption exists', () => {
      const wrapper = mount(Sidebar, {
        props: {
          visible: true,
          caption: 'Custom Caption'
        }
      })

      expect(wrapper.find('.sidebar-header-content').exists()).toBe(true)
      expect(wrapper.find('.sidebar-caption').text()).toBe('Custom Caption')
    })

    it('should not show custom header when neither title nor caption exist', () => {
      const wrapper = mount(Sidebar, {
        props: {
          visible: true
        }
      })

      expect(wrapper.find('.sidebar-header-content').exists()).toBe(false)
    })

    it('should render only title when caption is not provided', () => {
      const wrapper = mount(Sidebar, {
        props: {
          visible: true,
          title: 'Test Sidebar'
        }
      })

      expect(wrapper.find('.sidebar-title').exists()).toBe(true)
      expect(wrapper.find('.sidebar-caption').exists()).toBe(false)
    })
  })

  describe('Position and Styling', () => {
    it('should apply correct position class', () => {
      const wrapper = mount(Sidebar, {
        props: {
          ...defaultProps,
          position: 'right'
        }
      })

      const primeSidebar = wrapper.findComponent({ name: 'PrimeSidebar' })
      expect(primeSidebar.props('position')).toBe('right')
    })

    it('should apply custom width for left/right positions', () => {
      const wrapper = mount(Sidebar, {
        props: {
          ...defaultProps,
          position: 'left',
          width: '400px'
        }
      })

      const primeSidebar = wrapper.findComponent({ name: 'PrimeSidebar' })
      const style = primeSidebar.props('style')
      expect(style.width).toBe('400px')
    })

    it('should apply custom height for top/bottom positions', () => {
      const wrapper = mount(Sidebar, {
        props: {
          ...defaultProps,
          position: 'top',
          height: '200px'
        }
      })

      const primeSidebar = wrapper.findComponent({ name: 'PrimeSidebar' })
      const style = primeSidebar.props('style')
      expect(style.height).toBe('200px')
    })

    it('should apply custom CSS classes', () => {
      const wrapper = mount(Sidebar, {
        props: {
          ...defaultProps,
          class: 'custom-sidebar-class'
        }
      })

      const primeSidebar = wrapper.findComponent({ name: 'PrimeSidebar' })
      expect(primeSidebar.props('class')).toContain('custom-sidebar-class')
    })

    it('should merge custom styles with default styles', () => {
      const wrapper = mount(Sidebar, {
        props: {
          ...defaultProps,
          style: 'border: 1px solid red;',
          width: '350px'
        }
      })

      const primeSidebar = wrapper.findComponent({ name: 'PrimeSidebar' })
      const style = primeSidebar.props('style')
      expect(style).toContain('border: 1px solid red')
      expect(style).toContain('width: 350px')
    })
  })

  describe('Props Mapping', () => {
    it('should pass through PrimeVue Sidebar props correctly', () => {
      const wrapper = mount(Sidebar, {
        props: {
          ...defaultProps,
          modal: false,
          dismissable: false,
          showCloseButton: false,
          closeOnEscape: false,
          blockScroll: false,
          baseZIndex: 1000,
          autoZIndex: false,
          transitionOptions: '300ms ease'
        }
      })

      const primeSidebar = wrapper.findComponent({ name: 'PrimeSidebar' })
      expect(primeSidebar.props('modal')).toBe(false)
      expect(primeSidebar.props('dismissable')).toBe(false)
      expect(primeSidebar.props('showCloseButton')).toBe(false)
      expect(primeSidebar.props('closeOnEscape')).toBe(false)
      expect(primeSidebar.props('blockScroll')).toBe(false)
      expect(primeSidebar.props('baseZIndex')).toBe(1000)
      expect(primeSidebar.props('autoZIndex')).toBe(false)
      expect(primeSidebar.props('transitionOptions')).toBe('300ms ease')
    })

    it('should use default props when not specified', () => {
      const wrapper = mount(Sidebar, {
        props: {
          visible: true
        }
      })

      const primeSidebar = wrapper.findComponent({ name: 'PrimeSidebar' })
      expect(primeSidebar.props('position')).toBe('left')
      expect(primeSidebar.props('modal')).toBe(true)
      expect(primeSidebar.props('dismissable')).toBe(true)
      expect(primeSidebar.props('showCloseButton')).toBe(true)
      expect(primeSidebar.props('closeOnEscape')).toBe(true)
      expect(primeSidebar.props('blockScroll')).toBe(true)
      expect(primeSidebar.props('autoZIndex')).toBe(true)
    })
  })

  describe('Event Handling', () => {
    it('should emit update:visible when visibility changes', async () => {
      const wrapper = mount(Sidebar, {
        props: defaultProps
      })

      // Simulate PrimeSidebar emitting update:visible
      const primeSidebar = wrapper.findComponent({ name: 'PrimeSidebar' })
      await primeSidebar.vm.$emit('update:visible', false)

      expect(wrapper.emitted('update:visible')).toBeTruthy()
      expect(wrapper.emitted('update:visible')![0]).toEqual([false])
    })

    it('should emit show event', async () => {
      const wrapper = mount(Sidebar, {
        props: defaultProps
      })

      const primeSidebar = wrapper.findComponent({ name: 'PrimeSidebar' })
      await primeSidebar.vm.$emit('show')

      expect(wrapper.emitted('show')).toBeTruthy()
    })

    it('should emit hide event', async () => {
      const wrapper = mount(Sidebar, {
        props: defaultProps
      })

      const primeSidebar = wrapper.findComponent({ name: 'PrimeSidebar' })
      await primeSidebar.vm.$emit('hide')

      expect(wrapper.emitted('hide')).toBeTruthy()
    })
  })

  describe('Slots', () => {
    it('should render footer slot', () => {
      const wrapper = mount(Sidebar, {
        props: defaultProps,
        slots: {
          footer: '<div class="custom-footer">Custom Footer</div>'
        }
      })

      expect(wrapper.find('.custom-footer').text()).toBe('Custom Footer')
    })

    it('should render default content slot', () => {
      const wrapper = mount(Sidebar, {
        props: defaultProps,
        slots: {
          default: '<div class="custom-content">Custom Content</div>'
        }
      })

      expect(wrapper.find('.custom-content').text()).toBe('Custom Content')
    })
  })

  describe('Accessibility', () => {
    it('should have proper structure for accessibility', () => {
      const wrapper = mount(Sidebar, {
        props: {
          ...defaultProps,
          id: 'test-sidebar'
        }
      })

      // Check if the sidebar has proper structure for accessibility
      expect(wrapper.find('.sidebar-title').exists()).toBe(true)
      expect(wrapper.find('.sidebar-content').exists()).toBe(true)
    })
  })

  describe('Component Exposure', () => {
    it('should expose primevueRef and utility methods', () => {
      const wrapper = mount(Sidebar, {
        props: defaultProps
      })

      const vm = wrapper.vm as any
      expect(vm.primevueRef).toBeDefined()
      expect(typeof vm.focus).toBe('function')
      expect(typeof vm.blur).toBe('function')
    })
  })

  describe('Backward Compatibility', () => {
    it('should work with legacy SidebarProps interface', () => {
      const legacyProps = {
        visible: true,
        title: 'Legacy Sidebar',
        caption: 'Legacy Caption'
      }

      const wrapper = mount(Sidebar, {
        props: legacyProps
      })

      expect(wrapper.find('.sidebar-title').text()).toBe('Legacy Sidebar')
      expect(wrapper.find('.sidebar-caption').text()).toBe('Legacy Caption')
    })
  })

  describe('Responsive Behavior', () => {
    it('should handle different positions correctly', () => {
      const positions = ['left', 'right', 'top', 'bottom', 'full'] as const
      
      positions.forEach(position => {
        const wrapper = mount(Sidebar, {
          props: {
            ...defaultProps,
            position
          }
        })

        const primeSidebar = wrapper.findComponent({ name: 'PrimeSidebar' })
        expect(primeSidebar.props('position')).toBe(position)
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle missing props gracefully', () => {
      const wrapper = mount(Sidebar, {
        props: {
          visible: true
          // Missing title and other props
        }
      })

      // Should render without errors
      expect(wrapper.find('.p-sidebar').exists()).toBe(true)
      expect(wrapper.find('.sidebar-content').exists()).toBe(true)
    })

    it('should handle invalid prop values gracefully', () => {
      const wrapper = mount(Sidebar, {
        props: {
          visible: true,
          title: 'Error Test Sidebar',
          width: 'invalid-width',
          height: 'invalid-height'
        }
      })

      // Should still render with invalid CSS values
      expect(wrapper.find('.p-sidebar').exists()).toBe(true)
    })
  })
})