<template>
  <ItemToolbar
    v-if="showToolbar"
    ref="target"
    :x="toolbarPosition.x"
    :y="toolbarPosition.y"
    @duplicate="handleDuplicate"
    @delete="handleDelete"
  />
  <component
    :is="component"
    :style="convertStyleArrayToProps(styles[id])"
    class="component"
    :class="{ 'selected-component': selectedItem === id }"
    @click="selectedItem = id; activeTab = 2"
    ref="el"
    @contextmenu.prevent="onContextMenu" />
</template>

<script setup lang="ts">
import { ref, toRefs, useTemplateRef, reactive } from 'vue'
import ItemToolbar from './ItemToolbar.vue'
import { usePagesStore } from '@/views/Pages/Pages.hooks'
import { convertStyleArrayToProps } from './Pages.methods';
import { onClickOutside } from '@vueuse/core'

const emit = defineEmits(['duplicate', 'delete'])
const props = defineProps<{ id: string; component: any; }>()
const { component } = toRefs(props)
const { selectedItem, styles, activeTab } = usePagesStore()

const target = useTemplateRef<HTMLElement>('target')
onClickOutside(target, () => {
  showToolbar.value = false
})

const el = ref<HTMLElement | null>(null)
const showToolbar = ref(false)
const toolbarPosition = reactive({ x: 0, y: 0 })

function onContextMenu(e: MouseEvent) {
  e.preventDefault()
  showToolbar.value = true
  toolbarPosition.x = e.clientX
  toolbarPosition.y = e.clientY
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
  display: flex;
  align-items: stretch;
  justify-content: stretch;
  position: relative;
  border: 2px solid transparent;
  transition: border-color 0.2s;
  height: 100%;
  width: 100%;
}

.item-wrapper:hover {
  border-color: var(--green-3);
}

.selected-component::before {
  content: '';
    position: absolute;
    height: 100%;
    width: 100%;
    border: 2px dashed var(--grey-3);
    z-index: 2;
    transition: box-shadow 0.2s, border-color 0.2s;
    display: flex;
    top: 0px;
    left: 0px;
}
.component:hover::before {
  content: '';
  position: absolute;
  height: 100%;
  width: 100%;
  border: 2px dashed var(--green-3);
  z-index: 2;
  transition: box-shadow 0.2s, border-color 0.2s;
  display: flex;
  top: 0px;
  left: 0px;
}
</style>
