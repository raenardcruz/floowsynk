<template>
  <div class="checkbox-wrapper" :class="wrapperClasses">
    <label class="checkbox-container" :class="containerClasses">
      <Checkbox
        ref="primevueRef"
        :id="id || checkboxId"
        v-model="modelValue"
        :value="value"
        :disabled="disabled"
        :readonly="readonly"
        :invalid="invalid"
        :indeterminate="indeterminate"
        :name="name"
        :tabindex="tabindex"
        :aria-label="ariaLabel"
        :aria-labelledby="ariaLabelledby"
        :data-testid="$props['data-testid']"
        :class="checkboxClasses"
        @focus="handleFocus"
        @blur="handleBlur"
        @change="handleChange"
      />
      <div class="custom-checkmark" :class="checkmarkClasses"></div>
      <span v-if="label" class="checkbox-label">{{ label }}</span>
    </label>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, nextTick } from 'vue'
import { generateId } from '../utils/component'
import Checkbox from 'primevue/checkbox'
import type { CheckboxProps, CheckboxEmits, CheckboxExposed } from './Checkbox.types'
import { defaultCheckboxProps, checkboxStateClasses } from './Checkbox.config'

// Props with defaults
const props = withDefaults(defineProps<CheckboxProps>(), defaultCheckboxProps)

// Model
const modelValue = defineModel<boolean | any[]>({ default: false })

// Emits
const emit = defineEmits<CheckboxEmits>()

// Template ref
const primevueRef = ref<any>(null)

// Generate unique ID if not provided
const checkboxId = computed(() => props.id || generateId('checkbox'))

// Computed state
const isChecked = computed(() => {
  if (Array.isArray(modelValue.value)) {
    return modelValue.value.includes(props.value)
  }
  return Boolean(modelValue.value)
})

// Computed classes
const wrapperClasses = computed(() => [
  'checkbox-wrapper',
  {
    'checkbox-wrapper--disabled': props.disabled,
    'checkbox-wrapper--invalid': props.invalid,
    'checkbox-wrapper--readonly': props.readonly
  }
])

const containerClasses = computed(() => [
  'checkbox-container',
  {
    'checkbox-container--checked': isChecked.value,
    'checkbox-container--disabled': props.disabled,
    'checkbox-container--invalid': props.invalid,
    'checkbox-container--readonly': props.readonly,
    'checkbox-container--indeterminate': props.indeterminate
  }
])

const checkboxClasses = computed(() => [
  'checkbox-input',
  {
    'checkbox-input--checked': isChecked.value,
    'checkbox-input--disabled': props.disabled,
    'checkbox-input--invalid': props.invalid,
    'checkbox-input--readonly': props.readonly,
    'checkbox-input--indeterminate': props.indeterminate
  }
])

const checkmarkClasses = computed(() => [
  'custom-checkmark',
  {
    'custom-checkmark--checked': isChecked.value,
    'custom-checkmark--disabled': props.disabled,
    'custom-checkmark--invalid': props.invalid,
    'custom-checkmark--indeterminate': props.indeterminate
  }
])

// Event handlers
const handleFocus = (event: FocusEvent) => {
  emit('focus', event)
}

const handleBlur = (event: FocusEvent) => {
  emit('blur', event)
}

const handleChange = (event: Event) => {
  emit('change', event)
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

// Expose methods and refs
defineExpose<CheckboxExposed>({
  primevueRef,
  focus,
  blur
})
</script>

<style scoped>
.checkbox-wrapper {
  position: relative;
  width: 100%;
  margin-bottom: 10px;
}

.checkbox-wrapper--disabled {
  opacity: 0.6;
  pointer-events: none;
}

.checkbox-container {
  display: flex;
  gap: 12px;
  position: relative;
  cursor: pointer;
  font-size: 1rem;
  user-select: none;
  border-radius: 50px;
  align-items: center;
  padding: 8px 12px;
  transition: background-color 0.3s ease, border-color 0.3s ease;
  width: 100%;
  box-sizing: border-box;
}

.checkbox-container:hover:not(.checkbox-container--disabled) {
  background-color: var(--p-surface-100, var(--white-3));
  border-color: var(--p-surface-400, var(--grey-3));
}

.checkbox-container--disabled {
  cursor: not-allowed;
}

/* Hide the actual PrimeVue checkbox input */
:deep(.checkbox-input) {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.custom-checkmark {
  position: relative;
  top: 0;
  left: 0;
  height: 1.5em;
  width: 1.5em;
  background-color: var(--p-surface-100, var(--white-3));
  border-radius: 50%;
  transition: background-color 0.3s ease, transform 0.3s ease;
  margin: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 2px 4px var(--p-surface-300, var(--grey-4));
  flex-shrink: 0;
}

.custom-checkmark--checked {
  background-color: var(--p-green-500, var(--green-3));
  border-radius: 4px;
  animation: pulse 500ms ease-in-out;
  transform: scale(1.1);
}

.custom-checkmark--indeterminate {
  background-color: var(--p-orange-500, var(--orange-3));
  border-radius: 4px;
}

.custom-checkmark--invalid {
  border: 2px solid var(--p-red-500, #ef4444);
}

.custom-checkmark--disabled {
  background-color: var(--p-surface-200, #e5e7eb);
  box-shadow: none;
}

.custom-checkmark:after {
  content: "";
  position: absolute;
  display: none;
}

.custom-checkmark--checked:after {
  display: block;
  left: 0.5em;
  top: 0.3em;
  width: 0.3em;
  height: 0.6em;
  border: solid var(--p-surface-0, var(--white-1));
  border-width: 0 0.2em 0.2em 0;
  transform: rotate(45deg);
}

.custom-checkmark--indeterminate:after {
  display: block;
  left: 0.3em;
  top: 0.65em;
  width: 0.9em;
  height: 0.2em;
  background: var(--p-surface-0, var(--white-1));
  transform: none;
  border: none;
}

.checkbox-label {
  color: var(--p-surface-900, var(--black));
  transition: color 0.3s ease;
}

.checkbox-container--disabled .checkbox-label {
  color: var(--p-surface-400, #9ca3af);
}

.checkbox-container--invalid .checkbox-label {
  color: var(--p-red-500, #ef4444);
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 var(--p-green-200, var(--green-5));
    rotate: 20deg;
  }

  50% {
    rotate: -20deg;
  }

  75% {
    box-shadow: 0 0 0 10px var(--p-green-200, #0B6E4F60);
  }

  100% {
    box-shadow: 0 0 0 13px var(--p-green-100, #0B6E4F30);
    rotate: 0;
  }
}

/* Dark theme support */
[data-theme="dark"] .checkbox-label {
  color: var(--p-surface-0, white);
}

[data-theme="dark"] .checkbox-container--disabled .checkbox-label {
  color: var(--p-surface-500, #6b7280);
}

/* Focus styles */
:deep(.checkbox-input:focus) + .custom-checkmark {
  box-shadow: 0 0 0 2px var(--p-primary-color, black);
}
</style>
