import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CollapsibleWrapper from '../CollapsibleWrapper.vue'

describe('CollapsibleWrapper', () => {
  it('should render with title', () => {
    const wrapper = mount(CollapsibleWrapper, {
      props: {
        title: 'Test Title'
      }
    })
    
    expect(wrapper.find('.collapsible-title').text()).toBe('Test Title')
  })

  it('should render with title and caption', () => {
    const wrapper = mount(CollapsibleWrapper, {
      props: {
        title: 'Test Title',
        caption: 'Test Caption'
      }
    })
    
    expect(wrapper.find('.collapsible-title').text()).toBe('Test Title')
    expect(wrapper.find('.collapsible-caption').text()).toBe('Test Caption')
  })

  it('should toggle content visibility when header is clicked', async () => {
    const wrapper = mount(CollapsibleWrapper, {
      props: {
        title: 'Test Title',
        modelValue: false
      },
      slots: {
        default: '<div>Test Content</div>'
      }
    })

    // Click header to expand
    await wrapper.find('.collapsible-header').trigger('click')
    
    // Should emit update:modelValue
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([true])
  })

  it('should show content when modelValue is true', () => {
    const wrapper = mount(CollapsibleWrapper, {
      props: {
        title: 'Test Title',
        modelValue: true
      },
      slots: {
        default: '<div>Test Content</div>'
      }
    })

    // PrimeVue Accordion should have the panel expanded
    const accordion = wrapper.findComponent({ name: 'Accordion' })
    expect(accordion.props('value')).toEqual([0])
  })

  it('should render slot content', () => {
    const wrapper = mount(CollapsibleWrapper, {
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