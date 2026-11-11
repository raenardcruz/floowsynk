<template>
    <!-- 1. Sticky Note Node -->
    <div v-if="nodetype === 'stickyNote'" class="sticky-note-node no-scroll nopan"
        :style="{ backgroundColor: stickyColor }"
        :class="{ 'node-selected': node.selected }"
        @click="clickHandler">
        <NodeResizer
            :node-id="node.id"
            :min-width="180"
            :min-height="120"
            :is-visible="!isGuest"
            color="#d97706"
            @resize-start="handleResizeStart"
            @resize-end="handleResizeEnd"
        />
        <div class="sticky-header">
            <span class="material-symbols-outlined sticky-icon">edit_note</span>
            <input class="sticky-title-input nodrag" type="text" v-model="node.data.name" :disabled="isGuest" placeholder="Note Title" @click.stop />
            <div class="sticky-palette nodrag" v-if="!isGuest" @click.stop>
                <span
                    v-for="c in stickyColors"
                    :key="c"
                    class="sticky-color-dot nodrag"
                    :style="{ backgroundColor: c }"
                    :class="{ active: stickyColor === c }"
                    @click.stop="setStickyColor(c)"
                />
            </div>
        </div>
        <textarea class="sticky-textarea nodrag" v-model="node.data.message" :disabled="isGuest" placeholder="Add annotations, markdown, or todo items..." @click.stop></textarea>
    </div>

    <!-- 2. Visual Group Node -->
    <div v-else-if="nodetype === 'visualGroup'" class="visual-group-node no-scroll nopan"
        :class="{ 'node-selected': node.selected }"
        @click="clickHandler">
        <NodeResizer
            :node-id="node.id"
            :min-width="240"
            :min-height="140"
            :is-visible="!isGuest"
            color="#6366f1"
            @resize-start="handleResizeStart"
            @resize-end="handleResizeEnd"
        />
        <div class="visual-group-header">
            <span class="material-symbols-outlined visual-group-icon">select_all</span>
            <input class="visual-group-title nodrag" type="text" v-model="node.data.name" :disabled="isGuest" placeholder="Zone / Group Name" @click.stop />
        </div>
        <div class="visual-group-body">
            <input class="visual-group-desc nodrag" type="text" v-model="node.data.message" :disabled="isGuest" placeholder="Group description..." @click.stop />
        </div>
    </div>

    <!-- 3. Standard Flow Node -->
    <div v-else class="node no-scroll nopan" :style="nodestyle"
        :class="{ 'node-selected': node.selected, 'replay-node-selected': isReplayNodeSelected, [nodestatus]: isRunning, 'node-is-pinned': isPinned }"
        @click="clickHandler">
        <!-- Pinned Badge Indicator -->
        <div v-if="isPinned" class="node-pinned-badge" title="Data Pinned (Mock output active)">
            <span class="material-symbols-outlined">push_pin</span>
            <span>PINNED</span>
        </div>

        <div class="icon" :style="{ background: displayIcon ? '#ffffff' : icon?.color, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: displayIcon ? '1px solid #e5e7eb' : 'none' }">
            <img v-if="displayIcon && (displayIcon.startsWith('/') || displayIcon.endsWith('.svg'))" :src="displayIcon" style="width: 30px; height: 30px; object-fit: contain;" alt="icon" />
            <span v-else class="material-symbols-outlined">{{ icon?.name }}</span>
        </div>
        <div class="content">
            <div class="label" v-if="displayLabel.length > 0">{{ displayLabel }}</div>
            <div class="type">{{ toSentenceCase(nodetype) }}</div>
        </div>
        <Handle class="handle-input" v-if="inputsList" v-for="(input, index) in inputsList" :key="input" :id="input"
            :data-output="input" type="target" :position="Position.Left"
            :style="{ top: `${(100 / (inputsList.length + 1)) * (index + 1)}%` }" />
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
            <WorkflowNodeSidebarFields :nodeType="nodetype" v-model="node.data" :tabid="props.tabid" :disabled="isRunning || isGuest" />
        </div>
    </Popover>
    <Teleport :to="`#${canvasId}`" v-if="showModal">
        <Modal title="Select Process Type" caption="Select the type of process you want to create" :visible="showModal" @update:visible="showModal = $event" bgcolor="none">
            <ProcessTypeModal :id="props.tabid" />
        </Modal>
    </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from "vue"
