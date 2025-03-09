<template>
    <div class="input" v-if="props.nodeType == 'subprocess'">
        <select class="sidebar-input" v-model="props.modelValue.subProcessId">
            <option v-for="process in filteredProcesses" :value="process.id">{{ process.title }}</option>
        </select>
    </div>
    <div class="input" v-for="(value, key) in props.modelValue" :key="key"
        v-else-if="props.modelValue.constructor == Object">
        <legend class="sidebar-legend">
            <div class="checkbox" v-if="value.constructor == Boolean">
                <input type="checkbox" v-model="props.modelValue[key]" />
                <div class="label">{{ toSentenceCase(key.toString()) }}</div>
            </div>
            <span v-else>{{ toSentenceCase(key.toString()) }}</span>
        </legend>
        <span v-if="value.constructor == String">
            <span v-if="modalStates[key]">test</span>
            <Teleport to=".content" v-if="modalStates[key]">
                <Modal 
                    :title="toSentenceCase(key.toString())" 
                    caption="" 
                    v-model:visible="modalStates[key]"
                >
                    <MonacoEditor v-model="props.modelValue[key]" :variables="variables" />
                </Modal>
            </Teleport>
            <input class="sidebar-input" type="text" v-model="props.modelValue[key]" />
            <span class="material-symbols-outlined show-code-btn" @click="showModal(key)">developer_mode_tv</span>
        </span>
        <input class="sidebar-input" type="number" v-model="props.modelValue[key]" v-if="value.constructor == Number" />
        <div class="array-container" v-if="value.constructor == Array">
            <div class="child-container" v-for="(v, i) in value" :key="v">
                <span class="material-symbols-outlined remove-array" @click="removeArrayItem(i, key)">delete</span>
                <WorkflowNodeSidebarFields :nodeType="props.nodeType" v-model="props.modelValue[key][i]" :tabid="props.tabid" />
            </div>
            <select class="sidebar-input" v-if="props.modelValue[key].length == 0" v-model="arraytype">
                <option value="keyvalue">KeyValue</option>
                <option value="string">String</option>
                <option value="number">Number</option>
                <option value="boolean">Boolean</option>
            </select>
            <div class="btn" @click="addArrayItem(key)">
                <span class="material-symbols-outlined">add</span>
            </div>
        </div>
    </div>
    <div class="input" v-else>
        <input class="sidebar-input" type="text" v-model="props.modelValue" @change="inputHandler($event, emit)"
            v-if="props.modelValue.constructor == String" />
        <input class="sidebar-input" type="number" v-model="props.modelValue" @change="inputHandler($event, emit)"
            v-if="props.modelValue.constructor == Number" />
        <div v-if="props.modelValue.constructor == Boolean">
            <input type="checkbox" v-model="props.modelValue" @change="inputHandler($event, emit)" />
            <label>&nbsp;{{ props.modelValue }}</label>
        </div>
    </div>
</template>

<script setup lang="ts">
import { defineEmits } from 'vue'
import { SidebarNodeProps } from './Workflow.Sidebar.Node.types'
import { useSidebarNodeHooks, useSidebarNodeStore } from './Workflow.Sidebar.Node.hooks'
import { toSentenceCase } from '@/components/Composable/Utilities'
import { showModal, useSidebarNodeFieldsHelper, inputHandler } from './Workflow.Sidebar.Node.helper'
import { EMIT_MODEL } from './Workflow.Sidebar.Node.Fields.constants'

const props = defineProps<SidebarNodeProps>()
const emit = defineEmits([EMIT_MODEL])
const { modalStates, arraytype } = useSidebarNodeStore()
const { filteredProcesses, variables } = useSidebarNodeHooks(props.tabid)
const { removeArrayItem, addArrayItem } = useSidebarNodeFieldsHelper(props)
</script>

<style scoped src="./Workflow.Sidebar.Node.Fields.styles.css"></style>