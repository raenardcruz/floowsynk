import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { Button } from '../index'

describe('Button Integration', () => {
  it('can be imported and used from index', () => {
    const wrapper = mount(Button, {
      props: {
        label: 'Integration Test'
      }
    })

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.text()).toContain('Integration Test')
    expect(wrapper.classes()).toContain('btn')
  })

  it('maintains all PrimeVue Button functionality', () => {
    const wrapper = mount(Button, {
      props: {
        id: 'test-button',
        label: 'Test Button',
        disabled: false,
        tooltip: 'Test tooltip'
      }
    })

    // Check basic functionality that PrimeVue Button had
    expect(wrapper.find('button').attributes('id')).toBe('test-button')
    expect(wrapper.find('button').attributes('title')).toBe('Test tooltip')
    expect(wrapper.text()).toContain('Test Button')
    expect(wrapper.find('button').attributes('disabled')).toBeUndefined()
  })

  it('supports click events like PrimeVue Button', async () => {
    const wrapper = mount(Button, {
      props: {
        label: 'Click me'
      }
    })

    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
  })

  it('supports icon slot like PrimeVue Button', () => {
    const wrapper = mount(Button, {
      props: {
        label: 'With Icon',
        icon: 'default-icon' // Need icon prop for slot to render
      },
      slots: {
        icon: '<span class="test-icon">🔥</span>'
      }
    })

    expect(wrapper.find('.test-icon').exists()).toBe(true)
    expect(wrapper.text()).toContain('🔥')
  })
})