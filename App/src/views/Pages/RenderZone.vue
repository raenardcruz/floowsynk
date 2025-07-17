
<template>
  <span
    class="item-wrapper"
    ref="el"
    @contextmenu.prevent="onContextMenu"
  >
    <ItemToolbar
      v-if="showToolbar"
      :style="toolbarStyle"
      @duplicate="handleDuplicate"
      @delete="handleDelete"
    />
    <component :is="component" :style="style" />
  </span>
</template>

<script setup lang="ts">
import { ref, toRefs, reactive } from 'vue'
import ItemToolbar from './ItemToolbar.vue'

const emit = defineEmits(['duplicate', 'delete'])
const props = defineProps<{ component: any; style: Record<string, string>; }>()
const { component, style } = toRefs(props)

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
  /* Let the wrapper size itself to its child */
  border: 2px solid transparent;
  transition: border-color 0.2s;
  position: relative;
}
.item-wrapper:hover {
  border-color: #22c55e; /* Tailwind green-500 */
}
</style>
