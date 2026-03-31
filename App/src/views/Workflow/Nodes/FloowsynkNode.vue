<template>
    <div class="node no-scroll nopan" :style="nodestyle"
        :class="{ 'node-selected': node.selected, 'replay-node-selected': isReplayNodeSelected, [nodestatus]: isRunning }"
        @click="clickHandler">
        <div class="icon" :style="{ background: icon?.color }">
            <span class="material-symbols-outlined">{{ icon?.name }}</span>
        </div>
        <div class="content">
            <div class="label" v-if="label && label.length > 0">{{ label }}</div>
            <div class="type">{{ toSentenceCase(nodetype) }}</div>
        </div>
        <Handle class="handle-input" v-for="(input, index) in inputs" :key="input" :id="input"
            :data-output="input" type="target" :position="Position.Left"
            :style="{ top: `${(100 / (outputs.length + 1)) * (index + 1)}%` }" />
        <Handle class="handle-output" v-for="(output, index) in outputs" :key="output"
            :id="output" :data-output="output" type="source" :position="Position.Right"
            :style="{ top: `${(100 / (outputs.length + 1)) * (index + 1)}%` }" />
    </div>

    <Popover pt:root:class="node-variables" ref="op">
        <div class="node-variables__container" v-if="node.data">
            <div class="node-variables__label">
                <span class="material-symbols-outlined node-variables__labelicon">settings</span>
                <span>Node configuration ({{ toSentenceCase(nodetype) }})</span>
            </div>
            <div class="node-variables__caption">{{ node.id }}</div>
            <Divider />
            <WorkflowNodeSidebarFields :nodeType="nodetype" v-model="node.data" :tabid="props.tabid" />
        </div>
    </Popover>
    <Teleport :to="`#${canvasId}`">
        <Modal title="Select Process Type" caption="Select the type of process you want to create" :visible="showModal" @update:visible="showModal = $event" bgcolor="none">
            <ProcessTypeModal :id="props.tabid" />
        </Modal>
    </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue"
import { Handle, Position, useNode } from '@vue-flow/core'
import { SidebarCanvasFields as WorkflowNodeSidebarFields } from "@/views/Workflow/Sidebar"
import { NodeProps } from './FloowsynkNode.types'
import { useFloowsynkNodeHooks, useFloowsynkNodeWatchers } from './FloowsynkNode.hooks'
import { clickhandler } from './FloowsynkNode.helper'
import { toSentenceCase } from "@/components/Composable/Utilities"
import ProcessTypeModal from '@/views/Workflow/Modal/ProcessType/Workflow.Modal.ProcessType.vue'
import { Modal } from '@/components/Composable/UI/Modal'
import { useWorkflowCanvasStore } from '@/views/Workflow/Canvas/Workflow.Canvas.hooks'
import { onKeyStroke } from '@vueuse/core'
import Popover from 'primevue/popover'
import Divider from 'primevue/divider'

const op = ref()
const props = defineProps<NodeProps>()
const { node } = useNode()
const { canvasId } = useFloowsynkNodeHooks(props.tabid)
const showSidebar = ref(false)
const showModal = ref(false)
const { isRunning, hadOpenModalSidebar } = useWorkflowCanvasStore(props.tabid)
const { nodestatus, isReplayNodeSelected } = useFloowsynkNodeWatchers(props.tabid, node, showSidebar)
const clickHandler = (event: any) => {
    op.value.toggle(event)
    clickhandler(node, showSidebar, showModal)
}
// Using computed properties to ensure reactivity and correct types
const icon = computed(() => node.data?.icon)
const nodetype = computed(() => node.data?.nodetype || '')
const label = computed(() => node.data?.label || '')
const nodestyle = computed(() => node.data?.nodestyle)
const inputs = computed(() => (node.data?.inputs || []) as string[])
const outputs = computed(() => (node.data?.outputs || []) as string[])

watch(isRunning, (newValue) => {
    node.draggable = !newValue
    node.deletable = !newValue
    node.connectable = !newValue
})
watch(node, (newValue) => {
    if (newValue.id === '0') {
        // Handled by computed properties now
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