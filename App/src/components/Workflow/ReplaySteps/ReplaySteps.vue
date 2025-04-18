<template>
    <div v-bind="containerProps" class="replay-data-container">
        <div v-bind="wrapperProps">
            <div v-for="(item, index) in list" :key="index" @click="StepSelected(props.tabId, item.index)" class="replay-data-row" :class="{'selected': selectedReplayData === item.index}">
                <div class="replay-data-nodeid">{{ item.data.nodeid }}</div>
                <div class="replay-data-message">{{ item.data.message }}</div>
                <div class="replay-data-status" :class="item.data.status">{{ item.data.status }}</div>
            </div>
        </div>
    </div>
    <Teleport :to="'#' + canvasId"> 
        <SideBar title="Replay Data" caption="" visible>
            <p>Id</p>
            <WorkflowNodeSidebarFields nodeType="" :modelValue="replayData[selectedReplayData].nodeid" :tabid="props.tabId" />
            <WorkflowNodeSidebarFields nodeType="" v-model="selectedReplayDataData" :tabid="props.tabId" />
            <h4>Variables</h4>
            <WorkflowNodeSidebarFields nodeType="" :modelValue="variables" :tabid="props.tabId" />
        </SideBar>
    </Teleport>
</template>

<script setup lang="ts">
import { watch, computed,Teleport } from 'vue'
import { useWorkflowCanvasStore } from '@/components/Workflow/Canvas/Workflow.Canvas.hooks'
import { StepSelected } from './ReplaySteps.helper'
import { SideBar } from "@/components/Composable/UI"
import { ReplayDataProps } from './ReplaySteps.types'
import { useFloowsynkNodeHooks } from '@/components/Workflow/Nodes/FloowsynkNode.hooks'
import { SidebarCanvasFields as WorkflowNodeSidebarFields } from "@/components/Workflow/Sidebar"
import { useReplayStoreHooks } from './ReplaySteps.hooks'
import { useVirtualList } from '@vueuse/core'

const props = defineProps<ReplayDataProps>()
const { selectedReplayDataData } = useReplayStoreHooks(props.tabId)
const { replayData, selectedReplayData } = useWorkflowCanvasStore(props.tabId)
const { canvasId } = useFloowsynkNodeHooks(props.tabId)

if (replayData.value.length > 0) {
    selectedReplayData.value = 0
}

const { list, containerProps, wrapperProps, scrollTo } = useVirtualList(replayData, {
    itemHeight: 40,
})
const variables = computed(() => {
    const variablesMap = replayData.value[selectedReplayData.value].variablesMap
    let result: Record<string, string> = {}
    variablesMap.forEach((item: any) => {
        result[item[0]] = item[1].toString()
    })
    return result
})


watch(selectedReplayData, () => {
    scrollTo(selectedReplayData.value-2)
})
</script>

<style scoped src="./ReplaySteps.styles.css"></style>