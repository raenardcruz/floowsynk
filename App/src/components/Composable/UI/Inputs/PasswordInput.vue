<template>
  <div class="password-input-wrapper" :class="wrapperClasses">
    <FloatLabel 
      v-if="label"
      variant="on" 
      pt:root:class="password-input-float-label"
      v-tooltip.focus.bottom="tooltip"
    >
      <Password
        ref="primevueRef"
        :id="id || inputId"
        v-model="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :invalid="invalid"
        :maxlength="maxlength"
        :autocomplete="autocomplete"
        :toggleMask="toggleMask"
        :feedback="feedback"
        :promptLabel="promptLabel"
        :weakLabel="weakLabel"
        :mediumLabel="mediumLabel"
        :strongLabel="strongLabel"
        :class="inputClasses"
        :data-testid="$props['data-testid']"
        pt:pcInputText:root:class="password-input-field"
        @focus="handleFocus"
        @blur="handleBlur"
        @keydown="handleKeydown"
        @keyup="handleKeyup"
        @input="handleInput"
      />
      <label :for="id || inputId">{{ label }}</label>
    </FloatLabel>
    
    <Password
      v-else
      ref="primevueRef"
      :id="id || inputId"
      v-model="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :invalid="invalid"
      :maxlength="maxlength"
      :autocomplete="autocomplete"
      :toggleMask="toggleMask"
      :feedback="feedback"
      :promptLabel="promptLabel"
      :weakLabel="weakLabel"
      :mediumLabel="mediumLabel"
      :strongLabel="strongLabel"
      :class="inputClasses"
      :data-testid="$props['data-testid']"
      pt:pcInputText:root:class="password-input-field"
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
import Password from 'primevue/password'
import type { PasswordInputProps, PasswordInputEmits, PasswordInputExposed } from './PasswordInput.types'
import { defaultPasswordInputProps, passwordInputVariantClasses } from './PasswordInput.config'

// Props with defaults
const props = withDefaults(defineProps<PasswordInputProps>(), defaultPasswordInputProps)

// Model
const modelValue = defineModel<string>({ default: '' })

// Emits
const emit = defineEmits<PasswordInputEmits>()

// Template ref
const primevueRef = ref<any>(null)

// Generate unique ID if not provided
const inputId = computed(() => props.id || generateId('password-input'))

// Computed classes
const wrapperClasses = computed(() => [
  'password-input-wrapper',
  {
    'password-input-wrapper--disabled': props.disabled,
    'password-input-wrapper--invalid': props.invalid,
    'password-input-wrapper--readonly': props.readonly
  }
])

const inputClasses = computed(() => [
  'password-input',
  passwordInputVariantClasses[props.variant || 'outlined'],
  {
    'password-input--invalid': props.invalid,
    'password-input--disabled': props.disabled,
    'password-input--readonly': props.readonly
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
    primevueRef.value?.$el?.querySelector('input')?.focus()
  })
}

const blur = () => {
  nextTick(() => {
    primevueRef.value?.$el?.querySelector('input')?.blur()
  })
}

const select = () => {
  nextTick(() => {
    primevueRef.value?.$el?.querySelector('input')?.select()
  })
}

// Expose methods and refs
defineExpose<PasswordInputExposed>({
  primevueRef,
  focus,
  blur,
  select
})
</script>

<style scoped>
.password-input-wrapper {
  position: relative;
  width: 100%;
  margin-bottom: 10px;
}

.password-input-wrapper--disabled {
  opacity: 0.6;
  pointer-events: none;
}

:deep(.password-input-float-label) {
  width: 100%;
}

:deep(.password-input-field) {
  width: 100%;
  height: 2.5rem;
  font-size: 1rem;
  border-radius: 20px !important;
  padding: 0 2.5rem 0 1rem;
  transition: all 0.2s ease-in-out;
}

:deep(.password-input-field:focus) {
  border-color: var(--p-primary-color, black) !important;
  color: var(--p-surface-900, black);
  box-shadow: 0 0 0 1px var(--p-primary-color, black);
}

:deep(.password-input--invalid .password-input-field) {
  border-color: var(--p-red-500, #ef4444) !important;
}

:deep(.password-input--invalid .password-input-field:focus) {
  border-color: var(--p-red-500, #ef4444) !important;
  box-shadow: 0 0 0 1px var(--p-red-500, #ef4444);
}

:deep(.password-input-float-label label) {
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

:deep(.password-input-float-label .p-float-label-active label) {
  top: -0.5rem;
  left: 0.75rem;
  font-size: 0.75rem;
  background: var(--p-surface-0, white);
  padding: 0 0.25rem;
  color: var(--p-primary-color, black) !important;
}

/* Password toggle button styling */
:deep(.p-password-toggle-mask) {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: var(--p-surface-500, #6b7280);
  transition: color 0.2s ease-in-out;
}

:deep(.p-password-toggle-mask:hover) {
  color: var(--p-primary-color, black);
}

/* Password strength meter */
:deep(.p-password-meter) {
  margin-top: 0.5rem;
}

/* Dark theme support */
[data-theme="dark"] :deep(.password-input-float-label .p-float-label-active label) {
  background: var(--p-surface-900, #111827);
}
</style>