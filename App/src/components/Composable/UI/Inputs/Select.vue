<template>
  <div class="select-wrapper" :class="wrapperClasses">
    <FloatLabel 
      v-if="label"
      variant="on" 
      pt:root:class="select-float-label"
    >
      <Select
        ref="primevueRef"
        :id="id || selectId"
        v-model="modelValue"
        :options="options"
        :optionLabel="optionLabel"
        :optionValue="optionValue"
        :placeholder="placeholder"
        :disabled="disabled || isRunning"
        :readonly="readonly"
        :invalid="invalid"
        :showClear="showClear"
        :filter="filter"
        :filterPlaceholder="filterPlaceholder"
        :emptyMessage="emptyMessage"
        :emptyFilterMessage="emptyFilterMessage"
        :scrollHeight="scrollHeight"
        :loading="loading"
        :class="selectClasses"
        @change="handleChange"
        @show="handleShow"
        @hide="handleHide"
        @filter="handleFilter"
      >
        <template #option="{ option }">
          <component
            v-if="option.customComponent"
            :is="option.customComponent"
            v-bind="option"
          />
          <span v-else>{{ option.label }}</span>
        </template>
      </Select>
      <label :for="id || selectId">{{ label }}</label>
    </FloatLabel>
    
    <Select
      v-else
      ref="primevueRef"
      :id="id || selectId"
      v-model="modelValue"
      :options="options"
      :optionLabel="optionLabel"
      :optionValue="optionValue"
      :placeholder="placeholder"
      :disabled="disabled || isRunning"
      :readonly="readonly"
      :invalid="invalid"
      :showClear="showClear"
      :filter="filter"
      :filterPlaceholder="filterPlaceholder"
      :emptyMessage="emptyMessage"
      :emptyFilterMessage="emptyFilterMessage"
      :scrollHeight="scrollHeight"
      :loading="loading"
      :class="selectClasses"
      @change="handleChange"
      @show="handleShow"
      @hide="handleHide"
      @filter="handleFilter"
    >
      <template #option="{ option }">
        <component
          v-if="option.customComponent"
          :is="option.customComponent"
          v-bind="option"
        />
        <span v-else>{{ option.label }}</span>
      </template>
    </Select>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, nextTick } from 'vue'
import { generateId } from '../utils/component'
import FloatLabel from 'primevue/floatlabel'
import Select from 'primevue/select'
import type { SelectProps, SelectEmits, SelectExposed } from './Select.types'
import { selectVariantClasses } from './Select.config'

// Props with defaults
const props = defineProps<SelectProps>()

// Model
const modelValue = defineModel<any>()

// Emits
const emit = defineEmits<SelectEmits>()

// Template ref
const primevueRef = ref<any>(null)

// Generate unique ID if not provided
const selectId = computed(() => props.id || generateId('select'))

// Option handling - PrimeVue Select expects optionLabel and optionValue
const optionLabel = 'label'
const optionValue = 'value'

// Computed classes
const wrapperClasses = computed(() => [
  'select-wrapper',
  {
    'select-wrapper--disabled': props.disabled || props.isRunning,
    'select-wrapper--invalid': props.invalid,
    'select-wrapper--readonly': props.readonly,
    'select-wrapper--loading': props.loading
  }
])

const selectClasses = computed(() => [
  'select-input',
  selectVariantClasses[props.variant || 'outlined'],
  {
    'select-input--invalid': props.invalid,
    'select-input--disabled': props.disabled || props.isRunning,
    'select-input--readonly': props.readonly,
    'select-input--loading': props.loading
  }
])

// Event handlers
const handleChange = (event: any) => {
  emit('change', event)
}

const handleShow = () => {
  emit('show')
}

const handleHide = () => {
  emit('hide')
}

const handleFilter = (event: any) => {
  emit('filter', event)
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

const show = () => {
  nextTick(() => {
    primevueRef.value?.show()
  })
}

const hide = () => {
  nextTick(() => {
    primevueRef.value?.hide()
  })
}

// Expose methods and refs
defineExpose<SelectExposed>({
  primevueRef,
  focus,
  blur,
  show,
  hide
})
</script>

<style scoped>
.select-wrapper {
  position: relative;
  width: 100%;
  margin-bottom: 10px;
}

.select-wrapper--disabled {
  opacity: 0.6;
  pointer-events: none;
}

:deep(.select-float-label) {
  width: 100%;
}

:deep(.select-input) {
  width: 100%;
  height: 2.5rem;
  font-size: 1rem;
  border-radius: 20px;
  transition: all 0.2s ease-in-out;
}

:deep(.select-input:focus) {
  border-color: var(--p-primary-color, black);
  box-shadow: 0 0 0 1px var(--p-primary-color, black);
}

:deep(.select-input--invalid) {
  border-color: var(--p-red-500, #ef4444);
}

:deep(.select-input--invalid:focus) {
  border-color: var(--p-red-500, #ef4444);
  box-shadow: 0 0 0 1px var(--p-red-500, #ef4444);
}

:deep(.select-float-label label) {
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

:deep(.select-float-label .p-float-label-active label) {
  top: -0.5rem;
  left: 0.75rem;
  font-size: 0.75rem;
  background: var(--p-surface-0, white);
  padding: 0 0.25rem;
  color: var(--p-primary-color, black) !important;
}

/* Dropdown styling */
:deep(.p-select-overlay) {
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  max-height: 250px;
}

:deep(.p-select-option) {
  padding: 8px 15px;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  align-items: center;
}

:deep(.p-select-option:hover) {
  background: var(--p-primary-color, var(--primary-color));
  color: var(--p-surface-0, white);
}

:deep(.p-select-option.p-select-option-selected) {
  background: var(--p-primary-color, var(--primary-color));
  color: var(--p-surface-0, white);
}

/* Loading state */
:deep(.select-input--loading .p-select-dropdown-icon) {
  display: none;
}

/* Dark theme support */
[data-theme="dark"] :deep(.select-float-label .p-float-label-active label) {
  background: var(--p-surface-900, #111827);
}

/* Custom component support in options */
:deep(.p-select-option .custom-option-component) {
  width: 100%;
  display: flex;
  align-items: center;
}
</style>