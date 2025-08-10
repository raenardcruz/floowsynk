<template>
  <!-- Monaco Editor Modal -->
  <Teleport :to="editorConfig?.target || 'body'" v-if="editorConfig && showEditor">
    <Modal 
      v-model="showEditor"
      :title="editorModalTitle"
      size="large"
      @update:modelValue="handleEditorModalClose"
    >
      <MonacoEditor 
        v-model="internalValue" 
        :variables="editorConfig.variables" 
        :disabled="disabled" 
      />
    </Modal>
  </Teleport>

  <div 
    :class="[
      'textcodeinput-wrapper',
      {
        'textcodeinput-wrapper--disabled': disabled,
        'textcodeinput-wrapper--invalid': invalid,
        'textcodeinput-wrapper--required': required,
        'textcodeinput-wrapper--has-editor': editorConfig && showEditorButton
      }
    ]"
    :data-testid="$props['data-testid']"
  >
    <FloatLabel v-if="label">
      <InputText
        ref="primevueRef"
        :id="inputId"
        v-model="internalValue"
        :type="inputType"
        :placeholder="placeholder"
        :disabled="disabled"
        :invalid="invalid"
        :class="[
          textCodeInputVariantClasses[variant],
          textCodeInputSizeClasses[size],
          'textcodeinput-wrapper__input'
        ]"
        @focus="handleFocus"
        @blur="handleBlur"
        @keydown="handleKeydown"
        @keyup="handleKeyup"
      />
      <label :for="inputId">
        {{ label }}
        <span v-if="required" class="textcodeinput-wrapper__required">*</span>
      </label>
    </FloatLabel>
    
    <InputText
      v-else
      ref="primevueRef"
      :id="inputId"
      v-model="internalValue"
      :type="inputType"
      :placeholder="placeholder"
      :disabled="disabled"
      :invalid="invalid"
      :class="[
        textCodeInputVariantClasses[variant],
        textCodeInputSizeClasses[size],
        'textcodeinput-wrapper__input'
      ]"
      @focus="handleFocus"
      @blur="handleBlur"
      @keydown="handleKeydown"
      @keyup="handleKeyup"
    />
    
    <!-- Code Editor Button -->
    <Button
      v-if="editorConfig && showEditorButton && !showEditor"
      icon="pi pi-code"
      severity="secondary"
      text
      rounded
      size="small"
      class="textcodeinput-wrapper__editor-btn"
      :disabled="disabled"
      @click="openEditor"
      :aria-label="`Open code editor for ${label || 'input'}`"
      v-tooltip="'Open Code Editor'"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { generateId } from '../utils/component'
import FloatLabel from 'primevue/floatlabel'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import { Modal } from '../Modal'
import { MonacoEditor } from '../MonacoEditor'

import type { 
  TextCodeInputWrapperProps, 
  TextCodeInputWrapperEmits, 
  TextCodeInputWrapperExposed 
} from './TextCodeInput.types'
import { 
  defaultTextCodeInputProps, 
  textCodeInputVariantClasses, 
  textCodeInputSizeClasses 
} from './TextCodeInput.config'

// Props with defaults
const props = withDefaults(
  defineProps<TextCodeInputWrapperProps>(),
  defaultTextCodeInputProps
)

// Emits
const emit = defineEmits<TextCodeInputWrapperEmits>()

// Template refs
const primevueRef = ref()

// Internal state
const showEditor = ref(false)
const inputId = generateId('textcodeinput')

// Computed properties
const internalValue = computed({
  get: () => props.modelValue?.toString() || '',
  set: (value: string) => {
    const convertedValue = props.type === 'number' ? Number(value) || 0 : value
    emit('update:modelValue', convertedValue)
  }
})

const inputType = computed(() => {
  // For PrimeVue InputText, we need to handle number type specially
  return props.type === 'number' ? 'text' : props.type
})

const editorModalTitle = computed(() => {
  return `Code Editor${props.label ? ` - ${props.label}` : ''}`
})

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

const handleEditorModalClose = (visible: boolean) => {
  if (!visible) {
    closeEditor()
  }
}

// Editor methods
const openEditor = () => {
  if (!props.editorConfig) return
  showEditor.value = true
  emit('editor-opened')
}

const closeEditor = () => {
  showEditor.value = false
  emit('editor-closed')
}

const toggleEditor = () => {
  if (showEditor.value) {
    closeEditor()
  } else {
    openEditor()
  }
}

// Input methods
const focus = async () => {
  await nextTick()
  primevueRef.value?.$el?.focus()
}

const blur = async () => {
  await nextTick()
  primevueRef.value?.$el?.blur()
}

const select = async () => {
  await nextTick()
  primevueRef.value?.$el?.select()
}

// Expose methods and refs
defineExpose<TextCodeInputWrapperExposed>({
  primevueRef,
  focus,
  blur,
  select,
  openEditor,
  closeEditor,
  toggleEditor
})
</script>

<style scoped>
.textcodeinput-wrapper {
  position: relative;
  width: 100%;
}

.textcodeinput-wrapper--disabled {
  opacity: 0.6;
  pointer-events: none;
}

.textcodeinput-wrapper__input {
  width: 100%;
}

.textcodeinput-wrapper--has-editor .textcodeinput-wrapper__input {
  padding-right: 2.5rem; /* Space for editor button */
}

.textcodeinput-wrapper__editor-btn {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
}

.textcodeinput-wrapper__required {
  color: var(--p-red-500);
  margin-left: 2px;
}

/* Focus states */
.textcodeinput-wrapper:focus-within .textcodeinput-wrapper__editor-btn {
  color: var(--p-primary-color);
}

/* Invalid state styling */
.textcodeinput-wrapper--invalid .textcodeinput-wrapper__input {
  border-color: var(--p-red-500);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .textcodeinput-wrapper__editor-btn {
    right: 0.25rem;
  }
  
  .textcodeinput-wrapper--has-editor .textcodeinput-wrapper__input {
    padding-right: 2rem;
  }
}

/* Ensure proper layering with FloatLabel */
.textcodeinput-wrapper :deep(.p-float-label) {
  position: relative;
}

.textcodeinput-wrapper :deep(.p-float-label label) {
  pointer-events: none;
}

/* Handle different input variants */
.textcodeinput-wrapper--has-editor :deep(.p-inputtext-filled) {
  padding-right: 2.5rem;
}

.textcodeinput-wrapper--has-editor :deep(.p-inputtext-outlined) {
  padding-right: 2.5rem;
}
</style>