/**
 * Integration tests for legacy Table components (Headers and Row)
 */

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Headers from '../Headers.vue'
import Row from '../Row.vue'

describe('Legacy Table Components', () => {
  describe('Headers Component', () => {
    it('should render with default column style', () => {
      const wrapper = mount(Headers, {
        slots: {
          default: '<div class="header">Test Header</div>'
        }
      })

      expect(wrapper.find('.table-header').exists()).toBe(true)
      expect(wrapper.text()).toContain('Test Header')
    })

    it('should apply custom column style', () => {
      const wrapper = mount(Headers, {
        props: {
          columnstyle: 'repeat(4, 1fr)'
        },
        slots: {
          default: '<div class="header">Test Header</div>'
        }
      })

      const headerElement = wrapper.find('.table-header')
      expect(headerElement.attributes('style')).toContain('--columnstyle: repeat(4, 1fr)')
    })

    it('should render multiple header cells', () => {
      const wrapper = mount(Headers, {
        slots: {
          default: `
            <div class="header">ID</div>
            <div class="header">Name</div>
            <div class="header">Status</div>
          `
        }
      })

      expect(wrapper.text()).toContain('ID')
      expect(wrapper.text()).toContain('Name')
      expect(wrapper.text()).toContain('Status')
    })
  })

  describe('Row Component', () => {
    it('should render with default column style', () => {
      const wrapper = mount(Row, {
        slots: {
          default: '<div>Test Row Content</div>'
        }
      })

      expect(wrapper.find('.table-row').exists()).toBe(true)
      expect(wrapper.text()).toContain('Test Row Content')
    })

    it('should apply custom column style', () => {
      const wrapper = mount(Row, {
        props: {
          columnstyle: 'repeat(4, 1fr)'
        },
        slots: {
          default: '<div>Test Row Content</div>'
        }
      })

      const rowElement = wrapper.find('.table-row')
      expect(rowElement.attributes('style')).toContain('--columnstyle: repeat(4, 1fr)')
    })

    it('should handle selected state', () => {
      const wrapper = mount(Row, {
        props: {
          selected: true
        },
        slots: {
          default: '<div>Selected Row</div>'
        }
      })

      const rowElement = wrapper.find('.table-row')
      expect(rowElement.classes()).toContain('selected')
    })

    it('should not have selected class when not selected', () => {
      const wrapper = mount(Row, {
        props: {
          selected: false
        },
        slots: {
          default: '<div>Normal Row</div>'
        }
      })

      const rowElement = wrapper.find('.table-row')
      expect(rowElement.classes()).not.toContain('selected')
    })

    it('should render multiple row cells', () => {
      const wrapper = mount(Row, {
        slots: {
          default: `
            <div>1</div>
            <div>John Doe</div>
            <div>Active</div>
          `
        }
      })

      expect(wrapper.text()).toContain('1')
      expect(wrapper.text()).toContain('John Doe')
      expect(wrapper.text()).toContain('Active')
    })
  })

  describe('Headers and Row Integration', () => {
    it('should work together with consistent styling', () => {
      const columnStyle = 'repeat(3, 1fr)'
      
      const headersWrapper = mount(Headers, {
        props: { columnstyle: columnStyle },
        slots: {
          default: `
            <div class="header">ID</div>
            <div class="header">Name</div>
            <div class="header">Status</div>
          `
        }
      })

      const rowWrapper = mount(Row, {
        props: { columnstyle: columnStyle },
        slots: {
          default: `
            <div>1</div>
            <div>John Doe</div>
            <div>Active</div>
          `
        }
      })

      // Both should use the same column style
      expect(headersWrapper.find('.table-header').attributes('style')).toContain(`--columnstyle: ${columnStyle}`)
      expect(rowWrapper.find('.table-row').attributes('style')).toContain(`--columnstyle: ${columnStyle}`)
    })
  })
})