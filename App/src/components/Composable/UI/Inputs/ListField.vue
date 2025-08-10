<template>
  <div 
    :class="[
      'listfield-wrapper',
      {
        'listfield-wrapper--disabled': disabled,
        'listfield-wrapper--invalid': invalid,
        'listfield-wrapper--required': required
      }
    ]"
    :data-testid="$props['data-testid']"
  >
    <div v-if="label" class="listfield-wrapper__label">
      {{ label }}
      <span v-if="required" class="listfield-wrapper__required">*</span>
    </div>
    
    <!-- List Items -->
    <div class="listfield-wrapper__items">
      <div 
        v-for="(item, index) in displayItems" 
        :key="`item-${index}`"
        class="listfield-wrapper__item"
      >
        <Button
          icon="pi pi-times"
          severity="danger"
          size="small"
          text
          rounded
          class="listfield-wrapper__remove-btn"
          :disabled="disabled"
          @click="removeItem(index)"
          :aria-label="`Remove item ${index + 1}`"
        />
        
        <component
          :is="getComponentForType(currentDataType).component"
          v-model="displayItems[index]"
          v-bind="getComponentPropsForIndex(index)"
          :disabled="disabled"
          :invalid="invalid"
        />
      </div>
    </div>
    
    <!-- Add Item Section -->
    <div class="listfield-wrapper__actions">
      <Select
        v-if="showTypeSelector"
        v-model="currentDataType"
        :options="availableTypeOptions"
        :disabled="disabled"
        placeholder="Select item type"
        class="listfield-wrapper__type-selector"
      />
      
      <Button
        icon="pi pi-plus"
        :label="addButtonLabel"
        :disabled="disabled || isMaxItemsReached"
        @click="addItem"
        class="listfield-wrapper__add-btn"
      />
    </div>
    
    <!-- Item Count Info -->
    <div v-if="showItemCount" class="listfield-wrapper__info">
      {{ displayItems.length }} item{{ displayItems.length !== 1 ? 's' : '' }}
      <span v-if="maxItems"> (max {{ maxItems }})</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import Button from 'primevue/button'
import Select from './Select.vue'

import type { 
  ListFieldWrapperProps, 
  ListFieldWrapperEmits, 
  ListFieldWrapperExposed,
  ListFieldItemType
} from './ListField.types'
import { 
  defaultListFieldProps, 
  listFieldTypeOptions,
  getComponentPropsForType
} from './ListField.config'

// Import protocol buffer types for backward compatibility
import { NodeDataArray, ArrayDataType, KeyValue } from 'proto/workflow/workflow_pb'

// Props with defaults
const props = withDefaults(
  defineProps<ListFieldWrapperProps>(),
  defaultListFieldProps
)

// Emits
const emit = defineEmits<ListFieldWrapperEmits>()

// Internal state
const currentDataType = ref<ListFieldItemType>('string')

// Computed properties
const availableTypeOptions = computed(() => {
  return listFieldTypeOptions
    .filter(option => props.availableTypes?.includes(option.value))
    .map(option => ({
      value: option.value,
      label: option.label
    }))
})

const isMaxItemsReached = computed(() => {
  return props.maxItems !== undefined && displayItems.value.length >= props.maxItems
})

const addButtonLabel = computed(() => {
  return isMaxItemsReached.value ? 'Maximum reached' : 'Add Item'
})

const showItemCount = computed(() => {
  return props.maxItems !== undefined || props.minItems > 0
})

// Handle backward compatibility with protocol buffer types
const isProtocolBufferModel = computed(() => {
  return props.modelValue && typeof props.modelValue === 'object' && 'type' in props.modelValue
})

const displayItems = computed({
  get() {
    if (!props.modelValue) return []
    
    if (isProtocolBufferModel.value) {
      // Handle protocol buffer format
      const pbModel = props.modelValue as NodeDataArray.AsObject
      const typeMap = {
        [ArrayDataType.STRING]: pbModel.stringitemsList || [],
        [ArrayDataType.INT]: pbModel.intitemsList || [],
        [ArrayDataType.BOOL]: pbModel.boolitemsList || [],
        [ArrayDataType.KEYVALUE]: pbModel.keyvalueitemsList || []
      }
      
      // Update current data type based on protocol buffer type
      const pbTypeToLocal = {
        [ArrayDataType.STRING]: 'string' as ListFieldItemType,
        [ArrayDataType.INT]: 'number' as ListFieldItemType,
        [ArrayDataType.BOOL]: 'boolean' as ListFieldItemType,
        [ArrayDataType.KEYVALUE]: 'keyvalue' as ListFieldItemType
      }
      
      currentDataType.value = pbTypeToLocal[pbModel.type] || 'string'
      return typeMap[pbModel.type] || []
    } else {
      // Handle simple array format
      return Array.isArray(props.modelValue) ? props.modelValue : []
    }
  },
  set(newValue) {
    if (isProtocolBufferModel.value) {
      // Update protocol buffer format
      const pbModel = { ...props.modelValue } as NodeDataArray.AsObject
      
      // Clear all arrays
      pbModel.stringitemsList = []
      pbModel.intitemsList = []
      pbModel.boolitemsList = []
      pbModel.keyvalueitemsList = []
      
      // Set the appropriate array based on current type
      const localToPbType = {
        string: ArrayDataType.STRING,
        number: ArrayDataType.INT,
        boolean: ArrayDataType.BOOL,
        keyvalue: ArrayDataType.KEYVALUE
      }
      
      pbModel.type = localToPbType[currentDataType.value]
      
      switch (currentDataType.value) {
        case 'string':
          pbModel.stringitemsList = newValue as string[]
          break
        case 'number':
          pbModel.intitemsList = newValue as number[]
          break
        case 'boolean':
          pbModel.boolitemsList = newValue as boolean[]
          break
        case 'keyvalue':
          pbModel.keyvalueitemsList = newValue as KeyValue.AsObject[]
          break
      }
      
      emit('update:modelValue', pbModel)
    } else {
      // Update simple array format
      emit('update:modelValue', newValue)
    }
  }
})

