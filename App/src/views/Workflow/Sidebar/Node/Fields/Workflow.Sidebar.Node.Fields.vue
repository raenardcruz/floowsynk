<template>
    <div class="input" v-if="props.nodeType == 'subprocess'">
        <SelectInput
            :options="filteredProcesses"
            :disabled="disabled"
            label="Subprocess"
            v-model="modelValue" />
    </div>
    <template v-for="(value, key) in modelValue" :key="key" v-else-if="modelValue && typeof modelValue === 'object'">
        <div v-if="value != null" style="margin-top: 8px;">
            <component :is="getComponent(key, value)?.component" v-bind="getComponent(key, value)?.props" v-model="modelValue[key]" />
        </div>
    </template>
</template>

<script setup lang="ts">
import WorkflowNodeSidebarFields from './Workflow.Sidebar.Node.Fields.vue'
import { SidebarNodeProps } from '../Workflow.Sidebar.Node.types'
import { useSidebarNodeHooks } from '../Workflow.Sidebar.Node.hooks'
import { toSentenceCase } from '@/components/Composable/Utilities'
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

const getComponent = (key: string, value: any) => {
    const label = toSentenceCase(key)
    if (value.constructor === Object) {
        if (isNodeArray(value)) {
            return {
                component: ListInput,
                props: {
                    label,
                    disabled: props.disabled
                }
            }
        } else {
            return {
                component: WorkflowNodeSidebarFields,
                props: {
                    nodeType: props.nodeType,
                    tabid: props.tabid,
                    disabled: props.disabled,
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
                        disabled: props.disabled,
                        editorConfig: enableEditor ? {
                            variables: variables.value,
                            target: '.content'
                        } : null
                    }
                }
            case Number:
                return {
                    component: TextCodeInput,
                    props: {
                        label,
                        type: 'number',
                        disabled: props.disabled
                    }
                }
            case Boolean:
                return {
                    component: CheckboxInput,
                    props: {
                        label,
                        disabled: props.disabled
                    }
                }
            default:
                return null
        }
    }
}
</script>

<style scoped src="./Workflow.Sidebar.Node.Fields.styles.css"></style>