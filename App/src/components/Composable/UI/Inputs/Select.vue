<template>
  <div class="select-input-wrapper" @click="toggleDropdown">
    <div class="content" :class="{ open: isOpen }">
      <span>{{ selectedLabel }}</span>
      <span class="arrow">▼</span>
    </div>
    <div v-if="isOpen" class="dropdown-list" ref="wrapper">
      <div
        v-for="option in options"
        :key="option.value"
        class="dropdown-option"
        @click.stop="selectOption(option)"
      >
        <component
          v-if="option.customComponent"
          :is="option.customComponent"
          v-bind="option"
        />
        <span v-else>{{ option.label }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { SelectOption } from './Inputs'
import { onClickOutside } from '@vueuse/core'

const value = defineModel()
const props = defineProps({
  isRunning: {
    type: Boolean,
    default: false
  },
  options: {
    type: Array<SelectOption>,
    default: () => []
  }
})
const isOpen = ref(false)
const selectedLabel = computed(() => {
  const found = props.options.find(opt => opt.value === value.value)
  return found ? found.label : 'Select...'
})
function toggleDropdown() {
  if (!props.isRunning) isOpen.value = !isOpen.value
}
function selectOption(option: any) {
  value.value = option.value
  isOpen.value = false
}
const wrapper = ref(null)
onClickOutside(wrapper, () => { isOpen.value = false })
</script>

<style scoped>
.select-input-wrapper {
  position: relative;
  width: 100%;
}
.content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}
.select-input {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  height: 30px;
  width: 100%;
  padding: 5px 15px;
  border-radius: 50px;
  border: 1px solid var(--grey-4);
  background-color: var(--white);
  font-size: 14px;
  color: var(--black);
  cursor: pointer;
  transition: box-shadow 0.3s ease;
}
.select-input.open {
  box-shadow: 0 0 5px var(--primary-color);
}
.arrow {
  margin-left: 8px;
}
.dropdown-list {
  position: absolute;
  top: 110%;
  left: 0;
  width: 100%;
  background: var(--white);
  border: 1px solid var(--grey-4);
  border-radius: 10px;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  max-height: 250px;
  overflow-y: auto;
  background: var(--white-1);
}
.dropdown-option {
  padding: 8px 15px;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  align-items: center;
}
.dropdown-option:hover {
  background: var(--primary-color);
  color: var(--white);
}
</style>