<template>
    <table class="replay-data-table">
        <thead>
            <tr>
                <th>Node Id</th>
                <th>Message</th>
                <th>Status</th> 
            </tr>
        </thead>
        <tbody>
            <tr v-for="(item, index) in replayData" :key="item.nodeid" @click="StepSelected(tabId, index)" :class="{'selected': selectedReplayData === index}">
                <td>{{ item.nodeid }}</td>
                <td>{{ item.message }}</td>
                <td>{{ item.status }}</td>
            </tr>
        </tbody>
    </table>
    <Teleport :to="'#' + canvasId"> 
        <SideBar title="Replay Data" caption="" visible>
            <WorkflowNodeSidebarFields nodeType="" v-model="selectedReplayDataData" :tabid="props.tabId" />
        </SideBar>
    </Teleport>
</template>

<script setup lang="ts">
import { useWorkflowCanvasStore } from '@/components/Workflow/Canvas/Workflow.Canvas.hooks'
import { StepSelected } from './ReplaySteps.helper'
import { SideBar } from "@/components/Composable/UI";
import { ReplayDataProps } from './ReplaySteps.types'
import { useFloowsynkNodeHooks } from '@/components/Workflow/Nodes/FloowsynkNode.hooks'
import { SidebarCanvasFields as WorkflowNodeSidebarFields } from "@/components/Workflow/Sidebar"
import { useReplayStoreHooks } from './ReplaySteps.hooks'

const props = defineProps<ReplayDataProps>()
    const { selectedReplayDataData } = useReplayStoreHooks(props.tabId)
    const { replayData, selectedReplayData } = useWorkflowCanvasStore(props.tabId)
const { canvasId } = useFloowsynkNodeHooks(props.tabId)
if (replayData.value.length > 0) {
    selectedReplayData.value = 0
}
</script>

<style scoped src="./ReplaySteps.styles.css"></style>