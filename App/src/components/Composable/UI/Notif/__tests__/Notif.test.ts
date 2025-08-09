/**
 * Unit tests for Notif wrapper component
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import Notif from '../Notif.vue'
import type { NotifWrapperProps, NotifOptions } from '../Notif.types'

// Mock PrimeVue Toast
vi.mock('primevue/toast', () => ({
  default: {
    name: 'Toast',
    template: '<div class="p-toast" data-testid="prime-toast"><slot /></div>',
    props: ['position', 'autoZIndex', 'baseZIndex', 'breakpoint'],
    methods: {
      add: vi.fn(),
      remove: vi.fn(),
      removeAllGroups: vi.fn()
    }
  }
}))

describe('Notif Wrapper Component', () => {
  let wrapper: any

  beforeEach(() => {
    wrapper = null
  })

  describe('Component Rendering', () => {
    it('should render with default props', () => {
      wrapper = mount(Notif)
      
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('.notif-wrapper').exists()).toBe(true)
      expect(wrapper.findComponent({ name: 'Toast' }).exists()).toBe(true)
    })

    it('should apply custom position', () => {
      wrapper = mount(Notif, {
        props: {
          position: 'top-left'
        }
      })
      
      const toast = wrapper.findComponent({ name: 'Toast' })
      expect(toast.props('position')).toBe('top-left')
    })

    it('should apply custom z-index settings', () => {
      wrapper = mount(Notif, {
        props: {
          autoZIndex: false,
          baseZIndex: 2000
        }
      })
      
      const toast = wrapper.findComponent({ name: 'Toast' })
      expect(toast.props('autoZIndex')).toBe(false)
      expect(toast.props('baseZIndex')).toBe(2000)
    })

    it('should apply custom breakpoint', () => {
      const customBreakpoint = '768px'
      wrapper = mount(Notif, {
        props: {
          breakpoint: customBreakpoint
        }
      })
      
      const toast = wrapper.findComponent({ name: 'Toast' })
      expect(toast.props('breakpoint')).toBe(customBreakpoint)
    })
  })

  describe('Props and Styling', () => {
    it('should apply custom id', () => {
      const customId = 'custom-notif-id'
      wrapper = mount(Notif, {
        props: {
          id: customId
        }
      })
      
      const toast = wrapper.findComponent({ name: 'Toast' })
      expect(toast.attributes('id')).toBe(customId)
    })

    it('should apply custom class', () => {
      const customClass = 'custom-notif-class'
      wrapper = mount(Notif, {
        props: {
          class: customClass
        }
      })
      
      const toast = wrapper.findComponent({ name: 'Toast' })
      expect(toast.classes()).toContain(customClass)
    })

    it('should apply custom data-testid', () => {
      const customTestId = 'custom-notif-test'
      wrapper = mount(Notif, {
        props: {
          dataTestid: customTestId
        }
      })
      
      const toast = wrapper.findComponent({ name: 'Toast' })
      expect(toast.attributes('data-testid')).toBe(customTestId)
    })

    it('should apply default data-testid when not provided', () => {
      wrapper = mount(Notif)
      
      const toast = wrapper.findComponent({ name: 'Toast' })
      expect(toast.attributes('data-testid')).toBe('notif-component')
    })
  })

  describe('Position Variants', () => {
    const positions = [
      'top-left', 'top-center', 'top-right',
      'bottom-left', 'bottom-center', 'bottom-right'
    ] as const

    positions.forEach(position => {
      it(`should apply ${position} position`, () => {
        wrapper = mount(Notif, {
          props: { position }
        })
        
        const toast = wrapper.findComponent({ name: 'Toast' })
        expect(toast.props('position')).toBe(position)
      })
    })
  })

  describe('Component Methods', () => {
    beforeEach(() => {
      wrapper = mount(Notif)
    })

    it('should expose add method', () => {
      expect(wrapper.vm.add).toBeDefined()
      expect(typeof wrapper.vm.add).toBe('function')
    })

    it('should expose remove method', () => {
      expect(wrapper.vm.remove).toBeDefined()
      expect(typeof wrapper.vm.remove).toBe('function')
    })

    it('should expose removeAll method', () => {
      expect(wrapper.vm.removeAll).toBeDefined()
      expect(typeof wrapper.vm.removeAll).toBe('function')
    })

    it('should expose primevueRef', () => {
      expect(wrapper.vm.primevueRef).toBeDefined()
    })

    it('should call PrimeVue Toast add method when add is called', async () => {
      const mockAdd = vi.fn()
      wrapper.vm.primevueRef = { add: mockAdd }
      
      const options: NotifOptions = {
        message: 'Test notification',
        type: 'success',
        duration: 2000
      }
      
      wrapper.vm.add(options)
      
      expect(mockAdd).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Test notification',
        detail: '',
        life: 2000,
        closable: true,
        styleClass: undefined,
        contentStyleClass: undefined
      })
    })

    it('should call PrimeVue Toast remove method when remove is called', () => {
      const mockRemove = vi.fn()
      wrapper.vm.primevueRef = { remove: mockRemove }
      
      const message = { id: 'test-message' }
      wrapper.vm.remove(message)
      
      expect(mockRemove).toHaveBeenCalledWith(message)
    })

    it('should call PrimeVue Toast removeAllGroups method when removeAll is called', () => {
      const mockRemoveAllGroups = vi.fn()
      wrapper.vm.primevueRef = { removeAllGroups: mockRemoveAllGroups }
      
      wrapper.vm.removeAll()
      
      expect(mockRemoveAllGroups).toHaveBeenCalled()
    })
  })

  describe('Notification Options', () => {
    beforeEach(() => {
      wrapper = mount(Notif)
    })

    it('should handle success notifications', () => {
      const mockAdd = vi.fn()
      wrapper.vm.primevueRef = { add: mockAdd }
      
      wrapper.vm.add({
        message: 'Success message',
        type: 'success'
      })
      
      expect(mockAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: 'success',
          summary: 'Success message'
        })
      )
    })

    it('should handle error notifications', () => {
      const mockAdd = vi.fn()
      wrapper.vm.primevueRef = { add: mockAdd }
      
      wrapper.vm.add({
        message: 'Error message',
        type: 'error'
      })
      
      expect(mockAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: 'error',
          summary: 'Error message'
        })
      )
    })

    it('should handle info notifications', () => {
      const mockAdd = vi.fn()
      wrapper.vm.primevueRef = { add: mockAdd }
      
      wrapper.vm.add({
        message: 'Info message',
        type: 'info'
      })
      
      expect(mockAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: 'info',
          summary: 'Info message'
        })
      )
    })

    it('should handle warn notifications', () => {
      const mockAdd = vi.fn()
      wrapper.vm.primevueRef = { add: mockAdd }
      
      wrapper.vm.add({
        message: 'Warning message',
        type: 'warn'
      })
      
      expect(mockAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: 'warn',
          summary: 'Warning message'
        })
      )
    })

    it('should use default type when not specified', () => {
      const mockAdd = vi.fn()
      wrapper.vm.primevueRef = { add: mockAdd }
      
      wrapper.vm.add({
        message: 'Default message'
      })
      
      expect(mockAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: 'info',
          summary: 'Default message'
        })
      )
    })

    it('should handle custom duration', () => {
      const mockAdd = vi.fn()
      wrapper.vm.primevueRef = { add: mockAdd }
      
      wrapper.vm.add({
        message: 'Custom duration',
        duration: 5000
      })
      
      expect(mockAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          life: 5000
        })
      )
    })

    it('should handle closable option', () => {
      const mockAdd = vi.fn()
      wrapper.vm.primevueRef = { add: mockAdd }
      
      wrapper.vm.add({
        message: 'Non-closable',
        closable: false
      })
      
      expect(mockAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          closable: false
        })
      )
    })

    it('should handle custom style classes', () => {
      const mockAdd = vi.fn()
      wrapper.vm.primevueRef = { add: mockAdd }
      
      wrapper.vm.add({
        message: 'Styled message',
        styleClass: 'custom-style',
        contentStyleClass: 'custom-content'
      })
      
      expect(mockAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          styleClass: 'custom-style',
          contentStyleClass: 'custom-content'
        })
      )
    })
  })

  describe('Error Handling', () => {
    it('should handle missing primevueRef gracefully in add method', () => {
      wrapper = mount(Notif)
      wrapper.vm.primevueRef = null
      
      expect(() => {
        wrapper.vm.add({ message: 'Test' })
      }).not.toThrow()
    })

    it('should handle missing primevueRef gracefully in remove method', () => {
      wrapper = mount(Notif)
      wrapper.vm.primevueRef = null
      
      expect(() => {
        wrapper.vm.remove({ id: 'test' })
      }).not.toThrow()
    })

    it('should handle missing primevueRef gracefully in removeAll method', () => {
      wrapper = mount(Notif)
      wrapper.vm.primevueRef = null
      
      expect(() => {
        wrapper.vm.removeAll()
      }).not.toThrow()
    })
  })

  describe('API Compatibility', () => {
    it('should maintain backward compatibility with original Notif component', () => {
      // Test that the wrapper accepts similar props as the original
      const legacyProps: NotifWrapperProps = {
        position: 'bottom-right'
      }
      
      wrapper = mount(Notif, {
        props: legacyProps
      })
      
      expect(wrapper.exists()).toBe(true)
      const toast = wrapper.findComponent({ name: 'Toast' })
      expect(toast.props('position')).toBe('bottom-right')
    })

    it('should provide enhanced functionality over original', () => {
      // Test new features not available in original
      wrapper = mount(Notif, {
        props: {
          position: 'top-center',
          autoZIndex: false,
          baseZIndex: 1500,
          breakpoint: '768px'
        }
      })
      
      const toast = wrapper.findComponent({ name: 'Toast' })
      expect(toast.props('position')).toBe('top-center')
      expect(toast.props('autoZIndex')).toBe(false)
      expect(toast.props('baseZIndex')).toBe(1500)
      expect(toast.props('breakpoint')).toBe('768px')
    })
  })
})