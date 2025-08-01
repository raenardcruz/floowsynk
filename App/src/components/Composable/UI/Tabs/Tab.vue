<template>
    <Tabs :id="id" v-model:value="modelValue" pt:root:class="tab-container">
        <TabList pt:activeBar:class="active-bar">
            <Tab v-for="(tab, idx) in tabContents || []" :key="idx" :value="tab.id" pt:root:class="tab">
                <div class="tab-label-container">
                    <div :style="labelStyle[idx]">
                        <component :is="tab.icon" v-if="tab.icon != undefined" />
                        <span v-if="tab.label != undefined">{{ tab.label }}</span>
                    </div>
                    <img v-if="tab.canClose" :src="CloseSvg" alt="Close Icon" class="close-icon" @click.prevent="emit('close', tab.id)" />
                </div>
            </Tab>
        </TabList>
        <TabPanels>
            <TabPanel v-for="(tab, idx) in tabContents || []" :key="idx" :value="tab.id">
                <component :is="tab.content" v-if="typeof tab.content === 'object'" />
                <span v-else>{{ tab.content }}</span>
            </TabPanel>
        </TabPanels>
    </Tabs>
</template>

<script lang="ts" setup>
import { computed, defineModel, defineProps, type Component, onMounted, defineEmits } from 'vue'
import Tabs from 'primevue/tabs'
import TabList from 'primevue/tablist'
import Tab from 'primevue/tab'
import TabPanels from 'primevue/tabpanels'
import TabPanel from 'primevue/tabpanel'
import { IdProps } from '@/components/Composable/constants'
import CloseSvg from '@/components/Icons/basic/close.svg'

export interface TabContent {
    id: string
    icon?: Component
    label: string
    content: Component | string
    direction?: 'row' | 'column'
    canClose?: boolean
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
const emit = defineEmits<{
    (e: 'close', id: string): void
}>()

const labelStyle = computed(() => {
    return props.tabContents.map(tab => ({
        display: 'flex',
        flexDirection: tab.direction || 'row',
        alignItems: 'center',
        gap: '4px',
        fontSize: tab.direction == 'row' ? '16px' : '8px',
    }))
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
</style>