// Methods
const getComponentForType = (type: ListFieldItemType) => {
  return listFieldTypeOptions.find(option => option.value === type) || listFieldTypeOptions[0]
}

const getComponentPropsForIndex = (index: number) => {
  return getComponentPropsForType(currentDataType.value, index)
}

const addItem = () => {
  if (isMaxItemsReached.value) return
  
  const componentOption = getComponentForType(currentDataType.value)
  const newItems = [...displayItems.value, componentOption.defaultValue]
  displayItems.value = newItems
  
  emit('item-added', {
    id: Date.now(),
    value: componentOption.defaultValue,
    type: currentDataType.value
  }, newItems.length - 1)
}

const removeItem = (index: number) => {
  const itemToRemove = {
    id: index,
    value: displayItems.value[index],
    type: currentDataType.value
  }
  
  const newItems = [...displayItems.value]
  newItems.splice(index, 1)
  displayItems.value = newItems
  
  emit('item-removed', itemToRemove, index)
}

const clearItems = () => {
  displayItems.value = []
}

const getItems = () => {
  return displayItems.value.map((value, index) => ({
    id: index,
    value,
    type: currentDataType.value
  }))
}

const setDataType = (type: ListFieldItemType) => {
  const oldType = currentDataType.value
  currentDataType.value = type
  
  // Clear items when type changes to avoid type conflicts
  displayItems.value = []
  
  emit('type-changed', type, oldType)
}

// Watch for data type changes
watch(currentDataType, (newType, oldType) => {
  if (newType !== oldType && oldType) {
    emit('type-changed', newType, oldType)
  }
})

// Expose methods
defineExpose<ListFieldWrapperExposed>({
  addItem,
  removeItem,
  clearItems,
  getItems,
  setDataType
})
</script>

<style scoped>
.listfield-wrapper {
  display: flex;
  position: relative;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  border: 1px solid var(--p-surface-border);
  min-height: 60px;
  border-radius: 12px;
  padding: 20px 16px;
  margin-top: 12px;
  background: var(--p-surface-ground);
}

.listfield-wrapper--disabled {
  opacity: 0.6;
  pointer-events: none;
}

.listfield-wrapper--invalid {
  border-color: var(--p-red-500);
}

.listfield-wrapper__label {
  display: flex;
  position: absolute;
  top: -10px;
  left: 12px;
  font-size: 12px;
  background: var(--p-surface-ground);
  color: var(--p-text-color);
  border: 1px solid var(--p-surface-border);
  border-radius: 8px;
  padding: 4px 8px;
  font-weight: 500;
  box-shadow: 0 2px 4px var(--p-surface-border);
  align-items: center;
  gap: 4px;
}

.listfield-wrapper__required {
  color: var(--p-red-500);
}

.listfield-wrapper__items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.listfield-wrapper__item {
  display: flex;
  position: relative;
  align-items: flex-start;
  gap: 8px;
  padding: 8px;
  border: 1px solid var(--p-surface-border);
  border-radius: 8px;
  background: var(--p-surface-50);
}

.listfield-wrapper__remove-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;
}

.listfield-wrapper__item > :not(.listfield-wrapper__remove-btn) {
  flex: 1;
  margin-right: 40px; /* Space for remove button */
}

.listfield-wrapper__actions {
  display: flex;
  gap: 12px;
  align-items: center;
  padding-top: 8px;
  border-top: 1px solid var(--p-surface-border);
}

.listfield-wrapper__type-selector {
  flex: 1;
  min-width: 150px;
}

.listfield-wrapper__add-btn {
  flex-shrink: 0;
}

.listfield-wrapper__info {
  font-size: 12px;
  color: var(--p-text-muted-color);
  text-align: center;
  padding-top: 8px;
  border-top: 1px solid var(--p-surface-border);
}

/* Focus states */
.listfield-wrapper:focus-within {
  border-color: var(--p-primary-color);
  box-shadow: 0 0 0 1px var(--p-primary-color);
}

/* Invalid state styling */
.listfield-wrapper--invalid:focus-within {
  border-color: var(--p-red-500);
  box-shadow: 0 0 0 1px var(--p-red-500);
}

/* Empty state */
.listfield-wrapper__items:empty::after {
  content: 'No items added yet';
  display: block;
  text-align: center;
  color: var(--p-text-muted-color);
  font-style: italic;
  padding: 20px;
}

/* Responsive design */
@media (max-width: 768px) {
  .listfield-wrapper__actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .listfield-wrapper__type-selector {
    min-width: unset;
  }
}
</style>