
<template>
  <span
    class="item-wrapper"
    :class="{ 'selected-component': selectedItem === id }"
    @click="selectedItem = id; activeTab = 2"
    ref="el"
    @contextmenu.prevent="onContextMenu"
  >
    <ItemToolbar
      v-if="showToolbar"
      :style="toolbarStyle"
      @duplicate="handleDuplicate"
      @delete="handleDelete"
    />
    <component :is="component" :style="convertStyleArrayToProps(styles[id])" />
  </span>
</template>

<script setup lang="ts">
import { ref, toRefs, reactive } from 'vue'
import ItemToolbar from './ItemToolbar.vue'
import { usePagesStore } from '@/views/Pages/Pages.hooks'
import { convertStyleArrayToProps } from './Pages.methods';

const emit = defineEmits(['duplicate', 'delete'])
const props = defineProps<{ id:string; component: any; }>()
const { component } = toRefs(props)
const { selectedItem, styles, activeTab } = usePagesStore()

const el = ref<HTMLElement | null>(null)
const showToolbar = ref(false)
const toolbarStyle = reactive<Record<string, string>>({})

function onContextMenu(e: MouseEvent) {
  e.preventDefault()
  showToolbar.value = true
  // Position toolbar at mouse location, relative to wrapper
  const wrapper = el.value
  if (wrapper) {
    const rect = wrapper.getBoundingClientRect()
    // Calculate position relative to wrapper
    const left = e.clientX - rect.left
    const top = e.clientY - rect.top
    toolbarStyle.left = left + 'px'
    toolbarStyle.top = top + 'px'
    toolbarStyle.position = 'absolute'
    toolbarStyle.zIndex = '100'
  }
  // Hide toolbar on next click outside
  document.addEventListener('click', hideToolbar, { once: true })
}

function hideToolbar() {
  showToolbar.value = false
}

function handleDuplicate() {
  emit('duplicate')
  hideToolbar()
}
function handleDelete() {
  emit('delete')
  hideToolbar()
}
</script>

<style scoped>
.item-wrapper {
  display: inline-block;
  border: 2px solid transparent;
  transition: border-color 0.2s;
  position: relative;
}
.item-wrapper:hover {
  border-color: var(--green-3);
}
.selected-component {
  border: 1px dashed var(--grey-3);
  z-index: 2;
  position: relative;
  transition: box-shadow 0.2s, border-color 0.2s;
}
</style>
