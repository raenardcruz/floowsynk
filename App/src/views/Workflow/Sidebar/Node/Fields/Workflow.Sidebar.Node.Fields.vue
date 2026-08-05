<template>
    <div class="input" v-if="props.nodeType == 'subprocess'">
        <SelectInput
            :options="filteredProcesses"
            :disabled="disabled"
            label="Subprocess"
            v-model="modelValue" />
    </div>
    <div v-else-if="props.nodeType === 'webhook' && modelValue" class="webhook-config" style="display: flex; flex-direction: column; gap: 12px; padding: 4px;">
        <div>
            <label style="font-weight: 600; font-size: 0.85rem; color: var(--text-color); display: block; margin-bottom: 4px;">Webhook Secret Token</label>
            <div style="display: flex; gap: 8px;">
                <TextInput placeholder="Secret key (optional)" v-model="modelValue['value']" style="flex: 1;" :disabled="disabled" />
                <button type="button" @click="modelValue['value'] = generateRandomSecret()" :disabled="disabled" style="background: var(--primary-color); color: white; border: none; border-radius: 4px; padding: 0 12px; cursor: pointer; font-size: 0.8rem; font-weight: 500;">Generate</button>
            </div>
            <small style="color: var(--text-color-secondary); font-size: 0.75rem; margin-top: 4px; display: block;">If set, requests must include the <code>X-Webhook-Secret</code> header.</small>
        </div>

        <div style="padding: 8px; background: rgba(0,0,0,0.15); border-radius: 4px; border: 1px solid rgba(255,255,255,0.08);">
            <label style="font-weight: 600; font-size: 0.8rem; color: var(--primary-color); display: block; margin-bottom: 4px;">API Webhook Trigger URL</label>
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
                <code style="word-break: break-all; font-size: 0.8rem; color: #ffca28;">http://localhost:8082/api/webhook/{{ tab.id }}</code>
                <button type="button" @click="copyToClipboard(`http://localhost:8082/api/webhook/${tab.id}`)" style="background: transparent; border: none; color: var(--text-color-secondary); cursor: pointer; padding: 4px; display: flex; align-items: center;"><span class="material-symbols-outlined" style="font-size: 1.15rem;">content_copy</span></button>
            </div>
        </div>

        <div>
            <label style="font-weight: 600; font-size: 0.8rem; color: var(--text-color); display: block; margin-bottom: 4px;">cURL Exporter</label>
            <div style="position: relative;">
                <pre style="margin: 0; padding: 8px; font-size: 0.75rem; background: #1e1e1e; border-radius: 4px; overflow-x: auto; color: #e0e0e0; font-family: monospace; border: 1px solid rgba(255,255,255,0.05); line-height: 1.4;">{{ curlCommand }}</pre>
                <button type="button" @click="copyToClipboard(curlCommand)" style="position: absolute; top: 4px; right: 4px; background: rgba(0,0,0,0.5); border: none; color: white; border-radius: 4px; padding: 4px; cursor: pointer; display: flex; align-items: center;"><span class="material-symbols-outlined" style="font-size: 0.95rem;">content_copy</span></button>
            </div>
        </div>
    </div>
    <div v-else-if="props.nodeType === 'interval' && modelValue" class="interval-config" style="display: flex; flex-direction: column; gap: 12px; padding: 4px;">
        <div>
            <label style="font-weight: 600; font-size: 0.85rem; color: var(--text-color); display: block; margin-bottom: 4px;">Interval Value</label>
            <TextInput v-model="modelValue['interval']" :disabled="disabled" />
        </div>
        <div>
            <label style="font-weight: 600; font-size: 0.85rem; color: var(--text-color); display: block; margin-bottom: 4px;">Interval Unit</label>
            <SelectInput
                :options="[
                    { label: 'Seconds', value: 'seconds' },
                    { label: 'Minutes', value: 'minutes' },
                    { label: 'Hours', value: 'hours' },
                    { label: 'Days', value: 'days' }
                ]"
                :disabled="disabled"
                v-model="modelValue['type']" />
        </div>
        <div>
            <label style="font-weight: 600; font-size: 0.85rem; color: var(--text-color); display: block; margin-bottom: 4px;">Active Days of the Week</label>
            <div style="display: flex; gap: 4px; justify-content: space-between; margin-top: 4px;" v-if="modelValue['weeks'] && modelValue['weeks'].boolitemsList">
                <button 
                    v-for="(day, idx) in ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']" 
                    :key="idx"
                    type="button"
                    :disabled="disabled"
                    @click="modelValue['weeks'].boolitemsList[idx] = !modelValue['weeks'].boolitemsList[idx]"
                    :style="{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        border: '1px solid rgba(255,255,255,0.1)',
                        background: modelValue['weeks'].boolitemsList[idx] ? 'var(--primary-color)' : 'rgba(255,255,255,0.05)',
                        color: modelValue['weeks'].boolitemsList[idx] ? 'white' : 'var(--text-color-secondary)',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        cursor: disabled ? 'default' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: disabled ? 0.6 : 1
                    }"
                >
                    {{ day }}
                </button>
            </div>
        </div>
    </div>
    <template v-for="(value, key) in modelValue" :key="key" v-else-if="modelValue && typeof modelValue === 'object'">
        <div v-if="value != null" style="margin-top: 8px;">
            <component :is="getComponent(key, value)?.component" v-bind="getComponent(key, value)?.props" v-model="modelValue[key]" />
        </div>
    </template>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import WorkflowNodeSidebarFields from './Workflow.Sidebar.Node.Fields.vue'
import { SidebarNodeProps } from '../Workflow.Sidebar.Node.types'
import { useSidebarNodeHooks } from '../Workflow.Sidebar.Node.hooks'
import { toSentenceCase } from '@/components/Composable/Utilities'
import { MONACO_EDITOR_DATA_PROPERTIES } from './Workflow.Sidebar.Node.Fields.constants'
import { Checkbox as CheckboxInput, TextCodeInput, Select as SelectInput, ListField as ListInput, TextInput } from '@/components/Composable/UI/Inputs'
import { useTab } from '@/views/Workflow'

const props = defineProps<SidebarNodeProps>()
const modelValue = defineModel<Record<string, any>>()
const { tab } = useTab(props.tabid)

const generateRandomSecret = () => {
    return Array.from(crypto.getRandomValues(new Uint8Array(16)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
}

const curlCommand = computed(() => {
    const secret = modelValue.value ? modelValue.value['value'] : '';
    const header = secret ? `-H "X-Webhook-Secret: ${secret}" \\\n  ` : '';
    return `curl -X POST \\\n  -H "Content-Type: application/json" \\\n  ${header}http://localhost:8082/api/webhook/${tab.value.id}`;
})
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
                            variables: variables.value
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