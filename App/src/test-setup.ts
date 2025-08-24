/**
 * Test setup file for Vitest
 */

import { vi } from 'vitest'

// Mock PrimeVue components globally
vi.mock('primevue/inputtext', () => ({
  default: {
    name: 'InputText',
    template: `<input 
      :value="modelValue" 
      :type="type" 
      :placeholder="placeholder" 
      :disabled="disabled" 
      :readonly="readonly" 
      :maxlength="maxlength" 
      :autocomplete="autocomplete"
      :data-testid="$attrs['data-testid']"
      v-bind="$attrs" 
      @input="$emit('update:modelValue', $event.target.value)" 
      @focus="$emit('focus', $event)"
      @blur="$emit('blur', $event)"
      @keydown="$emit('keydown', $event)"
      @keyup="$emit('keyup', $event)"
    />`,
    props: ['modelValue', 'type', 'placeholder', 'disabled', 'readonly', 'invalid', 'maxlength', 'autocomplete'],
    emits: ['update:modelValue', 'focus', 'blur', 'keydown', 'keyup', 'input']
  }
}))

vi.mock('primevue/floatlabel', () => ({
  default: {
    name: 'FloatLabel',
    template: '<div class="p-float-label"><slot /></div>',
    props: ['variant']
  }
}))

vi.mock('primevue/password', () => ({
  default: {
    name: 'Password',
    template: '<input type="password" v-bind="$attrs" @input="$emit(\'update:modelValue\', $event.target.value)" />',
    props: ['modelValue', 'placeholder', 'disabled', 'readonly', 'invalid', 'toggleMask'],
    emits: ['update:modelValue']
  }
}))

vi.mock('primevue/select', () => ({
  default: {
    name: 'Select',
    template: '<select v-bind="$attrs" @change="$emit(\'update:modelValue\', $event.target.value)"><option v-for="option in options" :key="option.value" :value="option.value">{{ option.label }}</option></select>',
    props: ['modelValue', 'options', 'placeholder', 'disabled', 'invalid'],
    emits: ['update:modelValue']
  }
}))

vi.mock('primevue/checkbox', () => ({
  default: {
    name: 'Checkbox',
    template: '<input type="checkbox" v-bind="$attrs" @change="$emit(\'update:modelValue\', $event.target.checked)" />',
    props: ['modelValue', 'disabled', 'invalid'],
    emits: ['update:modelValue']
  }
}))

// Mock tooltip directive
global.vTooltip = {
  mounted() {},
  updated() {},
  unmounted() {}
}