<template>
    <div class="node no-scroll nopan" :style="nodestyle" :class="{ 'node-selected': node.selected || isReplayNodeSelected, [nodestatus]: isRunning }"
        @click="clickHandler()">
        <div class="icon" :style="{ background: icon?.color }">
            <span class="material-symbols-outlined">{{ icon?.name }}</span>
        </div>
        <div class="content">
            <div class="label" v-if="label.length > 0">{{ label }}</div>
            <div class="type">{{ toSentenceCase(nodetype) }}</div>
        </div>
        <Handle class="handle-input" v-if="outputsList" v-for="(input, index) in inputsList" :key="input" :id="input"
            :data-output="input" type="target" :position="Position.Left"
            :style="{ top: `${(100 / (outputsList.length + 1)) * (index + 1)}%` }" />
        <Handle class="handle-output" v-if="outputsList" v-for="(output, index) in outputsList" :key="output" :id="output"
            :data-output="output" type="source" :position="Position.Right"
            :style="{ top: `${(100 / (outputsList.length + 1)) * (index + 1)}%` }" />
    </div>
    <Teleport :to="'#' + canvasId" v-if="!isRunning">
        <SideBar :title="label" :caption="node.id" v-model:visible="showSidebar">
            <div v-if="node.data">
                <WorkflowNodeSidebarFields :nodeType="nodetype" v-model="node.data" :tabid="props.tabid" />
            </div>
        </SideBar>
    </Teleport>
    <Teleport :to="`#${canvasId}`">
        <Modal title="Select Process Type" caption="Select the type of process you want to create"
            v-model:visible="showModal">
            <ProcessTypeModal :id="props.tabid" />
        </Modal>
    </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from "vue"
import { Handle, Position, useNode } from '@vue-flow/core'
import { SideBar } from "@/components/Composable/UI"
import { SidebarCanvasFields as WorkflowNodeSidebarFields } from "@/components/Workflow/Sidebar"
import { NodeProps } from './FloowsynkNode.types'
import { useFloowsynkNodeHooks, useFloowsynkNodeWatchers } from './FloowsynkNode.hooks'
import { clickhandler } from './FloowsynkNode.helper'
import { Node } from 'proto/floowsynk_pb'
import { toSentenceCase } from "@/components/Composable/Utilities"
import ProcessTypeModal from '@/components/Workflow/Modal/ProcessType/Workflow.Modal.ProcessType.vue'
import { Modal } from '@/components/Composable/UI'
import { useWorkflowCanvasStore } from '@/components/Workflow/Canvas/Workflow.Canvas.hooks'

const props = defineProps<NodeProps>()
const { node } = useNode()
const { canvasId } = useFloowsynkNodeHooks(props.tabid)
const showSidebar = ref(false)
const showModal = ref(false)
const { nodestatus, isReplayNodeSelected } = useFloowsynkNodeWatchers(props.tabid, node, showSidebar)
const clickHandler = () => clickhandler(node, showSidebar, showModal)
let { icon, nodetype, label, outputsList, inputsList, nodestyle } = node as unknown as Node.AsObject
const { isRunning } = useWorkflowCanvasStore(props.tabid)
watch(isRunning, (newValue) => {
    node.draggable = !newValue
    node.deletable = !newValue
    node.connectable = !newValue
})
watch(node, (newValue) => {
    if (newValue.id === '0') {
        nodetype = (newValue as unknown as Node.AsObject).nodetype
        icon    = (newValue as unknown as Node.AsObject).icon
        nodestyle = (newValue as unknown as Node.AsObject).nodestyle
    }
})
</script>

<style scoped src="./FloowsynkNode.styles.css"></style>