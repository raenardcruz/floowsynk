<template>
  <Tabs 
    :id="id"
    v-model:value="internalValue"
    :class="mergedClasses"
    :style="mergedStyle"
    :scrollable="scrollable"
    :data-testid="dataTestid"
    pt:root:class="tab-container"
    @tab-click="handleTabClick"
  >
    <TabList pt:activeBar:class="active-bar">
      <Tab 
        v-for="(tab, idx) in tabContents || []" 
        :key="tab.id" 
        :value="tab.id" 
        pt:root:class="tab"
      >
        <div class="tab-label-container">
          <div :style="getLabelStyle(tab)">
            <component :is="tab.icon" v-if="tab.icon" />
            <span v-if="tab.label">{{ tab.label }}</span>
          </div>
          <img 
            v-if="tab.canClose" 
            :src="CloseSvg" 
            alt="Close Icon" 
            class="close-icon" 
            @click.prevent="handleTabClose(tab.id)" 
          />
        </div>
      </Tab>
    </TabList>
    <TabPanels>
      <TabPanel 
        v-for="tab in tabContents || []" 
        :key="tab.id" 
        :value="tab.id"
      >
        <component :is="tab.content" v-if="typeof tab.content === 'object'" />
        <span v-else>{{ tab.content }}</span>
      </TabPanel>
    </TabPanels>
  </Tabs>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue'
import Tabs from 'primevue/tabs'
import TabList from 'primevue/tablist'
import Tab from 'primevue/tab'
import TabPanels from 'primevue/tabpanels'
import TabPanel from 'primevue/tabpanel'
import CloseSvg from '@/components/Icons/basic/close.svg'
import { mergeComponentClasses } from '../migration/utils'
import { defaultTabsProps, tabPositionClasses } from './Tabs.config'
import type { TabsWrapperProps, TabsWrapperEmits, TabContent } from './Tabs.types'

// Define component props
const props = withDefaults(defineProps<TabsWrapperProps>(), defaultTabsProps)

// Define component emits
const emit = defineEmits<TabsWrapperEmits>()

// Internal reactive value for v-model
const internalValue = ref<string | number>(props.modelValue || '')

// Watch for external modelValue changes
watch(() => props.modelValue, (newValue) => {
  if (newValue !== undefined && newValue !== internalValue.value) {
    internalValue.value = newValue
  }
})

// Watch for internal value changes and emit update
watch(internalValue, (newValue) => {
  emit('update:modelValue', newValue)
})

// Initialize with first tab if no initial value
onMounted(() => {
  if (!internalValue.value && props.tabContents && props.tabContents.length > 0) {
    internalValue.value = props.tabContents[0].id
  }
})

// Computed properties
const dataTestid = computed(() => props['data-testid'])

const mergedClasses = computed(() => {
  const positionClass = tabPositionClasses[props.tabPosition || 'top']
  return mergeComponentClasses(props.class, positionClass)
})

const mergedStyle = computed(() => {
  if (typeof props.style === 'string') {
    return props.style
  }
  return {
    borderRadius: '16px',
    overflow: 'auto',
    ...props.style
  }
})

// Methods
const getLabelStyle = (tab: TabContent) => ({
  display: 'flex',
  flexDirection: tab.direction || 'row',
  alignItems: 'center',
  gap: '4px',
  fontSize: tab.direction === 'column' ? '8px' : '16px',
})

const handleTabClose = (id: string) => {
  emit('close', id)
}

const handleTabClick = (event: any) => {
  const tabIndex = props.tabContents?.findIndex(tab => tab.id === event.value) ?? -1
  const tab = props.tabContents?.[tabIndex]
  
  if (tab) {
    emit('tab-click', {
      originalEvent: event.originalEvent,
      index: tabIndex,
      tab
    })
  }
}

// Expose component instance for parent access
const primevueRef = ref()

defineExpose({
  primevueRef,
  focus: () => primevueRef.value?.focus?.(),
  blur: () => primevueRef.value?.blur?.()
})
</script>

<style scoped>
.tab-container {
  border-radius: 16px;
  overflow: auto;
}

.tab {
  transition: all 0.5s ease;
  color: var(--grey-1);
  padding: 8px;
}

.tab-label-container {
  display: flex;
  align-items: flex-start;
  justify-content: space-around;
  gap: 8px;
}

.tab:hover {
  background: var(--grey-4);
}

.close-icon {
  width: 24px;
  height: 24px;
  cursor: pointer;
}

:deep(.active-bar) {
  border: 1px solid var(--green-3);
}

/* Position-specific styles */
.tabs-top {
  /* Default top position styles */
}

.tabs-bottom {
  /* Bottom position styles if needed */
}

.tabs-left {
  /* Left position styles if needed */
}

.tabs-right {
  /* Right position styles if needed */
}
</style>