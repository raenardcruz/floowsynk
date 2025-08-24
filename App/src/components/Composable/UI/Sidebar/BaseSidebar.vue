<template>
  <div 
    class="sidebar" 
    :style="computedStyle"
    :class="positionClass"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { BaseSidebarProps } from './Sidebar.types'

// Props with defaults for backward compatibility
const props = withDefaults(defineProps<BaseSidebarProps>(), {
  width: '300px',
  position: 'left',
  customStyle: () => ({})
})

// Computed styles
const computedStyle = computed(() => {
  return {
    ...props.customStyle,
    width: props.width,
    'min-width': props.width
  }
})

const positionClass = computed(() => {
  return props.position === 'left' ? 'sidebar-left' : 'sidebar-right'
})
</script>

<style scoped>
.sidebar {
  position: absolute;
  display: flex;
  flex-direction: column;
  background: var(--grey-5);
  height: 100%;
  box-shadow: -1px 7px 10px var(--grey-3);
  z-index: 100;
  transition: all 0.3s ease;
  padding: 1.25rem;
}

.sidebar-left {
  left: 0;
  right: auto;
}

.sidebar-right {
  left: auto;
  right: 0;
}
</style>