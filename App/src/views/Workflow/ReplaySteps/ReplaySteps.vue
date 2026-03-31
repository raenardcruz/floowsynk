<template>
    <div v-bind="containerProps" class="replay-data-container">
        <div v-bind="wrapperProps">
            <Header>
                <div class="replay-data-nodeid">Node ID</div>
                <div class="replay-data-message">Message</div>
                <div class="">Status</div>
            </Header>
            <Row v-for="(item, index) in list" :key="index" @click="StepSelected(props.tabId, item.index)"
                :selected="selectedReplayData === item.index">
                <div class="replay-data-nodeid">{{ item.data.nodeId }}</div>
                <div class="replay-data-message">{{ item.data.message }}</div>
                <div class="replay-data-status" :class="getStatus(item.data.status)">{{ getStatus(item.data.status) }}
                </div>
            </Row>
        </div>
    </div>
    <Teleport :to="'#' + canvasId">
        <div class="replay-data--sidebar" v-if="replayData[selectedReplayData]">
            <p>Id</p>
            <WorkflowNodeSidebarFields nodeType="" :modelValue="replayData[selectedReplayData].nodeId"
                :tabid="props.tabId" disabled />
            <WorkflowNodeSidebarFields nodeType="" v-model="selectedReplayDataData" :tabid="props.tabId" disabled />
            <h4>Variables</h4>
            <WorkflowNodeSidebarFields nodeType="" :modelValue="variables" :tabid="props.tabId" disabled />
        </div>
    </Teleport>
</template>

<script setup lang="ts">
import { computed, Teleport } from 'vue'
import { useWorkflowCanvasStore } from '@/views/Workflow/Canvas/Workflow.Canvas.hooks'
import { StepSelected } from './ReplaySteps.helper'
import { ReplayDataProps } from './ReplaySteps.types'
import { useFloowsynkNodeHooks } from '@/views/Workflow/Nodes/FloowsynkNode.hooks'
import { SidebarCanvasFields as WorkflowNodeSidebarFields } from "@/views/Workflow/Sidebar"
import { useReplayStoreHooks } from './ReplaySteps.hooks'
import { useVirtualList } from '@vueuse/core'
import { Row, Headers as Header } from '@/components/Composable/UI/Table'
import { NodeStatus } from '@/utils/types'

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
    if (!replayData.value[selectedReplayData.value]) return {}
    const data = replayData.value[selectedReplayData.value].data || {}
    return data
})
    const getStatus = (status: string | number) => {
        switch (status) {
            case NodeStatus.COMPLETED:
            case 'SUCCESS':
            case 'COMPLETED':
                return 'Success'
            case NodeStatus.FAILED:
            case 'ERROR':
            case 'FAILED':
                return 'Failed'
            default:
                return 'Info'
        }
    }

</script>

<style scoped src="./ReplaySteps.styles.css"></style>
