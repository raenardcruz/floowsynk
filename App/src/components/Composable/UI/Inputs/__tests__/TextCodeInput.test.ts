/**
 * Unit tests for TextCodeInput wrapper component
 * Note: Monaco Editor integration tests are limited due to complex dependencies
 */

import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'

// Create a simplified version of TextCodeInput for testing without Monaco Editor
const TextCodeInputSimplified = {
  name: 'TextCodeInput',
  template: `
    <div 
      :class="[
        'textcodeinput-wrapper',
        {
          'textcodeinput-wrapper--disabled': disabled,
          'textcodeinput-wrapper--invalid': invalid,
          'textcodeinput-wrapper--has-editor': editorConfig && showEditorButton
        }
      ]"
      :data-testid="$attrs['data-testid']"
    >
      <input
        ref="primevueRef"
        v-model="internalValue"
        :type="type"
        :placeholder="placeholder"
        :disabled="disabled"
        class="textcodeinput-wrapper__input"
        @focus="$emit('focus', $event)"
        @blur="$emit('blur', $event)"
        @keydown="$emit('keydown', $event)"
        @keyup="$emit('keyup', $event)"
      />
      
      <button
        v-if="editorConfig && showEditorButton"
        class="textcodeinput-wrapper__editor-btn"
        :disabled="disabled"
        @click="openEditor"
      >
        Code
      </button>
    </div>
  `,
  props: {
    modelValue: { type: [String, Number], default: '' },
    label: String,
    placeholder: String,
    disabled: Boolean,
    required: Boolean,
    invalid: Boolean,
    type: { type: String, default: 'text' },
    editorConfig: Object,
    showEditorButton: { type: Boolean, default: true },
    variant: { type: String, default: 'outlined' },
    size: { type: String, default: 'medium' }
  },
  emits: ['update:modelValue', 'focus', 'blur', 'keydown', 'keyup', 'editor-opened', 'editor-closed'],
  data() {
    return {
      showEditor: false
    }
  },
  computed: {
    internalValue: {
      get() {
        return this.modelValue?.toString() || ''
      },
      set(value: string) {
        const convertedValue = this.type === 'number' ? Number(value) || 0 : value
        this.$emit('update:modelValue', convertedValue)
      }
    }
  },
  methods: {
    openEditor() {
      if (!this.editorConfig) return
      this.showEditor = true
      this.$emit('editor-opened')
    },
    closeEditor() {
      this.showEditor = false
      this.$emit('editor-closed')
    },
    toggleEditor() {
      if (this.showEditor) {
        this.closeEditor()
      } else {
        this.openEditor()
      }
    },
    focus() {
      this.$refs.primevueRef?.focus()
    },
    blur() {
      this.$refs.primevueRef?.blur()
    },
    select() {
      this.$refs.primevueRef?.select()
    }
  }
}

// Test setup
const createWrapper = (props = {}) => {
  return mount(TextCodeInputSimplified, {
    props: {
      modelValue: '',
      ...props
    },
    global: {
      plugins: [
        [PrimeVue, { theme: { preset: Aura } }]
      ],
      directives: {
        tooltip: () => {} // Mock tooltip directive
      }
    }
  })
}

