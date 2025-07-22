<template>
    <div :style="componentStyle" :class="{ 'dragover': isDragOver }" @dragover.prevent.stop="onDragOver" @dragleave.prevent.stop="onDragLeave" @drop.prevent.stop="onDrop">
        <RenderZone
          v-for="(item) in droppedItems.filter((i: componentItem) => i.parent === id)"
          :key="item.id"
          :id="item.id"
          :component="item.component"
        />
    </div>
</template>

<script setup lang="ts">
import RenderZone from '@/views/Pages/RenderZone.vue';
import { usePagesStore, usePageComponent, PageComponentProps, componentItem } from '@/views/Pages/Pages.hooks';

const props = defineProps<PageComponentProps>()
const { droppedItems } = usePagesStore()
const {
  componentStyle,
  isDragOver,
  onDragOver,
  onDragLeave,
  onDrop,
} = usePageComponent(props.id)
</script>