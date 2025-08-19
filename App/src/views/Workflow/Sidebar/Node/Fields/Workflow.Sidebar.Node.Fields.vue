<template>
    <div class="input" v-if="props.nodeType == 'subprocess'">
        <SelectInput
            :options="filteredProcesses"
            :disabled="isRunning"
            label="Subprocess"
            v-model="modelValue" />
    </div>
    <template v-for="(value, key) in modelValue" :key="key" v-else-if="modelValue && typeof modelValue === 'object'">
        <component :is="getComponent(key, value)?.component" v-bind="getComponent(key, value)?.props" v-if="value != null" v-model="modelValue[key]" />
    </template>
</template>

<script setup lang="ts">
import WorkflowNodeSidebarFields from './Workflow.Sidebar.Node.Fields.vue'
import { SidebarNodeProps } from '../Workflow.Sidebar.Node.types'
import { useSidebarNodeHooks } from '../Workflow.Sidebar.Node.hooks'
import { toSentenceCase } from '@/components/Composable/Utilities'
import { useWorkflowCanvasStore } from '@/views/Workflow/Canvas/Workflow.Canvas.hooks'
import { MONACO_EDITOR_DATA_PROPERTIES } from './Workflow.Sidebar.Node.Fields.constants'
import { Checkbox as CheckboxInput, TextCodeInput, Select as SelectInput, ListField as ListInput } from '@/components/Composable/UI/Inputs'

const props = defineProps<SidebarNodeProps>()
const modelValue = defineModel<Record<string, string>>()
const { filteredProcesses: rawProcesses, variables } = useSidebarNodeHooks(props.tabid)
const filteredProcesses = rawProcesses.value.map((process: any) => ({
    label: process.name,
    value: process.id
}))
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
                    component: TextCodeInput,
                    props: {
                        label,
                        disabled: !isRunning,
                        editorConfig: enableEditor ? {
                            variables: variables.value,
                            target: '.content'
                        } : null,
                    }
                }
            case Number:
                return {
                    component: TextCodeInput,
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