<template>
  <div :class="[
    'keyvalue-wrapper',
    {
      'keyvalue-wrapper--disabled': disabled,
      'keyvalue-wrapper--invalid': invalid,
      'keyvalue-wrapper--required': required
    }
  ]">
    <div v-if="label" class="keyvalue-wrapper__label">
      {{ label }}
    </div>

    <FloatLabel variant="on" style="margin-top: 8px;">
      <InputText ref="keyInputRef" :id="keyInputId" v-model="keyValue" :placeholder="keyPlaceholder || 'Key'"
        :disabled="disabled" :invalid="invalid" :class="[
          keyValueVariantClasses[variant || 'outlined'],
          keyValueSizeClasses[size || 'medium'],
          'keyvalue-wrapper__key-input'
        ]" @focus="handleKeyFocus" @blur="handleKeyBlur" />
      <label :for="keyInputId">Key</label>
    </FloatLabel>

    <FloatLabel variant="on" style="margin-top: 8px;">
      <InputText ref="valueInputRef" :id="valueInputId" v-model="valueValue" :placeholder="valuePlaceholder || 'Value'"
        :disabled="disabled" :invalid="invalid" :class="[
          keyValueVariantClasses[variant || 'outlined'],
          keyValueSizeClasses[size || 'medium'],
          'keyvalue-wrapper__value-input'
        ]" @focus="handleValueFocus" @blur="handleValueBlur" />
      <label :for="valueInputId">Value</label>
    </FloatLabel>

    <div class="divider"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { generateId } from '../utils/component'
import FloatLabel from 'primevue/floatlabel'
import InputText from 'primevue/inputtext'

import type {
  KeyValueWrapperProps,
  KeyValueWrapperEmits,
  KeyValueWrapperExposed,
  KeyValuePair
} from './KeyValue.types'
import {
  keyValueVariantClasses,
  keyValueSizeClasses
} from './KeyValue.config'

// Props with defaults
const props = defineProps<KeyValueWrapperProps>()

// Emits
const emit = defineEmits<KeyValueWrapperEmits>()

// Template refs
const keyInputRef = ref()
const valueInputRef = ref()

// Generate unique IDs
const keyInputId = generateId('keyvalue-key')
const valueInputId = generateId('keyvalue-value')

// Computed values for individual inputs
const keyValue = computed({
  get: () => props.modelValue?.key || '',
  set: (newKey: string) => {
    const newValue: KeyValuePair = {
      key: newKey,
      value: props.modelValue?.value || ''
    }
    emit('update:modelValue', newValue)
  }
})

const valueValue = computed({
  get: () => props.modelValue?.value || '',
  set: (newValue: string) => {
    const newPair: KeyValuePair = {
      key: props.modelValue?.key || '',
      value: newValue
    }
    emit('update:modelValue', newPair)
  }
})

// Event handlers
const handleKeyFocus = (event: FocusEvent) => {
  emit('key-focus', event)
}

const handleKeyBlur = (event: FocusEvent) => {
  emit('key-blur', event)
}

const handleValueFocus = (event: FocusEvent) => {
  emit('value-focus', event)
}

const handleValueBlur = (event: FocusEvent) => {
  emit('value-blur', event)
}

// Exposed methods
const focusKey = async () => {
  await nextTick()
  keyInputRef.value?.$el?.focus()
}

const focusValue = async () => {
  await nextTick()
  valueInputRef.value?.$el?.focus()
}

const blurKey = async () => {
  await nextTick()
  keyInputRef.value?.$el?.blur()
}

const blurValue = async () => {
  await nextTick()
  valueInputRef.value?.$el?.blur()
}

// Expose methods and refs
defineExpose<KeyValueWrapperExposed>({
  keyInputRef,
  valueInputRef,
  focusKey,
  focusValue,
  blurKey,
  blurValue
})
</script>

<style scoped>
.keyvalue-wrapper {
  display: flex;
  position: relative;
  flex-direction: column;
  width: 100%;
  gap: 10px;
  border-radius: 20px;
  border: 1px solid var(--p-surface-border);
  margin-top: 12px;
  background: var(--p-surface-ground);
  padding-top: 8px;
}

.divider {
  height: 1px;
  background: var(--neutral-7);
  margin: 8px 0;
}

.keyvalue-wrapper--disabled {
  opacity: 0.6;
  pointer-events: none;
}

.keyvalue-wrapper--invalid {
  border-color: var(--p-red-500);
}

.keyvalue-wrapper__label {
  display: flex;
  position: absolute;
  top: -15px;
  left: 10px;
  font-size: 12px;
  background: var(--p-surface-ground);
  color: var(--p-text-color);
  border: 1px solid var(--p-surface-border);
  border-radius: 10px;
  padding: 0px 8px;
  font-weight: 500;
  box-shadow: 0 2px 4px var(--p-surface-border);
  align-items: center;
  gap: 4px;
}

.keyvalue-wrapper__required {
  color: var(--p-red-500);
}

.keyvalue-wrapper__inputs {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}

.keyvalue-wrapper__input-group {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.keyvalue-wrapper__key-input,
.keyvalue-wrapper__value-input {
  width: 100%;
}

/* Responsive design */
@media (min-width: 768px) {
  .keyvalue-wrapper__inputs {
    flex-direction: row;
    gap: 12px;
  }

  .keyvalue-wrapper__input-group {
    flex: 1;
  }
}


/* Invalid state styling */
.keyvalue-wrapper--invalid .keyvalue-wrapper__key-input,
.keyvalue-wrapper--invalid .keyvalue-wrapper__value-input {
  border-color: var(--p-red-500);
}

.keyvalue-wrapper--invalid:focus-within {
  border-color: var(--p-red-500);
  box-shadow: 0 0 0 1px var(--p-red-500);
}
</style>