<template>
    <div :style="style" :class="{ 'dragover': isDragOver }" @dragover.prevent.stop="onDragOver" @dragleave.prevent.stop="onDragLeave" @drop.prevent.stop="onDrop">
        <RenderZone
          v-for="(item) in droppedItems.filter(i => i.parent === id)"
          :key="item.id"
          :id="item.id"
          :component="item.component"
        />
    </div>
</template>

<script setup lang="ts">
import { toRefs, ref } from 'vue'
import RenderZone from '@/views/Pages/RenderZone.vue';
import { usePagesStore } from '@/views/Pages/Pages.hooks';
import { COMPONENTS } from '@/components/Page/PageSidebar/ComponentsContents.constants';
import { getComponentStyles } from '@/views/Pages/Pages.methods';

const props = defineProps<{ id: string, style: Record<string, string> }>()
const { style } = toRefs(props)
const isDragOver = ref(false)
const { droppedItems, selectedItem, styles, activeTab } = usePagesStore()

function onDragOver(_: DragEvent) {
  isDragOver.value = true;
}

function onDragLeave(_: DragEvent) {
  isDragOver.value = false;
}

function onDrop(event: DragEvent) {
  isDragOver.value = false;
  const newComponentId = crypto.randomUUID();
  isDragOver.value = false;
  const componentName = event.dataTransfer?.getData('text/plain');
  if (componentName) {
    const component = COMPONENTS.find(c => c.name === componentName);
    selectedItem.value = newComponentId;
    const baseStyle = getComponentStyles(componentName);
    const clonedStyleArray = (Array.isArray(baseStyle) ? baseStyle : [baseStyle]).map(style => ({ ...style }));
    styles.value[newComponentId] = clonedStyleArray;
    droppedItems.value.push({
      id: newComponentId,
      name: componentName,
      component: component?.component,
      parent: props.id,
    });
    activeTab.value = 2;
  }
}
</script>