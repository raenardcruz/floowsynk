<template>
    <div :style="style" :class="{ 'dragover': isDragOver }" @dragover.prevent.stop="onDragOver" @dragleave.prevent.stop="onDragLeave">
        <!-- <RenderZone
          v-for="item in droppedItems"
          :key="item.id"
          :id="item.id"
          :component="item.component"
        /> -->
    </div>
</template>

<script setup lang="ts">
import { toRefs, ref } from 'vue'
import RenderZone from './RenderZone.vue';

const props = defineProps<{ style: Record<string, string> }>()
const { style } = toRefs(props)
const isDragOver = ref(false)

function onDragOver(_: DragEvent) {
  isDragOver.value = true;
}

function onDragLeave(_: DragEvent) {
  isDragOver.value = false;
}
</script>