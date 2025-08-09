<template>
  <PrimeSidebar
    ref="primevueRef"
    :visible="visible"
    :position="position"
    :header="title"
    :modal="modal"
    :dismissable="dismissable"
    :showCloseButton="showCloseButton"
    :closeOnEscape="closeOnEscape"
    :blockScroll="blockScroll"
    :baseZIndex="baseZIndex"
    :autoZIndex="autoZIndex"
    :appendTo="appendTo"
    :class="sidebarClass"
    :style="sidebarStyle"
    :maskClass="maskClass"
    :transitionOptions="transitionOptions"
    @update:visible="handleVisibilityChange"
    @show="handleShow"
    @hide="handleHide"
  >
    <!-- Custom header with title and caption -->
    <template v-if="showCustomHeader" #header>
      <div class="sidebar-header-content">
        <div v-if="title" class="sidebar-title">{{ title }}</div>
        <div v-if="caption" class="sidebar-caption">{{ caption }}</div>
      </div>
    </template>

    <!-- Main content -->
    <template #default>
      <div class="sidebar-content" :class="contentClass">
        <slot />
      </div>
    </template>

    <!-- Footer slot -->
    <template v-if="$slots.footer" #footer>
      <div class="sidebar-footer">
        <slot name="footer" />
      </div>
    </template>
  </PrimeSidebar>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import PrimeSidebar from 'primevue/sidebar'
import type { SidebarWrapperProps, SidebarWrapperEmits } from './Sidebar.types'

// Props with defaults
const props = withDefaults(defineProps<SidebarWrapperProps>(), {
  position: 'left',
  width: '300px',
  height: '100%',
  modal: true,
  dismissable: true,
  showCloseButton: true,
  closeOnEscape: true,
  blockScroll: true,
  baseZIndex: 0,
  autoZIndex: true,
  transitionOptions: '150ms cubic-bezier(0, 0, 0.2, 1)'
})

// Emits
const emit = defineEmits<SidebarWrapperEmits>()

// Template refs
const primevueRef = ref<InstanceType<typeof PrimeSidebar>>()

// Computed properties
const showCustomHeader = computed(() => {
  return props.title || props.caption
})

const sidebarClass = computed(() => {
  const classes = ['sidebar-wrapper']
  
  if (props.class) {
    if (typeof props.class === 'string') {
      classes.push(props.class)
    } else if (Array.isArray(props.class)) {
      classes.push(...props.class.filter(c => typeof c === 'string') as string[])
    }
  }
  
  if (props.headerClass) {
    classes.push(props.headerClass)
  }
  
  return classes
})

const sidebarStyle = computed(() => {
  const styles: Record<string, string> = {}
  
  // Set width/height based on position
  if (props.position === 'left' || props.position === 'right') {
    if (props.width) {
      styles.width = props.width
    }
  } else if (props.position === 'top' || props.position === 'bottom') {
    if (props.height) {
      styles.height = props.height
    }
  }
  
  // Merge with custom styles
  if (props.style) {
    if (typeof props.style === 'string') {
      return `${props.style}; ${Object.entries(styles).map(([k, v]) => `${k}: ${v}`).join('; ')}`
    } else {
      return { ...props.style, ...styles }
    }
  }
  
  return styles
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
  }
})
</script>

<style scoped>
.sidebar-wrapper {
  /* Custom sidebar wrapper styles */
}

.sidebar-header-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.5rem 0;
}

.sidebar-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--grey-2);
  line-height: 1.2;
}

.sidebar-caption {
  font-size: 0.625rem;
  font-weight: 400;
  color: var(--grey-3);
  line-height: 1.2;
}

.sidebar-content {
  display: flex;
  position: relative;
  gap: 0.75rem;
  padding: 0.625rem;
  overflow-y: auto;
  height: calc(100% - 2.5rem);
  flex-direction: column;
}

.sidebar-footer {
  padding: 1rem;
  border-top: 1px solid var(--grey-4);
}

/* PrimeVue Sidebar customizations */
:deep(.p-sidebar) {
  background: var(--grey-5);
  box-shadow: -1px 7px 10px var(--grey-3);
}

:deep(.p-sidebar-header) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.625rem 1.25rem 0 1.25rem;
  background: var(--white-3);
  border-bottom: 1px solid var(--grey-4);
}

:deep(.p-sidebar-content) {
  padding: 0;
  overflow: hidden;
}

:deep(.p-sidebar-mask) {
  background: var(--black-translucent-2);
  backdrop-filter: blur(4px);
}

/* Position-specific styles */
:deep(.p-sidebar-left) {
  left: 0;
  right: auto;
}

:deep(.p-sidebar-right) {
  left: auto;
  right: 0;
}

:deep(.p-sidebar-top) {
  top: 0;
  bottom: auto;
  width: 100%;
}

:deep(.p-sidebar-bottom) {
  top: auto;
  bottom: 0;
  width: 100%;
}

:deep(.p-sidebar-full) {
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  :deep(.p-sidebar-left),
  :deep(.p-sidebar-right) {
    width: 100% !important;
  }
}

/* Animation improvements */
:deep(.p-sidebar-enter-active),
:deep(.p-sidebar-leave-active) {
  transition: all 0.3s ease;
}

:deep(.p-sidebar-left.p-sidebar-enter-from),
:deep(.p-sidebar-left.p-sidebar-leave-to) {
  transform: translateX(-100%);
}

:deep(.p-sidebar-right.p-sidebar-enter-from),
:deep(.p-sidebar-right.p-sidebar-leave-to) {
  transform: translateX(100%);
}

:deep(.p-sidebar-top.p-sidebar-enter-from),
:deep(.p-sidebar-top.p-sidebar-leave-to) {
  transform: translateY(-100%);
}

:deep(.p-sidebar-bottom.p-sidebar-enter-from),
:deep(.p-sidebar-bottom.p-sidebar-leave-to) {
  transform: translateY(100%);
}
</style>