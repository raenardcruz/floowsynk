import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { Button } from '../index'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'

// Mock PrimeVue Button
vi.mock('primevue/button', () => ({
  default: {
    name: 'PrimeButton',
    props: [
      'id', 'class', 'style', 'disabled', 'loading', 'label', 'icon', 
      'iconPos', 'severity', 'size', 'outlined', 'text', 'raised', 
      'rounded', 'aria-label', 'title'
    ],
    template: `
      <button 
        class="p-button"
        :id="id"
        :title="title"
        :disabled="disabled || loading"
        @click="$emit('click', $event)"
        @focus="$emit('focus', $event)"
        @blur="$emit('blur', $event)"
      >
        <span v-if="loading" class="p-button-loading-icon"></span>
        <span v-if="icon" :class="icon"></span>
        <span v-if="label" class="p-button-label">{{ label }}</span>
        <slot />
        <slot name="icon" />
      </button>
    `,
    emits: ['click', 'focus', 'blur']
  }
}))

describe('Button Integration', () => {
  it('can be imported and used from index', () => {
    const wrapper = mount(Button, {
      props: {
        label: 'Integration Test'
      },
      global: {
        plugins: [
          [PrimeVue, { 
            theme: { preset: Aura }
          }]
        ]
      }
    })

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.text()).toContain('Integration Test')
    expect(wrapper.classes()).toContain('p-button')
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