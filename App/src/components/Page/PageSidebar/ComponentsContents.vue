<template>
  <div class="components-sidebar">
    <div class="component-section">
        <div class="section-indicator" :style="{ top: `${(activeSection - 1) * 48}px` }"></div>
        <div class="section" v-for="section in SECTIONS" :key="section.id" :data-tooltip="section.name" @click="activeSection = section.id">
            <img :src="section.icon" :alt="section.name" class="section-icon" />
        </div>
    </div>
    <div class="component-list">
      <div
        v-for="group in sectionGroups"
        :key="group"
        class="component-group"
      >
      <div class="component-group-label">{{ group }}</div>
      <div
        class="component-item"
        v-for="component in getGroupComponents(group)"
        :key="component.name"
        draggable="true"
        @dragstart="(event) => onDragStart(event, component)"
      >
        <img :src="component.icon" :alt="component.name" class="component-icon" />
        <span>{{ component.label }}</span>
      </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { SECTIONS, COMPONENTS } from './ComponentsContents.constants';
import { useComponentsContents } from './ComponentsContents.hooks'

const { activeSection } = useComponentsContents()

interface ComponentMeta {
  name: string;
  icon: string;
  label: string;
  group: string;
  section: number;
  description?: string;
}

const filteredComponents = computed(() => {
  return COMPONENTS.filter(component => component.section === activeSection.value);
});
const sectionGroups = computed(() => {
  return [...new Set(filteredComponents.value.map(component => component.group))];
})

function onDragStart(event: DragEvent, component: ComponentMeta) {
  event.dataTransfer?.setData('text/plain', component.name);
}

function getGroupComponents (group: string): ComponentMeta[] {
  return filteredComponents.value.filter(component => component.group === group);
}
</script>

<style scoped>
.components-sidebar {
    position: relative;
    display: grid;
    grid-template-columns: 30px auto;
    height: 100%;
}
.component-section {
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
.component-section .section {
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
.component-section .section[data-tooltip]:hover::before {
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
.component-section .section img {
    width: 18px;
}
.component-section .section:hover {
    background-color: var(--green-5);
}
.component-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 10px;
  overflow: auto;
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
  margin : 0 10px 0 10px;
  box-shadow: 0px 4px 6px var(--grey-4);
}
.component-item:active {
  cursor: grabbing;
  background: #e0e0e0;
}
.component-icon {
  width: 24px;
  height: 24px;
}
.component-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.component-group-label {
  font-weight: bold;
  font-size: 14px;
  color: var(--grey-8);
  margin-bottom: 0.25rem;
}
.component-item:hover {
  background: var(--grey-4);
}
</style>