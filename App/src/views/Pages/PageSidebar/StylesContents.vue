<template>
  <div class="styles-sidebar">
    <div class="style-section">
      <div class="section-indicator" :style="sectionIndicatorStyle"></div>
      <div class="section" v-for="(section, index) in validTabs" :key="index"
        :data-tooltip="section" @click="handleSetActiveStyleSection && handleSetActiveStyleSection(index)">
        <span class="material-symbols-outlined">{{ TabIconMapping[section] }}</span>
      </div>
    </div>
    <div class="style-list">
      <div v-for="group in sectionGroupsValue" :key="group" class="style-group">
        <div class="style-group-label">{{ group }}</div>
        <template v-for="property in getGroupPropertiesValue(group)" :key="property.name">
          <div class="style-item"
            v-if="isPropertyVisible(property)"
            :data-tooltip="property.description || ''">
            <label>{{ property.label }}</label>
            <input class="input" v-if="property.control === DataTypes.TEXT" type="text" v-model="property.value"
              :placeholder="property.placeholder || ''" />
            <input class="input" v-if="property.control === DataTypes.COLOR" type="color" v-model="property.value"
              :placeholder="property.placeholder || ''" />
            <select class="input" v-if="property.control === DataTypes.SELECT" v-model="property.value"
              :placeholder="property.placeholder || ''">
              <option v-for="option in property.options" :key="option" :value="option">{{ option }}</option>
            </select>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { usePagesStore } from '@/views/Pages/Pages.hooks'
import { DataTypes, ComponentProperty } from '../Tools/Tools.types'
import { TabIconMapping } from '../Tools/Tools.constants'

const { selectedItem, styles } = usePagesStore()
const activeStyleSection = ref(0);

function handleSetActiveStyleSection(index: number) {
  activeStyleSection.value = index;
}

const sectionIndicatorStyle = computed(() => {
  return {
    top: `${(activeStyleSection.value) * 48}px`
  };
});

const validTabs = computed(() => {
  return [...new Set(styles.value[selectedItem.value].map(m => m.tab))]
});
const filteredProperties = computed(() => {
  return styles.value[selectedItem.value].filter(property => property.tab === validTabs.value[activeStyleSection.value] || '');
});
const sectionGroupsValue = computed(() => {
  return [...new Set(filteredProperties.value.map(property => property.group))];
})
function getGroupPropertiesValue(group: string): ComponentProperty[] {
  return filteredProperties.value.filter(property => property.group === group);
}

function isPropertyVisible(property: ComponentProperty): boolean {
  if (!property.dependency) {
    return true;
  }
  const dependentProperty = styles.value[selectedItem.value].find(p => p.name === property?.dependency?.name);
  return dependentProperty ? property.dependency.regexExp.test(dependentProperty.value.toString()) : false
}

watch(selectedItem, (newSelectedItem) => {
  if (activeStyleSection.value >= [...new Set(styles.value[newSelectedItem].map(m => m.tab))].length) {
    activeStyleSection.value = 0
  }
}, { immediate: true });
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
  height: fit-content;
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

.style-item[data-tooltip]:hover::before {
  content: attr(data-tooltip);
  position: absolute;
  background: #222;
  transform: translateY(130%) translateX(180px);
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
</style>