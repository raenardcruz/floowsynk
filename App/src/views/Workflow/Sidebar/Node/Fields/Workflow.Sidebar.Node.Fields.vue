<template>
    <div class="input" v-if="props.nodeType == 'subprocess'">
        <SelectInput
            :options="filteredProcesses"
            :disabled="disabled"
            label="Subprocess"
            v-model="modelValue" />
    </div>
    <div v-else-if="props.nodeType === 'connector' && modelValue" class="connector-config" style="display: flex; flex-direction: column; gap: 12px; padding: 4px;">
        <div>
            <label style="font-weight: 600; font-size: 0.85rem; color: var(--text-color); display: block; margin-bottom: 4px;">Connection</label>
            <SelectInput
                :options="connectionOptions"
                :disabled="disabled"
                v-model="modelValue['listvar']"
                placeholder="Select a Connection" />
        </div>
        <div>
            <label style="font-weight: 600; font-size: 0.85rem; color: var(--text-color); display: block; margin-bottom: 4px;">Action</label>
            <SelectInput
                :options="actionOptions"
                :disabled="disabled"
                v-model="modelValue['type']"
                placeholder="Select an Action" />
        </div>
        <!-- Required Fields for Selected Action -->
        <div v-if="actionRequiredFields.length > 0" class="action-required-fields" style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 10px; display: flex; flex-direction: column; gap: 10px;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
                <span style="font-weight: 600; font-size: 0.8rem; color: #ffca28; display: flex; align-items: center; gap: 6px;">
                    <i class="pi pi-exclamation-circle"></i> Required Action Parameters
                </span>
                <span class="badge" style="font-size: 0.7rem; background: rgba(255, 202, 40, 0.2); color: #ffca28; padding: 2px 6px; border-radius: 4px; font-weight: 600;">
                    {{ actionRequiredFields.length }} required
                </span>
            </div>
            <div v-for="field in actionRequiredFields" :key="field.key" class="form-group" style="display: flex; flex-direction: column; gap: 4px;">
                <label :for="'field-' + field.key" style="font-size: 0.8rem; color: var(--text-color); font-weight: 500;">
                    {{ field.label }} <span style="color: #ff5252;">*</span>
                </label>
                <TextCodeInput
                    :id="'field-' + field.key"
                    :placeholder="field.placeholder"
                    :disabled="disabled"
                    :editorConfig="disabled || MONACO_EDITOR_DATA_PROPERTIES.includes(field.key) ? { variables: variables, target: 'body' } : null"
                    :modelValue="actionFieldValues[field.key] || ''"
                    @update:modelValue="(val: any) => updateActionFieldValue(field.key, String(val))"
                    class="w-full"
                />
            </div>
        </div>
        <div>
            <label style="font-weight: 600; font-size: 0.85rem; color: var(--text-color); display: block; margin-bottom: 4px;">Input Payload (JSON)</label>
            <TextCodeInput
                v-model="modelValue['payload']"
                label="Payload"
                :disabled="disabled"
                :editorConfig="{ variables: variables, target: 'body' }" />
        </div>
        <div>
            <label style="font-weight: 600; font-size: 0.85rem; color: var(--text-color); display: block; margin-bottom: 4px;">Output Variable</label>
            <TextCodeInput
                v-model="modelValue['variable']"
                placeholder="e.g. response"
                :disabled="disabled"
                :editorConfig="disabled ? { variables: variables, target: 'body' } : null" />
        </div>
    </div>
    <div v-else-if="props.nodeType === 'webhook' && modelValue" class="webhook-config" style="display: flex; flex-direction: column; gap: 12px; padding: 4px;">
        <div>
            <label style="font-weight: 600; font-size: 0.85rem; color: var(--text-color); display: block; margin-bottom: 4px;">Webhook Secret Token</label>
            <div style="display: flex; gap: 8px;">
                <TextCodeInput placeholder="Secret key (optional)" v-model="modelValue['value']" style="flex: 1;" :disabled="disabled" :editorConfig="disabled || MONACO_EDITOR_DATA_PROPERTIES.includes('value') ? { variables: variables, target: 'body' } : null" />
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
            <TextCodeInput v-model="modelValue['interval']" :disabled="disabled" :editorConfig="disabled ? { variables: variables, target: 'body' } : null" />
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
    <div v-else-if="modelValue != null" style="margin-top: 8px;">
        <TextCodeInput
            :modelValue="String(modelValue)"
            :disabled="disabled"
            :editorConfig="disabled ? { variables: variables, target: 'body' } : null"
            @update:modelValue="modelValue = $event"
        />
    </div>
</template>

<script setup lang="ts">
import { computed, ref, reactive, watch, onMounted } from 'vue'
import WorkflowNodeSidebarFields from './Workflow.Sidebar.Node.Fields.vue'
import { SidebarNodeProps } from '../Workflow.Sidebar.Node.types'
import { useSidebarNodeHooks } from '../Workflow.Sidebar.Node.hooks'
import { toSentenceCase } from '@/components/Composable/Utilities'
import { MONACO_EDITOR_DATA_PROPERTIES } from './Workflow.Sidebar.Node.Fields.constants'
import { Checkbox as CheckboxInput, TextCodeInput, Select as SelectInput, ListField as ListInput } from '@/components/Composable/UI/Inputs'
import { useTab } from '@/views/Workflow'
import { getConnections } from '@/views/Connectors/Connectors.api'

const props = defineProps<SidebarNodeProps>()
const disabled = computed(() => props.disabled)
const modelValue = defineModel<any>()
const { tab } = useTab(props.tabid)

