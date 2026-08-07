<template>
    <div class="node no-scroll nopan" :style="nodestyle"
        :class="{ 'node-selected': node.selected, 'replay-node-selected': isReplayNodeSelected, [nodestatus]: isRunning }"
        @click="clickHandler">
        <div class="icon" :style="{ background: displayIcon ? '#ffffff' : icon?.color, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: displayIcon ? '1px solid #e5e7eb' : 'none' }">
            <img v-if="displayIcon && (displayIcon.startsWith('/') || displayIcon.endsWith('.svg'))" :src="displayIcon" style="width: 30px; height: 30px; object-fit: contain;" alt="icon" />
            <span v-else class="material-symbols-outlined">{{ icon?.name }}</span>
        </div>
        <div class="content">
            <div class="label" v-if="displayLabel.length > 0">{{ displayLabel }}</div>
            <div class="type">{{ toSentenceCase(nodetype) }}</div>
        </div>
        <Handle class="handle-input" v-if="outputsList" v-for="(input, index) in inputsList" :key="input" :id="input"
            :data-output="input" type="target" :position="Position.Left"
            :style="{ top: `${(100 / (outputsList.length + 1)) * (index + 1)}%` }" />
        <Handle class="handle-output" v-if="outputsList" v-for="(output, index) in outputsList" :key="output"
            :id="output" :data-output="output" type="source" :position="Position.Right"
            :style="{ top: `${(100 / (outputsList.length + 1)) * (index + 1)}%` }" />
    </div>

    <Popover pt:root:class="node-variables" ref="op">
        <div class="node-variables__container" v-if="node.data">
            <div class="node-variables__label">
                <span class="material-symbols-outlined node-variables__labelicon">settings</span>
                <span>Node configuration ({{ toSentenceCase(nodetype) }})</span>
            </div>
            <div class="node-variables__caption">{{ node.id }}</div>
            <Divider />
            <WorkflowNodeSidebarFields :nodeType="nodetype" v-model="node.data" :tabid="props.tabid" :disabled="isRunning" />
        </div>
    </Popover>
    <Teleport :to="`#${canvasId}`">
        <Modal title="Select Process Type" caption="Select the type of process you want to create" :visible="showModal" @update:visible="showModal = $event" bgcolor="none">
            <ProcessTypeModal :id="props.tabid" />
        </Modal>
    </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from "vue"
import { Handle, Position, useNode } from '@vue-flow/core'
import { SidebarCanvasFields as WorkflowNodeSidebarFields } from "@/views/Workflow/Sidebar"
import { NodeProps } from './FloowsynkNode.types'
import { useFloowsynkNodeHooks, useFloowsynkNodeWatchers } from './FloowsynkNode.hooks'
import { clickhandler } from './FloowsynkNode.helper'
import { Node } from 'proto/workflow/workflow_pb'
import { toSentenceCase } from "@/components/Composable/Utilities"
import ProcessTypeModal from '@/views/Workflow/Modal/ProcessType/Workflow.Modal.ProcessType.vue'
import { Modal } from '@/components/Composable/UI/Modal'
import { useWorkflowCanvasStore } from '@/views/Workflow/Canvas/Workflow.Canvas.hooks'
import { onKeyStroke } from '@vueuse/core'
import Popover from 'primevue/popover'
import Divider from 'primevue/divider'
import { getConnections } from '@/views/Connectors/Connectors.api'

const op = ref()
const props = defineProps<NodeProps>()
const { node } = useNode()
const { canvasId } = useFloowsynkNodeHooks(props.tabid)
const showSidebar = ref(false)
const showModal = ref(false)
const { isRunning, hadOpenModalSidebar } = useWorkflowCanvasStore(props.tabid)
const { nodestatus, isReplayNodeSelected } = useFloowsynkNodeWatchers(props.tabid, node, showSidebar)
const clickHandler = (event: any) => {
    if (node.id !== '0') {
        op.value.toggle(event)
    }
    clickhandler(node, showSidebar, showModal)
}
let { icon, nodetype, label, outputsList, inputsList, nodestyle } = node as unknown as Node.AsObject

const connectionsList = ref<any[]>([])
const templatesList = ref<any[]>([])

const fetchConnectorInfo = async () => {
    if (nodetype === 'connector') {
        try {
            const connRes = await getConnections()
            connectionsList.value = connRes.toObject().connectionsList || []

            const tempRes = await fetch('http://localhost:8083/api/connectors/templates')
            if (tempRes.ok) {
                templatesList.value = await tempRes.json()
            }
        } catch (err) {
            console.error("Failed to load connector info in node:", err)
        }
    }
}

onMounted(() => {
    fetchConnectorInfo()
})

const displayIcon = computed(() => {
    if (nodetype === 'connector' && node.data && node.data.listvar) {
        const conn = connectionsList.value.find(c => c.id === node.data.listvar)
        if (conn) {
            const connectorId = conn.connectorid || conn.connectorId
            const temp = templatesList.value.find(t => t.id === connectorId)
            if (temp && temp.icon) {
                return temp.icon
            }
        }
    }
    return null
})

const displayLabel = computed(() => {
    if (nodetype === 'connector' && node.data && node.data.listvar) {
        const conn = connectionsList.value.find(c => c.id === node.data.listvar)
        if (conn) {
            const actionId = node.data.type
            const connectorId = conn.connectorid || conn.connectorId
            const temp = templatesList.value.find(t => t.id === connectorId)
            const action = temp?.actions?.find((a: any) => a.id === actionId)
            if (action) {
                return `${conn.name}: ${action.name}`
            }
            return conn.name
        }
    }
    return label || toSentenceCase(nodetype)
})

watch(isRunning, (newValue) => {
    node.draggable = !newValue
    node.deletable = !newValue
    node.connectable = !newValue
})
watch(node, (newValue) => {
    if (newValue.id === '0') {
        nodetype = (newValue as unknown as Node.AsObject).nodetype
        icon = (newValue as unknown as Node.AsObject).icon
        nodestyle = (newValue as unknown as Node.AsObject).nodestyle
    }
})
watch([showModal, showModal], ([newShowModal, newShowSidebar]) => {
    hadOpenModalSidebar.value = newShowSidebar || newShowModal
})
onKeyStroke('Escape', () => {
    showSidebar.value = false
    showModal.value = false
})
</script>

<style scoped src="./FloowsynkNode.styles.css"></style>

<style>
.node-variables {
  margin-top: 20px;
}
</style>
