<template>
  <Accordion 
    :value="modelValue ? [0] : []"
    @update:value="handleAccordionChange"
    class="collapsible-wrapper"
  >
    <AccordionPanel :value="0">
      <AccordionHeader class="collapsible-header">
        <span class="collapsible-title">{{ title }}</span>
      </AccordionHeader>
      <AccordionContent class="collapsible-content">
        <div v-if="caption" class="collapsible-caption">{{ caption }}</div>
        <div class="collapsible-slot-content">
          <slot></slot>
        </div>
      </AccordionContent>
    </AccordionPanel>
  </Accordion>
</template>

<script setup lang="ts">
import { Accordion, AccordionPanel, AccordionHeader, AccordionContent } from 'primevue'

interface Props {
  title: string
  caption?: string
}

const modelValue = defineModel<boolean>({
  default: false
})

defineProps<Props>()

const handleAccordionChange = (value: any) => {
  // PrimeVue Accordion emits different values based on configuration
  // For single mode, it might emit a number or array
  if (Array.isArray(value)) {
    modelValue.value = value.includes(0)
  } else {
    modelValue.value = value === 0
  }
}
</script>

<style scoped>
.collapsible-wrapper {
  width: 100%;
}

.collapsible-header {
  padding: 10px 14px;
}

.collapsible-title {
  font-size: 18px;
  font-weight: bold;
  color: var(--primary-color);
}

.collapsible-content {
  padding: 0;
}

.collapsible-caption {
  font-size: 14px;
  color: var(--grey-2);
  padding: 0 12px 8px 12px;
}

.collapsible-slot-content {
  max-height: 300px;
  overflow-y: hidden;
}

/* Override PrimeVue styles to match original appearance */
:deep(.p-accordion-header-link) {
  padding: 0;
  border: none;
  background: transparent;
}

:deep(.p-accordion-content) {
  padding: 0;
  border: none;
}

:deep(.p-accordion-panel) {
  border: none;
  box-shadow: none;
}
</style>