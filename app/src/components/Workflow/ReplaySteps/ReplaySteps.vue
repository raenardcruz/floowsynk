<template>
    <!-- <table class="replay-data-table">
        <thead>
            <tr>
                <th>Node Id</th>
                <th>Message</th>
                <th>Status</th> 
            </tr>
        </thead>
        <tbody>
            <tr v-for="(item, index) in list" :key="item.data.nodeid" @click="StepSelected(tabId, index)" :class="{'selected': selectedReplayData === index}">
                <td>{{ item.data.nodeid }}</td>
                <td>{{ item.data.message }}</td>
                <td>{{ item.data.status }}</td>
            </tr>
        </tbody>
    </table> -->
    <div v-bind="containerProps" class="replay-data-container">
        <div v-bind="wrapperProps">
            <div v-for="(item, index) in list" :key="index" @click="StepSelected(props.tabId, index)" class="replay-data-row" :class="{'selected': selectedReplayData === item.index}">
                <div class="replay-data-nodeid">{{ item.data.nodeid }}</div>
                <div class="replay-data-message">{{ item.data.message }}</div>
                <div class="replay-data-status">{{ item.data.status }}</div>
            </div>
        </div>
    </div>
    <Teleport :to="'#' + canvasId"> 
        <SideBar title="Replay Data" caption="" visible>
            <WorkflowNodeSidebarFields nodeType="" :modelValue="replayData[selectedReplayData].nodeid" :tabid="props.tabId" />
            <WorkflowNodeSidebarFields nodeType="" v-model="selectedReplayDataData" :tabid="props.tabId" />
            <h4>Variables</h4>
            <table class="replay-data-table">
                <tbody>
                    <tr v-for="(item, index) in replayData[selectedReplayData].variablesMap" :key="index">
                        <td>{{ item[0] }}</td>
                        <td>{{ item[1] }}</td>
                    </tr>
                </tbody>
            </table>
        </SideBar>
    </Teleport>
</template>

<script setup lang="ts">
import { watch } from 'vue'
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

const { list, containerProps, wrapperProps } = useVirtualList(replayData, {
    itemHeight: 30,
    overscan: 10
})

watch(selectedReplayData, () => {
    const selectedElement = document.querySelector('.selected');
    if (selectedElement) {
        selectedElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
})
</script>

<style scoped src="./ReplaySteps.styles.css"></style>