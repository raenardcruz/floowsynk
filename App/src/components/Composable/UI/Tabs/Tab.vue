<template>
    <Tabs :id="id" v-model:value="modelValue" pt:root:class="tab-container">
        <TabList pt:activeBar:class="active-bar">
            <Tab v-for="(tab, idx) in tabContents || []" :key="idx" :value="tab.id" pt:root:class="tab">
                {{ tab.label }}
            </Tab>
        </TabList>
        <TabPanels>
            <TabPanel v-for="(tab, idx) in tabContents || []" :key="idx" :value="tab.id">
                {{ tab.content }}
            </TabPanel>
        </TabPanels>
    </Tabs>
</template>

<script lang="ts" setup>
import { defineModel, defineProps, type Component, onMounted } from 'vue'
import Tabs from 'primevue/tabs'
import TabList from 'primevue/tablist'
import Tab from 'primevue/tab'
import TabPanels from 'primevue/tabpanels'
import TabPanel from 'primevue/tabpanel'
import { IdProps } from '@/components/Composable/constants'

export interface TabContent {
    id: string
    label: Component | string
    content: Component | string
}
interface TabProps extends IdProps {
    tabContents: TabContent[]
}

const props = defineProps<TabProps>()
const modelValue = defineModel<string | number>({ default: '' })
onMounted(() => {
    if (modelValue .value=== '') {
        modelValue.value = props.tabContents[0].id
    }
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
}
.tab:hover {
    background: var(--grey-4);
}
:deep(.active-bar) {
    border: 1px solid var(--green-3);
}
</style>