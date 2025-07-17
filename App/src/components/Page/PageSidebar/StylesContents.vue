<template>
  <div class="styles-sidebar">
    <div class="style-section">
      <div class="section-indicator" :style="sectionIndicatorStyle"></div>
      <div class="section" v-for="section in sections" :key="section.id" :data-tooltip="section.name"
        @click="handleSetActiveStyleSection && handleSetActiveStyleSection(section.id)">
        <img :src="section.icon" :alt="section.name" class="section-icon" />
      </div>
    </div>
    <div class="style-list">
      <div v-for="group in sectionGroupsValue" :key="group" class="style-group">
        <div class="style-group-label">{{ group }}</div>
        <div class="style-item" v-for="property in getGroupPropertiesValue(group)" :key="property.name">
          <label>{{ property.label }}</label>
          <input v-if="property.control === 'text'" type="text" v-model="property.value" />
          <input v-if="property.control === 'color'" type="color" v-model="property.value" />
          <select v-if="property.control === 'select'" v-model="property.value">
            <option v-for="option in property.options" :key="option" :value="option">{{ option }}</option>
          </select>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { SECTIONS } from './StylesContents.constants';
import { useStylesContents } from './StylesContents.hooks'
import { usePagesStore } from '@/views/Pages/Pages.hooks'

const { activeStyleSection } = useStylesContents()
const { selectedItem, styles } = usePagesStore()

const sections = SECTIONS;



function handleSetActiveStyleSection(id: number) {
  activeStyleSection.value = id;
}

interface PropertyMeta {
  name: string;
  label: string;
  group: string;
  section: number;
  control: string;
  value: any;
  options?: string[];
}

const sectionIndicatorStyle = computed(() => {
  return {
    top: `${(activeStyleSection.value - 1) * 48}px`
  };
});

const filteredProperties = computed(() => {
  return styles.value[selectedItem.value].filter(property => property.section === activeStyleSection.value);
});
const sectionGroupsValue = computed(() => {
  return [...new Set(filteredProperties.value.map(property => property.group))];
})

function getGroupPropertiesValue(group: string): PropertyMeta[] {
  return filteredProperties.value.filter(property => property.group === group);
}
</script>

<style scoped>
.styles-sidebar {
  position: relative;
  display: grid;
  grid-template-columns: 30px auto;
  height: 100%;
}

.style-section {
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

.style-section .section {
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

.style-section .section[data-tooltip]:hover::before {
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
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.style-section .section img {
  width: 18px;
}

.style-section .section:hover {
  background-color: var(--green-5);
}

.style-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 10px;
  overflow: auto;
}

.style-item {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  flex-direction: column;
  border-radius: 8px;
}

.style-item input,
.style-item select {
  border: none;
  border-radius: 20px;
  height: 25px;
  padding: 0 10px;
  width: 100%;
}

.style-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.style-group-label {
  font-weight: bold;
  font-size: 14px;
  color: var(--grey-8);
}

</style>