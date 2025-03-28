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
            <tr v-for="item in replayData" :key="item.nodeid" @click="StepSelected(item)">
                <td>{{ item.nodeid }}</td>
                <td>{{ item.message }}</td>
                <td>{{ item.status }}</td>
            </tr>
        </tbody>
    </table>
    <Teleport :to="'#' + canvasId">
        <SideBar title="Fields" caption="Tet" visible="true">
            sample
        </SideBar>
    </Teleport>
</template>

<script setup lang="ts">
import { useWorkflowCanvasStore } from '@/components/Workflow/Canvas/Workflow.Canvas.hooks'
import { StepSelected } from './ReplaySteps.helper'
import { SideBar } from "@/components/Composable/UI";
import { ReplayDataProps } from './ReplaySteps.types'
import { useFloowsynkNodeHooks } from '@/components/Workflow/Nodes/FloowsynkNode.hooks'

const { replayData } = useWorkflowCanvasStore()
const props = defineProps<ReplayDataProps>()
const { canvasId } = useFloowsynkNodeHooks(props.tabid)
</script>

<style scoped src="./ReplaySteps.styles.css"></style>