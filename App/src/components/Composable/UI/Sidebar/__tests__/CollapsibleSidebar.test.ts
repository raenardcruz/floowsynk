import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import CollapsibleSidebar from '../CollapsibleSidebar.vue'
import type { CollapsibleSidebarProps } from '../Sidebar.types'

// Mock the Sidebar component
vi.mock('../Sidebar.vue', () => ({
  default: {
    name: 'Sidebar',
    template: `
      <div class="sidebar-mock" v-if="visible">
        <slot />
      </div>
    `,
    props: ['visible', 'position', 'width', 'modal', 'dismissable', 'showCloseButton', 'closeOnEscape', 'blockScroll', 'style']
  }
}))

describe('CollapsibleSidebar Component', () => {
  describe('Basic Rendering', () => {
    it('should render with default props', () => {
      const wrapper = mount(CollapsibleSidebar)

      expect(wrapper.find('.collapsible-sidebar').exists()).toBe(true)
      expect(wrapper.find('.toggle-sidebar').exists()).toBe(true)
      expect(wrapper.find('.sidebar-mock').exists()).toBe(true)
    })

    it('should render content slot', () => {
      const wrapper = mount(CollapsibleSidebar, {
        slots: {
          default: '<p>Collapsible sidebar content</p>'
        }
      })

      expect(wrapper.html()).toContain('<p>Collapsible sidebar content</p>')
    })
  })

  describe('Toggle Functionality', () => {
    it('should toggle sidebar visibility when toggle button is clicked', async () => {
      const wrapper = mount(CollapsibleSidebar, {
        props: {
          modelValue: true
        }
      })

      expect(wrapper.find('.sidebar-mock').exists()).toBe(true)

      const toggleButton = wrapper.find('.toggle-sidebar')
      await toggleButton.trigger('click')

      // Check if the model value was updated
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')![0]).toEqual([false])
    })

    it('should show correct toggle icon based on sidebar state', async () => {
      const wrapper = mount(CollapsibleSidebar, {
        props: {
          modelValue: true,
          position: 'left'
        }
      })

      const icon = wrapper.find('.material-symbols-outlined')
      expect(icon.text()).toBe('keyboard_double_arrow_left')

      // Update model value to false
      await wrapper.setProps({ modelValue: false })
      expect(icon.text()).toBe('keyboard_double_arrow_right')
    })

    it('should show correct toggle icon for right position', async () => {
      const wrapper = mount(CollapsibleSidebar, {
        props: {
          modelValue: true,
          position: 'right'
        }
      })

      const icon = wrapper.find('.material-symbols-outlined')
      expect(icon.text()).toBe('keyboard_double_arrow_right')

      // Update model value to false
      await wrapper.setProps({ modelValue: false })
      expect(icon.text()).toBe('keyboard_double_arrow_left')
    })

    it('should hide toggle button when showToggleButton is false', () => {
      const wrapper = mount(CollapsibleSidebar, {
        props: {
          showToggleButton: false
        }
      })

      expect(wrapper.find('.toggle-sidebar').exists()).toBe(false)
    })
  })

  describe('Props and Styling', () => {
    it('should apply custom width', () => {
      const wrapper = mount(CollapsibleSidebar, {
        props: {
          width: '400px',
          modelValue: true
        }
      })

      const collapsibleSidebar = wrapper.find('.collapsible-sidebar')
      const style = collapsibleSidebar.attributes('style')
      expect(style).toContain('width: 400px')
    })

    it('should apply correct position styles', () => {
      const wrapper = mount(CollapsibleSidebar, {
        props: {
          position: 'right',
          modelValue: true
        }
      })

      const collapsibleSidebar = wrapper.find('.collapsible-sidebar')
      const style = collapsibleSidebar.attributes('style')
      expect(style).toContain('right: 0')
    })

    it('should pass props to inner Sidebar component', () => {
      const wrapper = mount(CollapsibleSidebar, {
        props: {
          width: '350px',
          position: 'right',
          closeOnEscape: false,
          customStyle: { backgroundColor: 'blue' }
        }
      })

      const sidebarComponent = wrapper.findComponent({ name: 'Sidebar' })
      expect(sidebarComponent.props('width')).toBe('350px')
      expect(sidebarComponent.props('position')).toBe('right')
      expect(sidebarComponent.props('closeOnEscape')).toBe(false)
      expect(sidebarComponent.props('modal')).toBe(false)
      expect(sidebarComponent.props('dismissable')).toBe(false)
      expect(sidebarComponent.props('showCloseButton')).toBe(false)
      expect(sidebarComponent.props('blockScroll')).toBe(false)
    })
  })

  describe('Transitions', () => {
    it('should use correct transition name for left position', () => {
      const wrapper = mount(CollapsibleSidebar, {
        props: {
          position: 'left'
        }
      })

      const transition = wrapper.findComponent({ name: 'Transition' })
      expect(transition.props('name')).toBe('slide')
    })

    it('should use correct transition name for right position', () => {
      const wrapper = mount(CollapsibleSidebar, {
        props: {
          position: 'right'
        }
      })

      const transition = wrapper.findComponent({ name: 'Transition' })
      expect(transition.props('name')).toBe('slide-right')
    })
  })

  describe('Backward Compatibility', () => {
    it('should work with legacy props structure', () => {
      const legacyProps: CollapsibleSidebarProps = {
        width: '320px',
        position: 'right',
        customStyle: { zIndex: 150 },
        closeOnClickOutside: false,
        closeOnEscape: false,
        showToggleButton: false
      }

      const wrapper = mount(CollapsibleSidebar, {
        props: legacyProps
      })

      expect(wrapper.find('.toggle-sidebar').exists()).toBe(false)
      
      const sidebarComponent = wrapper.findComponent({ name: 'Sidebar' })
      expect(sidebarComponent.props('width')).toBe('320px')
      expect(sidebarComponent.props('position')).toBe('right')
      expect(sidebarComponent.props('closeOnEscape')).toBe(false)
    })
  })

  describe('Responsive Behavior', () => {
    it('should adjust width when sidebar is collapsed', async () => {
      const wrapper = mount(CollapsibleSidebar, {
        props: {
          modelValue: false,
          width: '300px'
        }
      })

      const collapsibleSidebar = wrapper.find('.collapsible-sidebar')
      const style = collapsibleSidebar.attributes('style')
      expect(style).toContain('width: 0px')
    })

    it('should position toggle button correctly when sidebar is expanded', () => {
      const wrapper = mount(CollapsibleSidebar, {
        props: {
          modelValue: true,
          width: '300px',
          position: 'left'
        }
      })

      const toggleButton = wrapper.find('.toggle-sidebar')
      const style = toggleButton.attributes('style')
      expect(style).toContain('left: calc(308px)')
    })

    it('should position toggle button correctly when sidebar is collapsed', () => {
      const wrapper = mount(CollapsibleSidebar, {
        props: {
          modelValue: false,
          position: 'left'
        }
      })

      const toggleButton = wrapper.find('.toggle-sidebar')
      const style = toggleButton.attributes('style')
      expect(style).toContain('left: 8px')
    })
  })
})