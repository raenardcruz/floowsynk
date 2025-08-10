<template>
    <div v-bind="containerProps" class="replay-data-container">
        <div v-bind="wrapperProps">
            <Header>
                <div class="replay-data-nodeid">Node ID</div>
                <div class="replay-data-message">Message</div>
                <div class="">Status</div>
            </Header>
            <Row v-for="(item, index) in list" :key="index" @click="StepSelected(props.tabId, item.index)" :selected="selectedReplayData === item.index">
                <div class="replay-data-nodeid">{{ item.data.nodeid }}</div>
                <div class="replay-data-message">{{ item.data.message }}</div>
                <div class="replay-data-status" :class="getStatus(item.data.status)">{{ getStatus(item.data.status) }}</div>
            </Row>
        </div>
    </div>
    <Teleport :to="'#' + canvasId"> 
        <SideBar title="Replay Data" caption="" :customStyle="sideBarStyle" visible>
            <p>Id</p>
            <WorkflowNodeSidebarFields nodeType="" :modelValue="replayData[selectedReplayData].nodeid" :tabid="props.tabId" />
            <WorkflowNodeSidebarFields nodeType="" v-model="selectedReplayDataData" :tabid="props.tabId" />
            <h4>Variables</h4>
            <WorkflowNodeSidebarFields nodeType="" :modelValue="variables" :tabid="props.tabId" />
        </SideBar>
    </Teleport>
</template>

<script setup lang="ts">
import { computed, Teleport } from 'vue'
import { useWorkflowCanvasStore } from '@/views/Workflow/Canvas/Workflow.Canvas.hooks'
import { StepSelected } from './ReplaySteps.helper'
import SideBar from '@/components/Composable/UI/Sidebar'
import { ReplayDataProps } from './ReplaySteps.types'
import { useFloowsynkNodeHooks } from '@/views/Workflow/Nodes/FloowsynkNode.hooks'
import { SidebarCanvasFields as WorkflowNodeSidebarFields } from "@/views/Workflow/Sidebar"
import { useReplayStoreHooks } from './ReplaySteps.hooks'
import { useVirtualList } from '@vueuse/core'
import { Row, Headers as Header } from '@/components/Composable/UI/Table'
import { NodeStatus } from 'proto/workflow/workflow_pb'

const props = defineProps<ReplayDataProps>()
const { selectedReplayDataData } = useReplayStoreHooks(props.tabId)
const { replayData, selectedReplayData } = useWorkflowCanvasStore(props.tabId)
const { canvasId } = useFloowsynkNodeHooks(props.tabId)

if (replayData.value.length > 0) {
    selectedReplayData.value = 0
}

const { list, containerProps, wrapperProps } = useVirtualList(replayData, {
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
const getStatus = (status: number) => {
    switch (status) {
        case NodeStatus.COMPLETED:
            return 'Success'
        case NodeStatus.FAILED:
            return 'Failed'
        case NodeStatus.INFO:
            return 'Info'
        default:
            return 'Info'
    }
}
const sideBarStyle = computed(() => {
    return {
        position: 'relative',
    }
})
</script>

<style scoped src="./ReplaySteps.styles.css"></style>