const connectionsList = ref<any[]>([])
const templatesList = ref<any[]>([])

const fetchConnectorData = async () => {
    try {
        const connRes = await getConnections()
        connectionsList.value = connRes.toObject().connectionsList || []

        const tempRes = await fetch('http://localhost:8083/api/connectors/templates')
        if (tempRes.ok) {
            templatesList.value = await tempRes.json()
        }
    } catch (err) {
        console.error("Failed to load connector data in sidebar:", err)
    }
}

onMounted(() => {
    fetchConnectorData()
})

const connectionOptions = computed(() => {
    return connectionsList.value.map(c => ({
        label: `${c.name} (${c.connectorid || c.connectorId})`,
        value: c.id
    }))
})

const actionOptions = computed(() => {
    const val = modelValue.value
    if (!val || !val['listvar']) return []
    const selectedConn = connectionsList.value.find(c => c.id === val['listvar'])
    if (!selectedConn) return []
    const connectorId = selectedConn.connectorid || selectedConn.connectorId
    const selectedTemp = templatesList.value.find(t => t.id === connectorId)
    if (!selectedTemp || !selectedTemp.actions) return []
    return selectedTemp.actions.map((a: any) => ({
        label: a.name,
        value: a.id
    }))
})

const selectedActionObj = computed(() => {
    const val = modelValue.value
    if (!val || !val['listvar'] || !val['type']) return null
    const selectedConn = connectionsList.value.find(c => c.id === val['listvar'])
    if (!selectedConn) return null
    const connectorId = selectedConn.connectorid || selectedConn.connectorId
    const selectedTemp = templatesList.value.find(t => t.id === connectorId)
    if (!selectedTemp || !selectedTemp.actions) return null
    return selectedTemp.actions.find((a: any) => a.id === val['type']) || null
})

interface ActionFieldInfo {
    key: string
    label: string
    required: boolean
    placeholder?: string
}

const actionRequiredFields = computed<ActionFieldInfo[]>(() => {
    const action = selectedActionObj.value
    if (!action) return []

    const fieldsMap = new Map<string, ActionFieldInfo>()

    // 1. Explicit fields array on action
    if (Array.isArray(action.fields)) {
        for (const f of action.fields) {
            if (f.key) {
                fieldsMap.set(f.key, {
                    key: f.key,
                    label: f.label || toSentenceCase(f.key),
                    required: f.required !== false,
                    placeholder: f.placeholder || `Enter ${toSentenceCase(f.key)}`
                })
            }
        }
    }

    // 2. Extract placeholders {{var}} from path, queryParams, and payloadTemplate
    const extractVars = (str?: string) => {
        if (!str) return
        const matches = str.matchAll(/\{\{([a-zA-Z0-9_]+)\}\}/g)
        for (const m of matches) {
            const key = m[1]
            if (!fieldsMap.has(key)) {
                fieldsMap.set(key, {
                    key,
                    label: toSentenceCase(key),
                    required: true,
                    placeholder: `Enter ${toSentenceCase(key)}`
                })
            }
        }
    }

    extractVars(action.path)
    if (Array.isArray(action.queryParams)) {
        action.queryParams.forEach((q: string) => extractVars(q))
    }
    extractVars(action.payloadTemplate)

    return Array.from(fieldsMap.values())
})

const actionFieldValues = reactive<Record<string, string>>({})

const syncActionFieldValuesFromPayload = () => {
    if (modelValue.value && modelValue.value['payload']) {
        try {
            const parsed = JSON.parse(modelValue.value['payload'])
            if (typeof parsed === 'object' && parsed !== null) {
                Object.keys(parsed).forEach(k => {
                    actionFieldValues[k] = String(parsed[k])
                })
            }
        } catch {
            // ignore non-JSON payload
        }
    }
}

watch(selectedActionObj, () => {
    syncActionFieldValuesFromPayload()
}, { immediate: true })

const updateActionFieldValue = (key: string, val: string) => {
    actionFieldValues[key] = val
    let currentPayload: Record<string, any> = {}
    if (modelValue.value && modelValue.value['payload']) {
        try {
            currentPayload = JSON.parse(modelValue.value['payload'])
        } catch {
            currentPayload = {}
        }
    }
    currentPayload[key] = val
    if (modelValue.value) {
        modelValue.value['payload'] = JSON.stringify(currentPayload, null, 2)
    }
}

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

const getComponent = (key: string | number, value: any) => {
    const keyStr = String(key)
    const label = toSentenceCase(keyStr)
    if (value != null && typeof value === 'object' && value.constructor === Object) {
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
        const ctor = value != null ? value.constructor : String
        switch (ctor) {
            case String:
                const enableEditor = MONACO_EDITOR_DATA_PROPERTIES.includes(keyStr) || Boolean(props.disabled)
                return {
                    component: TextCodeInput,
                    props: {
                        label,
                        disabled: props.disabled,
                        editorConfig: enableEditor ? {
                            variables: variables.value,
                            target: 'body'
                        } : null
                    }
                }
            case Number:
                return {
                    component: TextCodeInput,
                    props: {
                        label,
                        type: 'number',
                        disabled: props.disabled,
                        editorConfig: props.disabled ? {
                            variables: variables.value,
                            target: 'body'
                        } : null
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
                return {
                    component: TextCodeInput,
                    props: {
                        label,
                        disabled: props.disabled,
                        editorConfig: props.disabled ? {
                            variables: variables.value,
                            target: 'body'
                        } : null
                    }
                }
        }
    }
}
</script>

<style scoped src="./Workflow.Sidebar.Node.Fields.styles.css"></style>