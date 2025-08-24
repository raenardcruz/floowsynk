<template>
  <div class="collapsible-sidebar" :style="sidebarStyle">
    <Transition 
      :name="transitionName" 
      mode="out-in"
    >
      <Sidebar
        v-if="showSideBar"
        :visible="true"
        :position="position"
        :width="width"
        :modal="false"
        :dismissable="false"
        :showCloseButton="showCloseButton"
        :closeOnEscape="closeOnEscape"
        :blockScroll="false"
        :style="customStyle"
        v-bind="$attrs"
      >
        <slot />
      </Sidebar>
    </Transition>
    
    <div 
      v-if="showToggleButton"
      class="toggle-sidebar"
      :style="toggleStyle"
      @click="toggleSidebar"
    >
      <span class="material-symbols-outlined">
        {{ toggleIcon }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CSSProperties } from 'vue'
import Sidebar from './Sidebar.vue'
import type { CollapsibleSidebarProps } from './Sidebar.types'

// Props with defaults for backward compatibility
const props = withDefaults(defineProps<CollapsibleSidebarProps>(), {
  width: '300px',
  position: 'left',
  customStyle: () => ({}),
  closeOnClickOutside: true,
  closeOnEscape: true,
  showToggleButton: true,
  showCloseButton: false,
})

// Model for sidebar visibility
const showSideBar = defineModel({
  type: Boolean,
  default: true
})

// Computed properties
const sidebarStyle = computed((): CSSProperties => {
  return {
    position: 'absolute',
    top: '0',
    [props.position]: '0',
    width: showSideBar.value ? props.width : '0px',
    height: '100%',
    zIndex: 100,
    display: 'flex',
    flexDirection: 'column',
    transition: 'width 0.3s',
    overflow: 'visible',
  } as CSSProperties
})

const toggleStyle = computed((): CSSProperties => {
  return {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    zIndex: 101,
    [props.position]: showSideBar.value ? `calc(${props.width} + 8px)` : '8px',
    transition: 'all 0.3s',
  } as CSSProperties
})

const transitionName = computed(() => {
  return props.position === 'left' ? 'slide' : 'slide-right'
})

const toggleIcon = computed(() => {
  if (showSideBar.value) {
    return props.position === 'left' ? 'keyboard_double_arrow_left' : 'keyboard_double_arrow_right'
  } else {
    return props.position === 'left' ? 'keyboard_double_arrow_right' : 'keyboard_double_arrow_left'
  }
})

// Methods
const toggleSidebar = () => {
  showSideBar.value = !showSideBar.value
}
</script>

<style scoped>
.collapsible-sidebar {
  /* All layout is now handled by :style binding */
  pointer-events: auto;
}

.toggle-sidebar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: #fff;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  cursor: pointer;
  transition: all 0.3s ease;
  pointer-events: auto;
}

.toggle-sidebar:hover {
  background: #f0f0f0;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.18);
}

.toggle-sidebar .material-symbols-outlined {
  font-size: 24px;
  color: #333;
  transition: color 0.3s;
}

.toggle-sidebar:hover .material-symbols-outlined {
  color: #1976d2;
}

/* Animation for Left */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(-400px);
}

.slide-enter-to,
.slide-leave-from {
  transform: translateX(0px);
}

/* Animation for Right */
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.3s ease;
}

.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(calc(100% + 400px));
}

.slide-right-enter-to,
.slide-right-leave-from {
  transform: translateX(0px);
}
</style>