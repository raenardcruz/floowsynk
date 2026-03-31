<template>
  <BlockUI pt:mask:class="selected-component" :blocked="selectedItem === id" @click="clickHandler">
    <component :id="id" :is="component" class="components" :class="{ 'hovering': isHovering }"
      @mouseenter.stop="onMouseEnter" @mouseleave.stop="onMouseLeave" @click.stop="selectedItem = id; activeTab = 2"
      ref="el" @contextmenu.prevent="onContextMenu" />
  </BlockUI>
  <Popover ref="op" v-if="filteredProperties.length > 0">
    <div class="properties__header">
      <span class="material-symbols-outlined">
        instant_mix
      </span>
      <div class="properties__label">Properties</div>
      <div class="properties__caption">{{ component.__name }}</div>
    </div>
    <Divider />
    <Properties />
  </Popover>
</template>

<script setup lang="ts">
import { ref, toRefs, useTemplateRef, reactive, computed } from 'vue'
import { usePagesStore } from '@/views/Pages/Pages.hooks'
import { onClickOutside } from '@vueuse/core'
import BlockUI from 'primevue/blockui'
import Popover from 'primevue/popover'
import Properties from './Properties.vue'
import Divider from 'primevue/divider'


const op = ref()
const emit = defineEmits(['duplicate', 'delete'])
const props = defineProps<{ id: string; component: any }>()
const { component } = toRefs(props)
const { selectedItem, activeTab, properties } = usePagesStore()

const target = useTemplateRef<HTMLElement>('target')
onClickOutside(target, () => {
  showToolbar.value = false
})

const el = ref<HTMLElement | null>(null)
const showToolbar = ref(false)
const toolbarPosition = reactive({ x: 0, y: 0 })
const isHovering = ref(false)

function onMouseEnter() {
  isHovering.value = true
}

function onMouseLeave() {
  isHovering.value = false
}

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

function clickHandler(event: any) {
  op.value.toggle(event)
}

onClickOutside(op, () => {
  op.value.Hide()
})

const filteredProperties = computed(() => {
  return properties.value[selectedItem.value] || [];
});
</script>

<style scoped>
.components {
  z-index: 100;
}

:deep(.selected-component) {
  background: none !important;
  z-index: -1;
  &::before {
    content: '';
    position: absolute;
    display: flex;
    border: 2px dashed var(--grey-3);
    width: 100%;
    height: 100%;
  }
}

.hovering::before {
  content: '';
  position: absolute;
  height: 100%;
  width: 100%;
  border: 2px dashed var(--blue-3);
  z-index: 2;
  transition: box-shadow 0.2s, border-color 0.2s;
  display: flex;
  top: 0px;
  left: 0px;
}

.properties {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.properties__header {
  display: flex;
  gap: 8px;
  justify-content: flex-start;
  align-items: center;
}

.properties__label {
  font-size: 14px;
  font-weight: bold;
  color: var(--grey-2);
}

.properties__caption {
  font-size: 12px;
  font-weight: 400;
  color: var(--grey-3);
}
</style>