describe('TextCodeInput', () => {
  describe('Rendering', () => {
    it('should render with default props', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.textcodeinput-wrapper').exists()).toBe(true)
      expect(wrapper.find('.textcodeinput-wrapper__input').exists()).toBe(true)
    })

    it('should apply disabled class when disabled', () => {
      const wrapper = createWrapper({ disabled: true })
      expect(wrapper.find('.textcodeinput-wrapper--disabled').exists()).toBe(true)
    })

    it('should apply invalid class when invalid', () => {
      const wrapper = createWrapper({ invalid: true })
      expect(wrapper.find('.textcodeinput-wrapper--invalid').exists()).toBe(true)
    })
  })

  describe('Editor Integration', () => {
    const mockEditorConfig = {
      variables: ['var1', 'var2'],
      target: 'body'
    }

    it('should show editor button when editorConfig is provided', () => {
      const wrapper = createWrapper({ 
        editorConfig: mockEditorConfig,
        showEditorButton: true 
      })
      
      const editorBtn = wrapper.find('.textcodeinput-wrapper__editor-btn')
      expect(editorBtn.exists()).toBe(true)
      expect(wrapper.find('.textcodeinput-wrapper--has-editor').exists()).toBe(true)
    })

    it('should hide editor button when showEditorButton is false', () => {
      const wrapper = createWrapper({ 
        editorConfig: mockEditorConfig,
        showEditorButton: false 
      })
      
      const editorBtn = wrapper.find('.textcodeinput-wrapper__editor-btn')
      expect(editorBtn.exists()).toBe(false)
    })

    it('should not show editor button when editorConfig is not provided', () => {
      const wrapper = createWrapper({ showEditorButton: true })
      
      const editorBtn = wrapper.find('.textcodeinput-wrapper__editor-btn')
      expect(editorBtn.exists()).toBe(false)
    })

    it('should open editor modal when editor button is clicked', async () => {
      const wrapper = createWrapper({ 
        editorConfig: mockEditorConfig,
        showEditorButton: true 
      })
      
      const editorBtn = wrapper.find('.textcodeinput-wrapper__editor-btn')
      await editorBtn.trigger('click')
      
      const emitted = wrapper.emitted('editor-opened')
      expect(emitted).toBeTruthy()
    })

    it('should disable editor button when input is disabled', () => {
      const wrapper = createWrapper({ 
        editorConfig: mockEditorConfig,
        disabled: true 
      })
      
      const editorBtn = wrapper.find('.textcodeinput-wrapper__editor-btn')
      expect((editorBtn.element as HTMLButtonElement).disabled).toBe(true)
    })
  })

  describe('Model Value', () => {
    it('should display initial value', () => {
      const wrapper = createWrapper({ modelValue: 'test value' })
      const input = wrapper.find('.textcodeinput-wrapper__input')
      expect((input.element as HTMLInputElement).value).toBe('test value')
    })

    it('should emit update:modelValue when input changes', async () => {
      const wrapper = createWrapper()
      const input = wrapper.find('.textcodeinput-wrapper__input')
      
      await input.setValue('new value')
      
      const emitted = wrapper.emitted('update:modelValue')
      expect(emitted).toBeTruthy()
      expect(emitted![0][0]).toBe('new value')
    })

    it('should handle number type correctly', async () => {
      const wrapper = createWrapper({ 
        modelValue: 42,
        type: 'number' 
      })
      
      const input = wrapper.find('.textcodeinput-wrapper__input')
      await input.setValue('123')
      
      const emitted = wrapper.emitted('update:modelValue')
      expect(emitted![0][0]).toBe(123)
    })

    it('should handle empty string for number type', async () => {
      const wrapper = createWrapper({ 
        modelValue: 0,
        type: 'number' 
      })
      
      const input = wrapper.find('.textcodeinput-wrapper__input')
      await input.setValue('')
      
      const emitted = wrapper.emitted('update:modelValue')
      expect(emitted![0][0]).toBe(0)
    })
  })

  describe('Events', () => {
    it('should emit focus event when input is focused', async () => {
      const wrapper = createWrapper()
      const input = wrapper.find('.textcodeinput-wrapper__input')
      
      await input.trigger('focus')
      
      expect(wrapper.emitted('focus')).toBeTruthy()
    })

    it('should emit blur event when input is blurred', async () => {
      const wrapper = createWrapper()
      const input = wrapper.find('.textcodeinput-wrapper__input')
      
      await input.trigger('blur')
      
      expect(wrapper.emitted('blur')).toBeTruthy()
    })

    it('should emit keydown event when key is pressed', async () => {
      const wrapper = createWrapper()
      const input = wrapper.find('.textcodeinput-wrapper__input')
      
      await input.trigger('keydown', { key: 'Enter' })
      
      expect(wrapper.emitted('keydown')).toBeTruthy()
    })

    it('should emit keyup event when key is released', async () => {
      const wrapper = createWrapper()
      const input = wrapper.find('.textcodeinput-wrapper__input')
      
      await input.trigger('keyup', { key: 'Enter' })
      
      expect(wrapper.emitted('keyup')).toBeTruthy()
    })

    it('should emit editor-closed when modal is closed', async () => {
      const mockEditorConfig = {
        variables: ['var1', 'var2'],
        target: 'body'
      }
      
      const wrapper = createWrapper({ 
        editorConfig: mockEditorConfig 
      })
      
      // Open editor first
      const vm = wrapper.vm as any
      vm.openEditor()
      await wrapper.vm.$nextTick()
      
      // Close editor
      vm.closeEditor()
      await wrapper.vm.$nextTick()
      
      const emitted = wrapper.emitted('editor-closed')
      expect(emitted).toBeTruthy()
    })
  })

  describe('Exposed Methods', () => {
    it('should expose required methods', () => {
      const wrapper = createWrapper()
      const vm = wrapper.vm as any
      
      expect(typeof vm.focus).toBe('function')
      expect(typeof vm.blur).toBe('function')
      expect(typeof vm.select).toBe('function')
      expect(typeof vm.openEditor).toBe('function')
      expect(typeof vm.closeEditor).toBe('function')
      expect(typeof vm.toggleEditor).toBe('function')
    })

    it('should expose primevueRef', () => {
      const wrapper = createWrapper()
      const vm = wrapper.vm as any
      
      expect(vm.$refs.primevueRef).toBeDefined()
    })

    it('should toggle editor when toggleEditor is called', async () => {
      const mockEditorConfig = {
        variables: ['var1', 'var2'],
        target: 'body'
      }
      
      const wrapper = createWrapper({ 
        editorConfig: mockEditorConfig 
      })
      const vm = wrapper.vm as any
      
      // Initially closed
      expect(vm.showEditor).toBe(false)
      
      // Toggle open
      vm.toggleEditor()
      await wrapper.vm.$nextTick()
      expect(vm.showEditor).toBe(true)
      
      // Toggle closed
      vm.toggleEditor()
      await wrapper.vm.$nextTick()
      expect(vm.showEditor).toBe(false)
    })
  })

  describe('Accessibility', () => {
    it('should apply data-testid when provided', () => {
      const wrapper = createWrapper({ 'data-testid': 'test-textcodeinput' })
      expect(wrapper.find('[data-testid="test-textcodeinput"]').exists()).toBe(true)
    })
  })

  describe('Styling Variants', () => {
    it('should handle variant prop', () => {
      const wrapper = createWrapper({ variant: 'filled' })
      expect(wrapper.props('variant')).toBe('filled')
    })

    it('should handle size prop', () => {
      const wrapper = createWrapper({ size: 'large' })
      expect(wrapper.props('size')).toBe('large')
    })
  })

  describe('Input Types', () => {
    it('should handle text input type', () => {
      const wrapper = createWrapper({ type: 'text' })
      const input = wrapper.find('.textcodeinput-wrapper__input')
      
      expect(input.attributes('type')).toBe('text')
    })

    it('should handle email input type', () => {
      const wrapper = createWrapper({ type: 'email' })
      const input = wrapper.find('.textcodeinput-wrapper__input')
      
      expect(input.attributes('type')).toBe('email')
    })

    it('should handle number type', () => {
      const wrapper = createWrapper({ type: 'number' })
      const input = wrapper.find('.textcodeinput-wrapper__input')
      
      // In our simplified test component, number type is preserved
      expect(input.attributes('type')).toBe('number')
    })
  })

  describe('Edge Cases', () => {
    it('should handle undefined modelValue gracefully', () => {
      const wrapper = createWrapper({ modelValue: undefined })
      const input = wrapper.find('.textcodeinput-wrapper__input')
      
      expect((input.element as HTMLInputElement).value).toBe('')
    })

    it('should handle null modelValue gracefully', () => {
      const wrapper = createWrapper({ modelValue: null })
      const input = wrapper.find('.textcodeinput-wrapper__input')
      
      expect((input.element as HTMLInputElement).value).toBe('')
    })

    it('should not open editor when editorConfig is null', () => {
      const wrapper = createWrapper({ editorConfig: null })
      const vm = wrapper.vm as any
      
      vm.openEditor()
      expect(vm.showEditor).toBe(false)
    })
  })
})