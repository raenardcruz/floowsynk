<template>
  <div class="components-sidebar">
    <div class="component-groups">
        <div class="section-indicator" :style="{ top: `${(activeSection - 1) * 48}px` }"></div>
        <div class="group" v-for="section in SECTIONS" :key="section.id" :data-tooltip="section.name" @click="activeSection = section.id">
            <img :src="section.icon" :alt="section.name" class="section-icon" />
        </div>
    </div>
    <div class="component-list">
      <div
        v-for="component in COMPONENTS"
        :key="component.type"
        class="component-item"
        draggable="true"
        @dragstart="(event) => onDragStart(event, component)"
      >
      <img :src="component.icon" :alt="component.name" class="component-icon" />
        <span>{{ component.label }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { SECTIONS, COMPONENTS } from './ComponentsContents.constants';
import { useComponentsContents } from './ComponentsContents.hooks'

const { activeSection } = useComponentsContents()

interface ComponentMeta {
  name: string;
  type: string;
  icon: string;
  label: string;
}

function onDragStart(event: DragEvent, component: ComponentMeta) {
  event.dataTransfer?.setData('application/json', JSON.stringify(component));
}
</script>

<style scoped>
.components-sidebar {
    position: relative;
    display: grid;
    grid-template-columns: 30px auto;
    height: 100%;
}
.component-groups {
    display: flex;
    flex-direction: column;
    box-shadow: 0 2px 8px var(--grey-3);
    justify-content: flex-start;
    align-items: center;
}
.section-indicator {
    position: absolute;
    left: 26px;
    width: 4px;
    height: 48px;
    background-color: var(--green-2);
    z-index: 100;
    transition: all 0.3s ease;
}
.component-groups .group {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 24px;
    width: 100%;
    height: 48px;
    cursor: pointer;
    transition: all 0.3s ease;
}
.component-groups .group[data-tooltip]:hover::before {
    content: attr(data-tooltip);
    position: absolute;
    left: 110%;
    top: 50%;
    transform: translateY(-50%);
    background: #222;
    color: #fff;
    padding: 4px 10px;
    border-radius: 4px;
    white-space: nowrap;
    font-size: 13px;
    z-index: 10;
    pointer-events: none;
    opacity: 1;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}
.component-groups .group img {
    width: 18px;
}
.component-groups .group:hover {
    background-color: var(--green-5);
}
.component-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 10px;
}
.component-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  background: #f7f7f7;
  cursor: grab;
  transition: background 0.2s;
}
.component-item:active {
  cursor: grabbing;
  background: #e0e0e0;
}
.component-icon {
  width: 24px;
  height: 24px;
}
</style>