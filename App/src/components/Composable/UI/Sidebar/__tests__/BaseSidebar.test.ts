import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseSidebar from '../BaseSidebar.vue'
import type { BaseSidebarProps } from '../Sidebar.types'

describe('BaseSidebar Component', () => {
  describe('Basic Rendering', () => {
    it('should render with default props', () => {
      const wrapper = mount(BaseSidebar)

      expect(wrapper.find('.sidebar').exists()).toBe(true)
      expect(wrapper.find('.sidebar-left').exists()).toBe(true)
    })

    it('should render content slot', () => {
      const wrapper = mount(BaseSidebar, {
        slots: {
          default: '<p>Sidebar content</p>'
        }
      })

      expect(wrapper.html()).toContain('<p>Sidebar content</p>')
    })
  })

  describe('Props and Styling', () => {
    it('should apply custom width', () => {
      const wrapper = mount(BaseSidebar, {
        props: {
          width: '400px'
        }
      })

      const sidebar = wrapper.find('.sidebar')
      expect(sidebar.attributes('style')).toContain('width: 400px')
      expect(sidebar.attributes('style')).toContain('min-width: 400px')
    })

    it('should apply right position class', () => {
      const wrapper = mount(BaseSidebar, {
        props: {
          position: 'right'
        }
      })

      expect(wrapper.find('.sidebar-right').exists()).toBe(true)
      expect(wrapper.find('.sidebar-left').exists()).toBe(false)
    })

    it('should apply custom styles', () => {
      const customStyle = {
        backgroundColor: 'red',
        border: '1px solid blue'
      }

      const wrapper = mount(BaseSidebar, {
        props: {
          customStyle
        }
      })

      const sidebar = wrapper.find('.sidebar')
      const style = sidebar.attributes('style')
      expect(style).toContain('background-color: red')
      expect(style).toContain('border: 1px solid blue')
    })
  })

  describe('Backward Compatibility', () => {
    it('should work with legacy props structure', () => {
      const legacyProps: BaseSidebarProps = {
        width: '350px',
        position: 'right',
        customStyle: {
          zIndex: 200
        }
      }

      const wrapper = mount(BaseSidebar, {
        props: legacyProps
      })

      expect(wrapper.find('.sidebar-right').exists()).toBe(true)
      const style = wrapper.find('.sidebar').attributes('style')
      expect(style).toContain('width: 350px')
      expect(style).toContain('z-index: 200')
    })
  })
})