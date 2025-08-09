<template>
  <PrimeDialog
    ref="primevueRef"
    :visible="visible"
    :modal="modal"
    :header="title"
    :style="modalStyle"
    :class="modalClass"
    :closable="closable"
    :draggable="draggable"
    :resizable="resizable"
    :closeOnEscape="closeOnEscape"
    :maximizable="maximizable"
    :position="position"
    :minWidth="minWidth"
    :minHeight="minHeight"
    @update:visible="handleVisibilityChange"
    @show="handleShow"
    @hide="handleHide"
    @maximize="handleMaximize"
    @unmaximize="handleUnmaximize"
    @dragend="handleDragEnd"
  >
    <!-- Custom header with caption support -->
    <template v-if="showHeader && (title || caption)" #header>
      <div class="modal-header-content" :style="headerStyle">
        <div class="modal-title">{{ title }}</div>
        <div v-if="caption" class="modal-caption">{{ caption }}</div>
      </div>
    </template>

    <!-- Main content slot -->
    <template #default>
      <div class="modal-content">
        <slot />
      </div>
    </template>

    <!-- Footer with actions -->
    <template v-if="showFooter || showActions || $slots.footer || $slots.actions" #footer>
      <div class="modal-footer">
        <!-- Custom footer slot -->
        <slot name="footer" />
        
        <!-- Action buttons -->
        <div v-if="showActions" class="modal-actions">
          <Button
            v-if="onSave"
            :style="actionButtonStyle"
            @click="handleSave"
            class="modal-action-btn"
          >
            Save
          </Button>
          <Button
            v-if="onOk"
            :style="actionButtonStyle"
            @click="handleOk"
            class="modal-action-btn"
          >
            OK
          </Button>
          
          <!-- Custom actions slot -->
          <slot name="actions" />
        </div>
      </div>
    </template>
  </PrimeDialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import PrimeDialog from 'primevue/dialog'
import Button from '../Buttons/Button.vue'
import type { ModalWrapperProps, ModalWrapperEmits } from './Modal.types'

// Props with defaults
const props = withDefaults(defineProps<ModalWrapperProps>(), {
  modal: true,
  closable: true,
  showHeader: true,
  showFooter: false,
  showActions: false,
  position: 'center',
  draggable: false,
  resizable: false,
  closeOnEscape: true,
  maximizable: false,
  width: '60%',
  height: '90%',
  minWidth: '300px',
  minHeight: '100px',
  fontcolor: 'var(--grey-2)',
  bgcolor: 'var(--grey-3)'
})

// Emits
const emit = defineEmits<ModalWrapperEmits>()

// Template refs
const primevueRef = ref<InstanceType<typeof PrimeDialog>>()

// Computed styles
const modalStyle = computed(() => {
  const styles: Record<string, string> = {}
  
  if (props.width) {
    styles.width = props.width
  }
  
  if (props.height) {
    styles.height = props.height
  }
  
  if (props.style) {
    if (typeof props.style === 'string') {
      return `${props.style}; ${Object.entries(styles).map(([k, v]) => `${k}: ${v}`).join('; ')}`
    } else {
      return { ...props.style, ...styles }
    }
  }
  
  return styles
})

const modalClass = computed(() => {
  const classes = ['modal-wrapper']
  
  if (props.class) {
    if (typeof props.class === 'string') {
      classes.push(props.class)
    } else if (Array.isArray(props.class)) {
      classes.push(...props.class.filter(c => typeof c === 'string') as string[])
    }
  }
  
  return classes
})

// Header styling for backward compatibility
const headerStyle = computed(() => {
  return {
    color: props.fontcolor,
    backgroundColor: props.bgcolor
  }
})

// Action button styling for backward compatibility
const actionButtonStyle = computed(() => {
  return {
    color: props.fontcolor,
    background: props.bgcolor,
    border: `1px solid ${props.fontcolor}`
  }
})

// Computed properties
const showActions = computed(() => {
  return props.showActions || props.onSave || props.onOk
})

// Event handlers
const handleVisibilityChange = (visible: boolean) => {
  emit('update:visible', visible)
}

const handleShow = () => {
  emit('show')
}

const handleHide = () => {
  emit('hide')
}

const handleSave = (event: MouseEvent) => {
  emit('save', event)
  if (props.onSave) {
    props.onSave(event)
  }
}

const handleOk = (event: MouseEvent) => {
  emit('ok', event)
  if (props.onOk) {
    props.onOk(event)
  }
}

const handleMaximize = () => {
  emit('maximize')
}

const handleUnmaximize = () => {
  emit('unmaximize')
}

const handleDragEnd = (event: DragEvent) => {
  emit('dragend', event)
}

// Expose useful properties for parent components
defineExpose({
  primevueRef,
  focus: () => {
    if (primevueRef.value) {
      const el = (primevueRef.value as any).$el as HTMLElement
      el?.focus()
    }
  },
  blur: () => {
    if (primevueRef.value) {
      const el = (primevueRef.value as any).$el as HTMLElement
      el?.blur()
    }
  },
  maximize: () => {
    if (primevueRef.value && (primevueRef.value as any).maximize) {
      (primevueRef.value as any).maximize()
    }
  },
  minimize: () => {
    if (primevueRef.value && (primevueRef.value as any).minimize) {
      (primevueRef.value as any).minimize()
    }
  }
})
</script>

<style scoped>
.modal-wrapper {
  /* Custom modal wrapper styles */
}

.modal-header-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.5rem 0;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.2;
}

.modal-caption {
  font-size: 0.75rem;
  font-weight: 400;
  opacity: 0.7;
}

.modal-content {
  padding: 0.5rem 0;
  overflow: auto;
  flex: 1;
}

.modal-footer {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.modal-actions {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem 0;
}

.modal-action-btn {
  min-width: 80px;
  border-radius: 50px;
}

/* PrimeVue Dialog customizations */
:deep(.p-dialog) {
  border-radius: 10px;
  box-shadow: 4px 4px 8px var(--grey-2);
  backdrop-filter: blur(4px);
}

:deep(.p-dialog-header) {
  border-bottom: 1px solid var(--grey-4);
  padding: 1.25rem;
}

:deep(.p-dialog-content) {
  padding: 0.625rem;
  overflow: auto;
}

:deep(.p-dialog-footer) {
  padding: 1.25rem;
  border-top: 1px solid var(--grey-4);
}

:deep(.p-dialog-mask) {
  background: var(--black-translucent-2);
  backdrop-filter: blur(4px);
}

/* Maintain original modal sizing */
:deep(.p-dialog) {
  min-height: 100px;
  min-width: 300px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  :deep(.p-dialog) {
    width: 95% !important;
    height: 95% !important;
    margin: 0;
  }
}
</style>