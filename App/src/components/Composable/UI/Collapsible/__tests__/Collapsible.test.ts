import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Collapsible from '../Collapsible.vue'

describe('Collapsible', () => {
  it('should render with title', () => {
    const wrapper = mount(Collapsible, {
      props: {
        title: 'Test Title'
      }
    })
    
    expect(wrapper.find('.collapsible-title').text()).toContain('Test Title')
  })

  it('should render with title and caption', () => {
    const wrapper = mount(Collapsible, {
      props: {
        title: 'Test Title',
        caption: 'Test Caption'
      }
    })
    
    expect(wrapper.find('.collapsible-title').text()).toContain('Test Title')
    expect(wrapper.find('.collapsible-caption').text()).toBe('Test Caption')
  })

  it('should toggle content visibility when title is clicked', async () => {
    const wrapper = mount(Collapsible, {
      props: {
        title: 'Test Title',
        modelValue: false
      },
      slots: {
        default: '<div>Test Content</div>'
      }
    })

    // Initially hidden
    expect(wrapper.find('.collapsible-contents').isVisible()).toBe(false)

    // Click title to expand
    await wrapper.find('.collapsible-title').trigger('click')
    
    // Should emit update:modelValue
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([true])
  })

  it('should have proper accessibility attributes', () => {
    const wrapper = mount(Collapsible, {
      props: {
        title: 'Test Title',
        modelValue: false
      },
      slots: {
        default: '<div>Test Content</div>'
      }
    })

    const button = wrapper.find('.collapsible-title')
    const content = wrapper.find('.collapsible-contents')

    // Button should have proper ARIA attributes
    expect(button.attributes('aria-expanded')).toBe('false')
    expect(button.attributes('aria-controls')).toBeTruthy()
    expect(button.attributes('type')).toBe('button')

    // Content should have proper ARIA attributes
    expect(content.attributes('role')).toBe('region')
    expect(content.attributes('aria-labelledby')).toBeTruthy()
    expect(content.attributes('id')).toBeTruthy()
  })

  it('should update aria-expanded when state changes', async () => {
    const wrapper = mount(Collapsible, {
      props: {
        title: 'Test Title',
        modelValue: false
      }
    })

    const button = wrapper.find('.collapsible-title')
    expect(button.attributes('aria-expanded')).toBe('false')

    await wrapper.setProps({ modelValue: true })
    expect(button.attributes('aria-expanded')).toBe('true')
  })

  it('should show content when modelValue is true', () => {
    const wrapper = mount(Collapsible, {
      props: {
        title: 'Test Title',
        modelValue: true
      },
      slots: {
        default: '<div>Test Content</div>'
      }
    })

    expect(wrapper.find('.collapsible-contents').isVisible()).toBe(true)
  })

  it('should rotate arrow icon when expanded', () => {
    const wrapper = mount(Collapsible, {
      props: {
        title: 'Test Title',
        modelValue: true
      }
    })

    const icon = wrapper.find('.material-symbols-outlined')
    expect(icon.classes()).toContain('expanded')
  })

  it('should render slot content', () => {
    const wrapper = mount(Collapsible, {
      props: {
        title: 'Test Title',
        modelValue: true
      },
      slots: {
        default: '<div class="test-content">Test Content</div>'
      }
    })

    expect(wrapper.find('.test-content').text()).toBe('Test Content')
  })
})