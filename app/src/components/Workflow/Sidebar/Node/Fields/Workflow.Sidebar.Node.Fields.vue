<template>
    <div class="input" v-if="props.nodeType == 'subprocess'">
        <select class="sidebar-input" v-model="props.modelValue.subProcessId" :disabled="isRunning">
            <option v-for="process in filteredProcesses" :value="process.id">{{ process.name }}</option>
        </select>
    </div>
    <span v-for="(value, key) in props.modelValue" :key="key" v-else-if="props.modelValue.constructor == Object">
        <div class="input" v-if="value != null">
            <legend class="sidebar-legend" v-if="props.modelValue[key].length > 0 || value.constructor != Array">
                <div class="checkbox" v-if="value.constructor == Boolean">
                    <input type="checkbox" v-model="props.modelValue[key]" :disabled="isRunning" />
                    <div class="label">{{ toSentenceCase(key.toString()) }}</div>
                </div>
                <span v-else>{{ toSentenceCase(key.toString()) }}</span>
            </legend>
            <span style="width: 100%" v-if="value.constructor == String">
                <Teleport to=".content" v-if="MONACO_EDITOR_DATA_PROPERTIES.includes(key)">
                    <Modal :title="toSentenceCase(key.toString())" caption="" v-model:visible="modalStates[key]">
                        <MonacoEditor v-model="props.modelValue[key]" :variables="variables" :disabled="isRunning" />
                    </Modal>
                </Teleport>
                <input class="sidebar-input" type="text" v-model="props.modelValue[key]" :disabled="isRunning" />
                <span class="material-symbols-outlined show-code-btn" @click="showModal(key)" v-if="MONACO_EDITOR_DATA_PROPERTIES.includes(key)">developer_mode_tv</span>
            </span>
            <input class="sidebar-input" type="number" v-model="props.modelValue[key]"
                v-if="value.constructor == Number" :disabled="isRunning" />
            <div class="array-container" v-if="isNodeArray(value)">
                <div class="child-container" v-for="(v, i) in getArrayData(props.modelValue[key] as NodeDataArray.AsObject)" :key="v">
                    <span class="material-symbols-outlined remove-array" @click="removeArrayItem(i, key)">delete</span>
                    <WorkflowNodeSidebarFields
                        :nodeType="props.nodeType"
                        v-model="getArrayData(props.modelValue[key] as NodeDataArray.AsObject)[i]"
                        :tabid="props.tabid" />
                </div>
                <select class="sidebar-input" v-model="props.modelValue[key].type" :disabled="isRunning">
                    <option :value="ArrayDataType.KEYVALUE">KeyValue</option>
                    <option :value="ArrayDataType.STRING">String</option>
                    <option :value="ArrayDataType.INT">Number</option>
                    <option :value="ArrayDataType.BOOL">Boolean</option>
                </select>
                <div class="btn" @click="addArrayItem(key)">
                    <span class="material-symbols-outlined">add</span>
                </div>
            </div>
        </div>
    </span>
    <div class="input" v-else>
        <input class="sidebar-input" type="text" v-model="props.modelValue" @change="inputHandler($event, emit)"
            v-if="props.modelValue.constructor == String" :disabled="isRunning" />
        <input class="sidebar-input" type="number" v-model="props.modelValue" @change="inputHandler($event, emit)"
            v-if="props.modelValue.constructor == Number" :disabled="isRunning" />
        <div v-if="props.modelValue.constructor == Boolean">
            <input type="checkbox" v-model="props.modelValue" @change="inputHandler($event, emit)" :disabled="isRunning" />
            <label>&nbsp;{{ props.modelValue }}</label>
        </div>
    </div>
</template>

<script setup lang="ts">
import Modal from '@/components/Composable/UI/Modal'
import MonacoEditor from '@/components/Composable/UI/MonacoEditor'
import WorkflowNodeSidebarFields from './Workflow.Sidebar.Node.Fields.vue'
import { SidebarNodeProps } from '../Workflow.Sidebar.Node.types'
import { useSidebarNodeHooks, useSidebarNodeStore } from '../Workflow.Sidebar.Node.hooks'
import { toSentenceCase } from '@/components/Composable/Utilities'
import { showModal, useSidebarNodeFieldsHelper, inputHandler } from './Workflow.Sidebar.Node.helper'
import { EMIT_MODEL, MONACO_EDITOR_DATA_PROPERTIES } from './Workflow.Sidebar.Node.Fields.constants'
import { NodeDataArray, ArrayDataType } from 'proto/floowsynk_pb'
import { useWorkflowCanvasStore } from '@/components/Workflow/Canvas/Workflow.Canvas.hooks'

const props = defineProps<SidebarNodeProps>()
const emit = defineEmits([EMIT_MODEL])
const { modalStates } = useSidebarNodeStore()
const { filteredProcesses, variables } = useSidebarNodeHooks(props.tabid)
const { removeArrayItem, addArrayItem } = useSidebarNodeFieldsHelper(props)
const isNodeArray = (obj: any): boolean => {
    try {
        return (
            typeof obj.type == 'number'
        )
    } catch {
        return false
    }
}
const getArrayData = (obj: NodeDataArray.AsObject): any[] => {
    switch (obj.type) {
        case ArrayDataType.KEYVALUE:
            return obj.keyvalueitemsList
        case ArrayDataType.STRING:
            return obj.stringitemsList
        case ArrayDataType.INT:
            return obj.intitemsList
        case ArrayDataType.BOOL:
            return obj.boolitemsList
        default:
            return []
    }
}
const { isRunning } = useWorkflowCanvasStore(props.tabid)
</script>

<style scoped src="./Workflow.Sidebar.Node.Fields.styles.css"></style>