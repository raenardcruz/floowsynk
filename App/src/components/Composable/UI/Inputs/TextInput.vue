
<template>
  <div class="text-input-wrapper" :class="wrapperClasses">
    <FloatLabel 
      v-if="label"
      variant="on" 
      pt:root:class="text-input-float-label"
      v-tooltip.focus.bottom="tooltip"
    >
      <InputText
        ref="primevueRef"
        :id="id || inputId"
        v-model="modelValue"
        :type="type"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :invalid="invalid"
        :maxlength="maxlength"
        :autocomplete="autocomplete"
        :class="inputClasses"
        :data-testid="$props['data-testid']"
        @focus="handleFocus"
        @blur="handleBlur"
        @keydown="handleKeydown"
        @keyup="handleKeyup"
        @input="handleInput"
      />
      <label :for="id || inputId">{{ label }}</label>
    </FloatLabel>
    
    <InputText
      v-else
      ref="primevueRef"
      :id="id || inputId"
      v-model="modelValue"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :invalid="invalid"
      :maxlength="maxlength"
      :autocomplete="autocomplete"
      :class="inputClasses"
      :data-testid="$props['data-testid']"
      v-tooltip.focus.bottom="tooltip"
      @focus="handleFocus"
      @blur="handleBlur"
      @keydown="handleKeydown"
      @keyup="handleKeyup"
      @input="handleInput"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, nextTick } from 'vue'
import { generateId } from '../utils/component'
import FloatLabel from 'primevue/floatlabel'
import InputText from 'primevue/inputtext'
import type { TextInputProps, TextInputEmits, TextInputExposed } from './TextInput.types'
import { defaultTextInputProps, textInputVariantClasses } from './TextInput.config'

// Props with defaults
const props = withDefaults(defineProps<TextInputProps>(), defaultTextInputProps)

// Model
const modelValue = defineModel<string>({ default: '' })

// Emits
const emit = defineEmits<TextInputEmits>()

// Template ref
const primevueRef = ref<any>(null)

// Generate unique ID if not provided
const inputId = computed(() => props.id || generateId('text-input'))

// Computed classes
const wrapperClasses = computed(() => [
  'text-input-wrapper',
  {
    'text-input-wrapper--disabled': props.disabled,
    'text-input-wrapper--invalid': props.invalid,
    'text-input-wrapper--readonly': props.readonly
  }
])

const inputClasses = computed(() => [
  'text-input',
  textInputVariantClasses[props.variant || 'outlined'],
  {
    'text-input--invalid': props.invalid,
    'text-input--disabled': props.disabled,
    'text-input--readonly': props.readonly
  }
])

// Event handlers
const handleFocus = (event: FocusEvent) => {
  emit('focus', event)
}

const handleBlur = (event: FocusEvent) => {
  emit('blur', event)
}

const handleKeydown = (event: KeyboardEvent) => {
  emit('keydown', event)
}

const handleKeyup = (event: KeyboardEvent) => {
  emit('keyup', event)
}

const handleInput = (event: Event) => {
  emit('input', event)
}

// Exposed methods
const focus = () => {
  nextTick(() => {
    primevueRef.value?.$el?.focus()
  })
}

const blur = () => {
  nextTick(() => {
    primevueRef.value?.$el?.blur()
  })
}

const select = () => {
  nextTick(() => {
    primevueRef.value?.$el?.select()
  })
}

// Expose methods and refs
defineExpose<TextInputExposed>({
  primevueRef,
  focus,
  blur,
  select
})
</script>

<style scoped>
.text-input-wrapper {
  position: relative;
  width: 100%;
  margin-bottom: 10px;
}

.text-input-wrapper--disabled {
  opacity: 0.6;
  pointer-events: none;
}

:deep(.text-input-float-label) {
  width: 100%;
}

:deep(.text-input) {
  width: 100%;
  height: 2.5rem;
  font-size: 1rem;
  border-radius: 20px;
  padding: 0 1rem;
  transition: all 0.2s ease-in-out;
}

:deep(.text-input:focus) {
  border-color: var(--p-primary-color, black);
  color: var(--p-surface-900, black);
  box-shadow: 0 0 0 1px var(--p-primary-color, black);
}

:deep(.text-input--invalid) {
  border-color: var(--p-red-500, #ef4444);
}

:deep(.text-input--invalid:focus) {
  border-color: var(--p-red-500, #ef4444);
  box-shadow: 0 0 0 1px var(--p-red-500, #ef4444);
}

:deep(.text-input-float-label label) {
  display: flex;
  position: absolute;
  top: 50%;
  left: 1rem;
  transform: translateY(-50%);
  color: var(--p-surface-500, var(--grey-1)) !important;
  font-size: 0.875rem;
  transition: all 0.2s ease-in-out;
  pointer-events: none;
}

:deep(.text-input-float-label .p-float-label-active label) {
  top: -0.5rem;
  left: 0.75rem;
  font-size: 0.75rem;
  background: var(--p-surface-0, white);
  padding: 0 0.25rem;
  color: var(--p-primary-color, black) !important;
}

/* Dark theme support */
[data-theme="dark"] :deep(.text-input-float-label .p-float-label-active label) {
  background: var(--p-surface-900, #111827);
}
</style>