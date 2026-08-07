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
                <div class="replay-data-nodeid">{{ item.data.nodeid || item.data.nodeId }}</div>
                <div class="replay-data-message">{{ item.data.message || 'No log message' }}</div>
                <div class="replay-data-status" :class="getStatus(item.data.status)">{{ getStatus(item.data.status) }}
                </div>
            </Row>
        </div>
    </div>
    <Teleport :to="'#' + canvasId">
        <div class="replay-data--sidebar" v-if="currentSelectedNode">
            <div class="sidebar-header">
                <span class="material-symbols-outlined">analytics</span>
                <span>Execution Step Details</span>
            </div>

            <div class="sidebar-field">
                <label>Node ID</label>
                <input type="text" :value="currentSelectedNode.nodeid || currentSelectedNode.nodeId" disabled class="sidebar-input" />
            </div>

            <div class="sidebar-field">
                <label>Status</label>
                <span class="status-badge" :class="getStatus(currentSelectedNode.status)">{{ getStatus(currentSelectedNode.status) }}</span>
            </div>

            <div class="sidebar-field">
                <label>Log Message</label>
                <textarea :value="currentSelectedNode.message || 'No log message recorded'" disabled class="sidebar-textarea" rows="3"></textarea>
            </div>

            <div class="sidebar-field">
                <label>Variables</label>
                <div class="variables-list" v-if="Object.keys(variables).length > 0">
                    <div class="variable-item" v-for="(val, key) in variables" :key="key">
                        <div class="var-item-header">
                            <span class="var-key">{{ key }}</span>
                            <button class="var-view-btn" @click="openVariableModal(String(key), val)" title="View full value in Monaco Editor">
                                <span class="material-symbols-outlined">code</span>
                            </button>
                        </div>
                        <span class="var-val">{{ val }}</span>
                    </div>
                </div>
                <span v-else class="empty-text">No variables recorded for this step</span>
            </div>
        </div>
    </Teleport>
    <Teleport to="body">
        <Modal :visible="showVariableModal" :title="`Variable: ${selectedVariableKey}`"
            @update:visible="showVariableModal = $event" bgcolor="none" @click.stop>
            <MonacoEditor v-model="selectedVariableValue" :variables="[]" :disabled="true" />
        </Modal>
    </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useWorkflowCanvasStore } from '@/views/Workflow/Canvas/Workflow.Canvas.hooks'
import { StepSelected } from './ReplaySteps.helper'
import { ReplayDataProps } from './ReplaySteps.types'
import { useFloowsynkNodeHooks } from '@/views/Workflow/Nodes/FloowsynkNode.hooks'
import { useVirtualList } from '@vueuse/core'
import { Row, Headers as Header } from '@/components/Composable/UI/Table'
import { NodeStatus } from 'proto/workflow/workflow_pb'
import { Modal } from '@/components/Composable/UI/Modal'
import { MonacoEditor } from '@/components/Composable/UI/MonacoEditor'

const props = defineProps<ReplayDataProps>()
const { replayData, selectedReplayData } = useWorkflowCanvasStore(props.tabId)
const { canvasId } = useFloowsynkNodeHooks(props.tabId)

const selectedVariableKey = ref<string>('')
const selectedVariableValue = ref<string>('')
const showVariableModal = ref<boolean>(false)

if (replayData.value.length > 0) {
    selectedReplayData.value = 0
}

const currentSelectedNode = computed(() => {
    if (!replayData.value || replayData.value.length === 0) return null
    return replayData.value[selectedReplayData.value] || null
})

const { list, containerProps, wrapperProps } = useVirtualList(replayData, {
    itemHeight: 40,
})

const formatValueForDisplay = (val: any): string => {
    if (typeof val === 'object' && val !== null) {
        try {
            return JSON.stringify(val, null, 2)
        } catch {
            return String(val)
        }
    }
    if (typeof val === 'string') {
        const trimmed = val.trim()
        if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
            try {
                return JSON.stringify(JSON.parse(trimmed), null, 2)
            } catch {
                return val
            }
        }
    }
    return String(val ?? '')
}

const openVariableModal = (key: string, val: string) => {
    selectedVariableKey.value = key
    selectedVariableValue.value = val
    showVariableModal.value = true
}

const variables = computed(() => {
    const current = currentSelectedNode.value
    if (!current) return {}
    const vMap = current.variablesMap ?? current.variables
    let result: Record<string, string> = {}
    if (!vMap) return result

    if (Array.isArray(vMap)) {
        for (const item of vMap) {
            if (Array.isArray(item) && item.length >= 2) {
                result[String(item[0])] = formatValueForDisplay(item[1])
            } else if (item && typeof item === 'object') {
                const key = item.key || item.name || item[0]
                const val = item.value || item.val || item[1]
                if (key !== undefined) {
                    result[String(key)] = formatValueForDisplay(val)
                }
            }
        }
    } else if (typeof vMap === 'object') {
        for (const [k, v] of Object.entries(vMap)) {
            result[k] = formatValueForDisplay(v)
        }
    }
    return result
})

const getStatus = (status: number) => {
    if (status === NodeStatus.FAILED) {
        return 'Failed'
    }
    return 'Success'
}

</script>

<style scoped src="./ReplaySteps.styles.css"></style>