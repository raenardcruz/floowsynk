<template>
  <div class="page-container">
    <Subheader />
    <div class="page-contents">
      <PageSidebar style="position: relative;" />
      <div ref="dropZoneRef" class="canvas-container" :class="{ 'dragover': isDragOver }" @dragover.prevent="onDragOver" @dragleave="onDragLeave" @drop="onDrop">
        <RenderZone
          v-for="item in droppedItems"
          :key="item.id"
          :id="item.id"
          :component="item.component"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Subheader from '@/components/Page/SubHeader.vue';
import PageSidebar from '@/components/Page/PageSidebar.vue';
import { usePagesStore } from './Pages.hooks';
import { getComponentStyles } from './Pages.methods';


import RenderZone from './RenderZone.vue';
import { COMPONENTS } from '@/components/Page/PageSidebar/ComponentsContents.constants';

const dropZoneRef = ref<HTMLElement | null>(null);
const isDragOver = ref(false);
const { droppedItems, styles, selectedItem, activeTab } = usePagesStore();

function onDragOver(_: DragEvent) {
  isDragOver.value = true;
}

function onDragLeave(_: DragEvent) {
  isDragOver.value = false;
}

function onDrop(event: DragEvent) {
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
      component: component?.component
    });
    activeTab.value = 2;
  }
}
</script>

<style scoped>
.page-container {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%; 
  overflow: hidden;
}
.page-contents {
  position: relative;
  display: flex;
  flex-direction: row;
  height: 100%;
  width: 100%;
  overflow: hidden;
}
.canvas-container {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  border: 2px dashed #ccc;
  padding: 1rem;
  overflow-y: auto;
  position: relative;
  margin: 20px;
  width: 100%;
  transition: border-color 0.2s;
}
.canvas-container.dragover {
  border-color: #42b983;
}
</style>