import { Handle, Position, useNode } from '@vue-flow/core'
import { NodeResizer } from '@vue-flow/node-resizer'
import { SidebarCanvasFields as WorkflowNodeSidebarFields } from "@/views/Workflow/Sidebar"
import { NodeProps } from './FloowsynkNode.types'
import { useFloowsynkNodeHooks, useFloowsynkNodeWatchers } from './FloowsynkNode.hooks'
import { Node } from 'proto/workflow/workflow_pb'
import { toSentenceCase } from "@/components/Composable/Utilities"
import ProcessTypeModal from '@/views/Workflow/Modal/ProcessType/Workflow.Modal.ProcessType.vue'
import { Modal } from '@/components/Composable/UI/Modal'
import { useWorkflowCanvasStore, useWorkflowCanvasHooks } from '@/views/Workflow/Canvas/Workflow.Canvas.hooks'
import { onKeyStroke } from '@vueuse/core'
import Popover from 'primevue/popover'
import Divider from 'primevue/divider'
import { useConnectorCatalog } from '@/views/Connectors/Connectors.api'

const isGuest = computed(() => localStorage.getItem('sessionToken') === 'guest')
const op = ref()
const props = defineProps<NodeProps>()
const { node } = useNode()
const { canvasId } = useFloowsynkNodeHooks(props.tabid)
const { commit } = useWorkflowCanvasHooks(props.tabid)

const handleResizeStart = () => {
    node.selected = true
}

const handleResizeEnd = () => {
    if (!isGuest.value) {
        commit()
    }
}
const showSidebar = ref(false)
const showModal = ref(false)
const { isRunning, hadOpenModalSidebar, activeInspectorNodeId } = useWorkflowCanvasStore(props.tabid)
const { nodestatus, isReplayNodeSelected } = useFloowsynkNodeWatchers(props.tabid, node, showSidebar)
const clickHandler = () => {
    if (node.id === '0') {
        if (isGuest.value) return
        showModal.value = true
    } else {
        activeInspectorNodeId.value = node.id
        showSidebar.value = true
    }
}
let { icon, nodetype, label, outputsList, inputsList, nodestyle } = node as unknown as Node.AsObject

const { connectionsList, templatesList, fetchConnectorCatalog } = useConnectorCatalog()

onMounted(() => {
    if (isGuest.value) {
        node.draggable = false
        node.deletable = false
        node.connectable = false
    }
    if (nodetype === 'connector') {
        fetchConnectorCatalog()
    }
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
    if (isGuest.value) {
        node.draggable = false
        node.deletable = false
        node.connectable = false
        return
    }
    node.draggable = !newValue
    node.deletable = !newValue
    node.connectable = !newValue
})
watch(node, (newValue) => {
    if (newValue.id === '0') {
        nodetype = (newValue as unknown as Node.AsObject).nodetype
        icon = (newValue as unknown as Node.AsObject).icon
        nodestyle = (newValue as unknown as Node.AsObject).nodestyle
        if (nodetype === 'connector') {
            fetchConnectorCatalog()
        }
    }
})
watch([showModal, showSidebar], ([newShowModal, newShowSidebar]) => {
    hadOpenModalSidebar.value = newShowSidebar || newShowModal
})
const stickyColors = ['#fef08a', '#bfdbfe', '#bbf7d0', '#e9d5ff', '#fecdd3', '#334155']

const stickyColor = computed(() => {
    return node.data?.template || '#fef08a'
})

const setStickyColor = (color: string) => {
    if (!node.data) node.data = {}
    node.data.template = color
}

const isPinned = computed(() => {
    if (!node.data) return false
    return Boolean(
        node.data.pinneddata ||
        node.data.pinnedData ||
        (node.data.value && String(node.data.value).startsWith('__PINNED__:')) ||
        (node.data.payload && String(node.data.payload).startsWith('__PINNED__:'))
    )
})

onKeyStroke('Escape', () => {
    showSidebar.value = false
    showModal.value = false
    if (activeInspectorNodeId.value === node.id) {
        activeInspectorNodeId.value = null
    }
})
</script>

<style scoped src="./FloowsynkNode.styles.css"></style>

<style>
.node-variables {
  margin-top: 20px;
}
</style>
