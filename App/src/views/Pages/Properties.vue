<template>
  <div class="properties">
    <div class="properties__list">
      <Accordion :value="Array.from({ length: sectionGroups.length }, (_, i) => i)" multiple>
        <AccordionPanel v-for="(group, index) in sectionGroups" :key="index" :value="index">
          <AccordionHeader pt:root:class="properties__header">{{ group }}</AccordionHeader>
          <AccordionContent>
            <div class="properties__items" v-for="property in getGroupProperties(group)" :key="property.name">
              <div class="properties__item" v-if="isPropertyVisible(property)"
                :data-tooltip="property.description || ''">
                <TextInput :label="property.label" v-if="property.control === DataTypes.TEXT" v-model="property.value"
                  :placeholder="property.placeholder || ''" />
                <input class="input" v-if="property.control === DataTypes.COLOR" type="color" v-model="property.value"
                  :placeholder="property.placeholder || ''" />
                <select class="input" v-if="property.control === DataTypes.SELECT" v-model="property.value"
                  :placeholder="property.placeholder || ''">
                  <option v-for="option in property.options" :key="option" :value="option">{{ option }}</option>
                </select>
              </div>
            </div>
          </AccordionContent>
        </AccordionPanel>
      </Accordion>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePagesStore } from '@/views/Pages/Pages.hooks'
import { DataTypes } from './Tools/Tools.types'
import TextInput from '@/components/Composable/UI/Inputs/TextInput.vue'
import Accordion from 'primevue/accordion'
import AccordionPanel from 'primevue/accordionpanel'
import AccordionHeader from 'primevue/accordionheader'
import AccordionContent from 'primevue/accordioncontent'

const { selectedItem, properties } = usePagesStore()

interface PropertyMeta {
  name: string;
  label: string;
  group: string;
  section: number;
  control: string;
  value: any;
  options?: string[];
  placeholder?: string;
  description?: string;
  dependency?: {
    property: string;
    values: string[];
  };
}

const filteredProperties = computed(() => {
  return properties.value[selectedItem.value] || [];
});

const sectionGroups = computed(() => {
  return [...new Set(filteredProperties.value.map(property => property.group))];
})
function getGroupProperties(group: string): PropertyMeta[] {
  return filteredProperties.value.filter(property => property.group === group);
}

function isPropertyVisible(property: PropertyMeta) {
  if (!property.dependency) {
    return true;
  }
  const dependentProperty = properties.value[selectedItem.value].find(p => p.name === property?.dependency?.property);
  return dependentProperty && property.dependency.values.includes(dependentProperty.value);
}
</script>

<style scoped>
.properties {
  position: relative;
  height: 100%;
}

.properties__list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 10px;
  max-height: 500px;
  overflow: auto;
}

.properties__item {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  flex-direction: column;
  border-radius: 8px;
}

.properties__item input,
.properties__item select {
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

.properties__label {
  font-weight: bold;
  font-size: 12px;
  color: var(--grey-8);
}

.properties__items {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
}

.properties__item[data-tooltip]:hover::before {
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
.properties__header {
  padding: 0 8px;
}
</style>