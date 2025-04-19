<template>
    <div class="input" v-if="props.nodeType == 'subprocess'">
        <SelectInput 
            v-model="modelValue.subProcessId"
            :options="filteredProcesses"
            :disabled="isRunning"
            label="Subprocess" />
    </div>
    <div v-for="(value, key) in modelValue" :key="key" v-else-if="modelValue.constructor == Object">
        <component :is="getComponent(key, value).component" v-bind="getComponent(key, value).props" v-if="value != null" v-model="modelValue[key]" />
    </div>
</template>

<script setup lang="ts">
import WorkflowNodeSidebarFields from './Workflow.Sidebar.Node.Fields.vue'
import { SidebarNodeProps } from '../Workflow.Sidebar.Node.types'
import { useSidebarNodeHooks } from '../Workflow.Sidebar.Node.hooks'
import { toSentenceCase } from '@/components/Composable/Utilities'
import { useWorkflowCanvasStore } from '@/components/Workflow/Canvas/Workflow.Canvas.hooks'
import { MONACO_EDITOR_DATA_PROPERTIES } from './Workflow.Sidebar.Node.Fields.constants'

import CheckboxInput from '@/components/Composable/UI/Inputs/Checkbox.vue'
import TextInput from '@/components/Composable/UI/Inputs/TextInput.vue'
import SelectInput from '@/components/Composable/UI/Inputs/Select.vue'
import ListInput from '@/components/Composable/UI/Inputs/ListField.vue'

const props = defineProps<SidebarNodeProps>()
const modelValue = defineModel()
const { filteredProcesses, variables } = useSidebarNodeHooks(props.tabid)
const isNodeArray = (obj: any): boolean => {
    try {
        return (
            typeof obj.type == 'number'
        )
    } catch {
        return false
    }
}
const { isRunning } = useWorkflowCanvasStore(props.tabid)

const getComponent = (key: string, value: any) => {
    const label = toSentenceCase(key)
    if (value.constructor === Object) {
        if (isNodeArray(value)) {
            return {
                component: ListInput,
                props: {
                    label,
                    disabled: !isRunning
                }
            }
        } else {
            return {
                component: WorkflowNodeSidebarFields,
                props: {
                    nodeType: props.nodeType,
                    tabid: props.tabid,
                }
            }
        }
    } else {
        switch (value.constructor) {
            case String:
                const enableEditor = MONACO_EDITOR_DATA_PROPERTIES.includes(key)
                return {
                    component: TextInput,
                    props: {
                        label,
                        type: 'text',
                        disabled: !isRunning,
                        editorConfig: enableEditor ? {
                            variables: variables.value,
                            target: '.content'
                        } : null,
                    }
                }
            case Number:
                return {
                    component: TextInput,
                    props: {
                        label,
                        type: 'number',
                        disabled: !isRunning
                    }
                }
            case Boolean:
                return {
                    component: CheckboxInput,
                    props: {
                        label,
                        disabled: !isRunning
                    }
                }
            default:
                return null
        }
    }
}
</script>

<style scoped src="./Workflow.Sidebar.Node.Fields.styles.css"></style>