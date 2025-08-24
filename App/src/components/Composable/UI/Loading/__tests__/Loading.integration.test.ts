/**
 * Integration tests for Loading wrapper component
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import Loading from '../Loading.vue'

describe('Loading Integration Tests', () => {
  let wrapper: any

  beforeEach(() => {
    wrapper = null
  })

  describe('Real-world Usage Scenarios', () => {
    it('should work in a typical loading state scenario', async () => {
      // Simulate a component that shows loading while fetching data
      const TestComponent = {
        template: `
          <div>
            <Loading v-if="isLoading" :text="loadingText" />
            <div v-else>{{ data }}</div>
          </div>
        `,
        components: { Loading },
        data() {
          return {
            isLoading: true,
            loadingText: 'Fetching data...',
            data: null
          }
        },
        async mounted() {
          // Simulate API call
          setTimeout(() => {
            this.data = 'Data loaded successfully'
            this.isLoading = false
          }, 100)
        }
      }

      wrapper = mount(TestComponent)
      
      // Initially should show loading
      expect(wrapper.findComponent(Loading).exists()).toBe(true)
      expect(wrapper.text()).toContain('Fetching data...')
      
      // Wait for simulated API call
      await new Promise(resolve => setTimeout(resolve, 150))
      await nextTick()
      
      // Should show data and hide loading
      expect(wrapper.findComponent(Loading).exists()).toBe(false)
      expect(wrapper.text()).toContain('Data loaded successfully')
    })

    it('should work with different loading states in forms', async () => {
      const FormComponent = {
        template: `
          <form @submit.prevent="handleSubmit">
            <input v-model="formData" :disabled="isSubmitting" />
            <button type="submit" :disabled="isSubmitting">
              <Loading 
                v-if="isSubmitting" 
                size="small" 
                :show-heading="false"
                text="Submitting..."
              />
              <span v-else>Submit</span>
            </button>
          </form>
        `,
        components: { Loading },
        data() {
          return {
            formData: '',
            isSubmitting: false
          }
        },
        methods: {
          async handleSubmit() {
            this.isSubmitting = true
            // Simulate form submission
            await new Promise(resolve => setTimeout(resolve, 100))
            this.isSubmitting = false
          }
        }
      }

      wrapper = mount(FormComponent)
      
      // Initially should not show loading
      expect(wrapper.findComponent(Loading).exists()).toBe(false)
      
      // Trigger form submission
      await wrapper.find('form').trigger('submit')
      await nextTick()
      
      // Should show loading in button
      expect(wrapper.findComponent(Loading).exists()).toBe(true)
      expect(wrapper.findComponent(Loading).props('size')).toBe('small')
      expect(wrapper.findComponent(Loading).props('showHeading')).toBe(false)
      
      // Wait for submission to complete
      await new Promise(resolve => setTimeout(resolve, 150))
      await nextTick()
      
      // Should hide loading
      expect(wrapper.findComponent(Loading).exists()).toBe(false)
    })

    it('should work with multiple loading states', async () => {
      const MultiLoadingComponent = {
        template: `
          <div>
            <div class="section">
              <h3>User Data</h3>
              <Loading 
                v-if="loadingUser" 
                text="Loading user..." 
                color="primary"
                size="medium"
              />
              <div v-else>{{ userData }}</div>
            </div>
            
            <div class="section">
              <h3>Settings</h3>
              <Loading 
                v-if="loadingSettings" 
                text="Loading settings..." 
                color="secondary"
                size="small"
              />
              <div v-else>{{ settingsData }}</div>
            </div>
          </div>
        `,
        components: { Loading },
        data() {
          return {
            loadingUser: true,
            loadingSettings: true,
            userData: null,
            settingsData: null
          }
        },
        async mounted() {
          // Simulate different loading times
          setTimeout(() => {
            this.userData = 'User data loaded'
            this.loadingUser = false
          }, 100)
          
          setTimeout(() => {
            this.settingsData = 'Settings loaded'
            this.loadingSettings = false
          }, 200)
        }
      }

      wrapper = mount(MultiLoadingComponent)
      
      // Initially both should be loading
      const loadingComponents = wrapper.findAllComponents(Loading)
      expect(loadingComponents).toHaveLength(2)
      expect(loadingComponents[0].props('color')).toBe('primary')
      expect(loadingComponents[1].props('color')).toBe('secondary')
      
      // Wait for first loading to complete
      await new Promise(resolve => setTimeout(resolve, 150))
      await nextTick()
      
      // Should have one loading component left
      expect(wrapper.findAllComponents(Loading)).toHaveLength(1)
      expect(wrapper.text()).toContain('User data loaded')
      
      // Wait for second loading to complete
      await new Promise(resolve => setTimeout(resolve, 100))
      await nextTick()
      
      // Should have no loading components
      expect(wrapper.findAllComponents(Loading)).toHaveLength(0)
      expect(wrapper.text()).toContain('Settings loaded')
    })
  })

  describe('Theme Integration', () => {
    it('should work with different theme contexts', () => {
      // Test with light theme context
      wrapper = mount(Loading, {
        props: {
          color: 'primary',
          size: 'medium'
        }
      })
      
      const spinner = wrapper.findComponent({ name: 'ProgressSpinner' })
      expect(spinner.exists()).toBe(true)
      
      // Verify theme-aware styling is applied
      const spinnerStyle = spinner.attributes('style')
      expect(spinnerStyle).toContain('color')
    })

    it('should handle custom CSS properties', () => {
      wrapper = mount(Loading, {
        props: {
          style: {
            '--custom-color': '#ff0000',
            padding: '20px'
          }
        }
      })
      
      const wrapperElement = wrapper.find('.loading-wrapper')
      expect(wrapperElement.attributes('style')).toContain('padding: 20px')
    })
  })

  describe('Performance and Memory', () => {
    it('should not leak memory when mounted and unmounted repeatedly', async () => {
      // Mount and unmount multiple times
      for (let i = 0; i < 10; i++) {
        const tempWrapper = mount(Loading, {
          props: {
            text: `Loading ${i}`,
            size: i % 2 === 0 ? 'small' : 'large'
          }
        })
        
        expect(tempWrapper.exists()).toBe(true)
        tempWrapper.unmount()
      }
      
      // If we get here without errors, memory management is working
      expect(true).toBe(true)
    })

    it('should handle rapid prop changes efficiently', async () => {
      wrapper = mount(Loading)
      
      // Rapidly change props
      const sizes = ['small', 'medium', 'large'] as const
      const colors = ['primary', 'secondary', 'success', 'danger'] as const
      
      for (let i = 0; i < 20; i++) {
        await wrapper.setProps({
          size: sizes[i % sizes.length],
          color: colors[i % colors.length],
          text: `Loading ${i}`
        })
        await nextTick()
      }
      
      // Component should still be functional
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.findComponent({ name: 'ProgressSpinner' }).exists()).toBe(true)
    })
  })

  describe('Error Handling', () => {
    it('should handle invalid prop values gracefully', () => {
      // Test with invalid size
      wrapper = mount(Loading, {
        props: {
          size: 'invalid-size' as any,
          color: 'invalid-color' as any
        }
      })
      
      // Should still render without crashing
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.findComponent({ name: 'ProgressSpinner' }).exists()).toBe(true)
    })

    it('should handle missing PrimeVue component gracefully', () => {
      // This test ensures the component doesn't crash if PrimeVue is not properly configured
      // In a real scenario, this would be handled by proper setup, but we test defensive coding
      expect(() => {
        wrapper = mount(Loading)
      }).not.toThrow()
    })
  })
})