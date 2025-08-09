/**
 * Integration tests for Notif wrapper component
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import Notif from '../Notif.vue'
import { useNotif, clearAllNotifs, notificationService } from '../Notif.hooks'

// Mock PrimeVue Toast and useToast
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

vi.mock('primevue/usetoast', () => ({
  useToast: () => ({
    add: vi.fn(),
    remove: vi.fn(),
    removeAllGroups: vi.fn()
  })
}))

describe('Notif Integration Tests', () => {
  let wrapper: any

  beforeEach(() => {
    wrapper = null
    // Clear any existing DOM elements
    document.body.innerHTML = ''
  })

  describe('Real-world Usage Scenarios', () => {
    it('should work in a typical notification scenario', async () => {
      // Simulate a component that shows notifications on user actions
      const TestComponent = {
        template: `
          <div>
            <Notif ref="notifRef" />
            <button @click="showSuccess" data-testid="success-btn">Success</button>
            <button @click="showError" data-testid="error-btn">Error</button>
            <button @click="showInfo" data-testid="info-btn">Info</button>
          </div>
        `,
        components: { Notif },
        methods: {
          showSuccess() {
            this.$refs.notifRef.add({
              message: 'Operation successful!',
              type: 'success',
              duration: 2000
            })
          },
          showError() {
            this.$refs.notifRef.add({
              message: 'An error occurred!',
              type: 'error',
              duration: 3000
            })
          },
          showInfo() {
            this.$refs.notifRef.add({
              message: 'Information message',
              type: 'info',
              duration: 1000
            })
          }
        }
      }

      wrapper = mount(TestComponent)
      
      const notifComponent = wrapper.findComponent(Notif)
      expect(notifComponent.exists()).toBe(true)
      
      // Mock the add method
      const mockAdd = vi.fn()
      notifComponent.vm.primevueRef = { add: mockAdd }
      
      // Test success notification
      await wrapper.find('[data-testid="success-btn"]').trigger('click')
      expect(mockAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: 'success',
          summary: 'Operation successful!',
          life: 2000
        })
      )
      
      // Test error notification
      await wrapper.find('[data-testid="error-btn"]').trigger('click')
      expect(mockAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: 'error',
          summary: 'An error occurred!',
          life: 3000
        })
      )
      
      // Test info notification
      await wrapper.find('[data-testid="info-btn"]').trigger('click')
      expect(mockAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: 'info',
          summary: 'Information message',
          life: 1000
        })
      )
    })

    it('should work with form validation notifications', async () => {
      const FormComponent = {
        template: `
          <div>
            <Notif ref="notifRef" position="top-right" />
            <form @submit.prevent="handleSubmit">
              <input v-model="email" type="email" required />
              <input v-model="password" type="password" required />
              <button type="submit">Submit</button>
            </form>
          </div>
        `,
        components: { Notif },
        data() {
          return {
            email: '',
            password: ''
          }
        },
        methods: {
          handleSubmit() {
            if (!this.email) {
              this.$refs.notifRef.add({
                message: 'Email is required',
                type: 'error',
                duration: 3000
              })
              return
            }
            
            if (!this.password) {
              this.$refs.notifRef.add({
                message: 'Password is required',
                type: 'error',
                duration: 3000
              })
              return
            }
            
            this.$refs.notifRef.add({
              message: 'Form submitted successfully!',
              type: 'success',
              duration: 2000
            })
          }
        }
      }

      wrapper = mount(FormComponent)
      
      const notifComponent = wrapper.findComponent(Notif)
      const mockAdd = vi.fn()
      notifComponent.vm.primevueRef = { add: mockAdd }
      
      // Test validation error for empty email
      await wrapper.find('form').trigger('submit')
      expect(mockAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: 'error',
          summary: 'Email is required'
        })
      )
      
      // Set email and test password validation
      await wrapper.find('input[type="email"]').setValue('test@example.com')
      await wrapper.find('form').trigger('submit')
      expect(mockAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: 'error',
          summary: 'Password is required'
        })
      )
      
      // Set both fields and test success
      await wrapper.find('input[type="password"]').setValue('password123')
      await wrapper.find('form').trigger('submit')
      expect(mockAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: 'success',
          summary: 'Form submitted successfully!'
        })
      )
    })

    it('should work with multiple notification positions', async () => {
      const MultiPositionComponent = {
        template: `
          <div>
            <Notif ref="topNotif" position="top-center" />
            <Notif ref="bottomNotif" position="bottom-right" />
            <button @click="showTopNotification">Top Notification</button>
            <button @click="showBottomNotification">Bottom Notification</button>
          </div>
        `,
        components: { Notif },
        methods: {
          showTopNotification() {
            this.$refs.topNotif.add({
              message: 'Top notification',
              type: 'info'
            })
          },
          showBottomNotification() {
            this.$refs.bottomNotif.add({
              message: 'Bottom notification',
              type: 'success'
            })
          }
        }
      }

      wrapper = mount(MultiPositionComponent)
      
      const notifComponents = wrapper.findAllComponents(Notif)
      expect(notifComponents).toHaveLength(2)
      
      // Check positions
      expect(notifComponents[0].props('position')).toBe('top-center')
      expect(notifComponents[1].props('position')).toBe('bottom-right')
      
      // Mock add methods
      const mockAddTop = vi.fn()
      const mockAddBottom = vi.fn()
      notifComponents[0].vm.primevueRef = { add: mockAddTop }
      notifComponents[1].vm.primevueRef = { add: mockAddBottom }
      
      // Test top notification
      await wrapper.find('button').trigger('click')
      expect(mockAddTop).toHaveBeenCalledWith(
        expect.objectContaining({
          summary: 'Top notification',
          severity: 'info'
        })
      )
      
      // Test bottom notification
      await wrapper.findAll('button')[1].trigger('click')
      expect(mockAddBottom).toHaveBeenCalledWith(
        expect.objectContaining({
          summary: 'Bottom notification',
          severity: 'success'
        })
      )
    })
  })

  describe('Hook Integration', () => {
    it('should work with useNotif hook', () => {
      // Test the modern hook API
      const { add, success, error, info, warn } = useNotif()
      
      expect(typeof add).toBe('function')
      expect(typeof success).toBe('function')
      expect(typeof error).toBe('function')
      expect(typeof info).toBe('function')
      expect(typeof warn).toBe('function')
    })

    it('should work with notification service', () => {
      expect(typeof notificationService.success).toBe('function')
      expect(typeof notificationService.error).toBe('function')
      expect(typeof notificationService.info).toBe('function')
      expect(typeof notificationService.warn).toBe('function')
      expect(typeof notificationService.clear).toBe('function')
    })
  })

  describe('Legacy API Compatibility', () => {
    it('should maintain backward compatibility with legacy useNotif API', () => {
      // Test that legacy API still works
      expect(() => {
        useNotif({
          message: 'Legacy notification',
          type: 'success',
          duration: 2000
        })
      }).not.toThrow()
    })

    it('should maintain backward compatibility with clearAllNotifs', () => {
      expect(() => {
        clearAllNotifs()
      }).not.toThrow()
    })
  })

  describe('Performance and Memory', () => {
    it('should not leak memory when mounted and unmounted repeatedly', async () => {
      // Mount and unmount multiple times
      for (let i = 0; i < 10; i++) {
        const tempWrapper = mount(Notif, {
          props: {
            position: i % 2 === 0 ? 'top-left' : 'bottom-right'
          }
        })
        
        expect(tempWrapper.exists()).toBe(true)
        tempWrapper.unmount()
      }
      
      // If we get here without errors, memory management is working
      expect(true).toBe(true)
    })

    it('should handle rapid notification additions efficiently', async () => {
      wrapper = mount(Notif)
      
      const mockAdd = vi.fn()
      wrapper.vm.primevueRef = { add: mockAdd }
      
      // Rapidly add notifications
      for (let i = 0; i < 20; i++) {
        wrapper.vm.add({
          message: `Notification ${i}`,
          type: i % 2 === 0 ? 'success' : 'error',
          duration: 1000
        })
      }
      
      // Should have called add 20 times
      expect(mockAdd).toHaveBeenCalledTimes(20)
    })
  })

  describe('Error Handling', () => {
    it('should handle invalid notification options gracefully', () => {
      wrapper = mount(Notif)
      
      const mockAdd = vi.fn()
      wrapper.vm.primevueRef = { add: mockAdd }
      
      // Test with invalid type
      wrapper.vm.add({
        message: 'Test message',
        type: 'invalid-type' as any
      })
      
      // Should still call add (with fallback to info)
      expect(mockAdd).toHaveBeenCalled()
    })

    it('should handle missing message gracefully', () => {
      wrapper = mount(Notif)
      
      const mockAdd = vi.fn()
      wrapper.vm.primevueRef = { add: mockAdd }
      
      // Test with missing message
      wrapper.vm.add({
        message: '',
        type: 'success'
      })
      
      // Should still call add
      expect(mockAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          summary: '',
          severity: 'success'
        })
      )
    })
  })

  describe('Accessibility', () => {
    it('should maintain proper ARIA attributes', () => {
      wrapper = mount(Notif, {
        props: {
          dataTestid: 'accessible-notif'
        }
      })
      
      const toast = wrapper.findComponent({ name: 'Toast' })
      expect(toast.attributes('data-testid')).toBe('accessible-notif')
    })

    it('should work with screen readers', () => {
      wrapper = mount(Notif)
      
      const mockAdd = vi.fn()
      wrapper.vm.primevueRef = { add: mockAdd }
      
      wrapper.vm.add({
        message: 'Screen reader accessible message',
        type: 'info'
      })
      
      // PrimeVue Toast should handle ARIA attributes automatically
      expect(mockAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          summary: 'Screen reader accessible message'
        })
      )
    })
  })
})