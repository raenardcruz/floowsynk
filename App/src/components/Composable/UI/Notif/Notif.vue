<template>
  <Toast
    ref="primevueRef"
    :id="id"
    :position="position"
    :autoZIndex="autoZIndex"
    :baseZIndex="baseZIndex"
    :breakpoint="breakpoint"
    :class="wrapperClass"
    :style="wrapperStyle"
    :data-testid="dataTestid || 'notif-component'"
  />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import Toast from 'primevue/toast'
import type { NotifWrapperProps, NotifOptions } from './Notif.types'
import { defaultNotifProps, severityMap, positionMap } from './Notif.config'

// Define props with defaults
const props = withDefaults(defineProps<NotifWrapperProps>(), defaultNotifProps)

// Template ref for PrimeVue component
const primevueRef = ref()

// Computed properties for styling
const wrapperClass = computed(() => {
  const classes = ['notif-wrapper']
  if (props.class) {
    if (typeof props.class === 'string') {
      classes.push(props.class)
    } else if (Array.isArray(props.class)) {
      classes.push(...props.class.filter(c => typeof c === 'string'))
    }
  }
  return classes
})

const wrapperStyle = computed(() => {
  const styles: Record<string, any> = {}
  
  if (props.style) {
    if (typeof props.style === 'string') {
      // Parse string styles if needed
      Object.assign(styles, props.style)
    } else {
      Object.assign(styles, props.style)
    }
  }
  
  return styles
})

// Computed props for data-testid
const dataTestid = computed(() => props.dataTestid || 'notif-component')

// Component methods
const add = (options: NotifOptions) => {
  if (!primevueRef.value) return
  
  const toastMessage = {
    severity: severityMap[options.type || 'info'],
    summary: options.message,
    detail: '', // Can be extended if needed
    life: options.duration || 3000,
    closable: options.closable !== false,
    styleClass: options.styleClass,
    contentStyleClass: options.contentStyleClass
  }
  
  primevueRef.value.add(toastMessage)
}

const remove = (message: any) => {
  if (!primevueRef.value) return
  primevueRef.value.remove(message)
}

const removeAll = () => {
  if (!primevueRef.value) return
  primevueRef.value.removeAllGroups()
}

// Expose component methods
defineExpose({
  primevueRef,
  add,
  remove,
  removeAll
})
</script>

<style scoped>
.notif-wrapper {
  /* Additional wrapper styling can be added here */
}

/* Custom styling to match the original notification appearance */
:deep(.p-toast) {
  /* Ensure proper z-index and positioning */
}

:deep(.p-toast-message) {
  /* Custom message styling */
  border-radius: 10px;
  min-width: 100px;
  font-size: 15px;
}

:deep(.p-toast-message-success) {
  background: var(--green-5, #22c55e);
  color: var(--white-1, white);
}

:deep(.p-toast-message-error) {
  background: var(--red-3, #ef4444);
  color: var(--white-1, white);
}

:deep(.p-toast-message-info) {
  background: var(--blue-3, #3b82f6);
  color: var(--white-1, white);
}

:deep(.p-toast-message-warn) {
  background: var(--orange-2, #f97316);
  color: var(--white-1, white);
}

/* Animation styles to match original */
:deep(.p-toast-message-enter-from) {
  opacity: 0;
  transform: translateY(20px);
}

:deep(.p-toast-message-enter-active) {
  transition: all 0.3s ease;
}

:deep(.p-toast-message-enter-to) {
  opacity: 1;
  transform: translateY(0);
}

:deep(.p-toast-message-leave-from) {
  opacity: 1;
  transform: translateY(0);
}

:deep(.p-toast-message-leave-active) {
  transition: all 0.3s ease;
}

:deep(.p-toast-message-leave-to) {
  opacity: 0;
  transform: translateY(20px);
}
</style>