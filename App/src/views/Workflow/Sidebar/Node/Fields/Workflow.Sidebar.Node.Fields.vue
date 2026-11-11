<template>
    <!-- Available Variables (Drag or Click to Insert) -->
    <div v-if="!props.isNested && variables && variables.length > 0" class="variables-pill-bar">
        <div class="variables-pill-bar__header" @click="isVariablesCollapsed = !isVariablesCollapsed">
            <div class="variables-pill-bar__title">
                <span class="material-symbols-outlined variables-pill-bar__icon">data_object</span>
                <span>Available Variables (Drag or Click)</span>
                <span class="variables-pill-bar__badge">{{ filteredVariables.length }}</span>
            </div>
            <span
                class="material-symbols-outlined variables-pill-bar__chevron"
                :class="{ 'collapsed': isVariablesCollapsed }"
            >
                expand_more
            </span>
        </div>
        <div v-if="!isVariablesCollapsed" class="variables-pill-bar__search-box" @click.stop>
            <input
                type="text"
                v-model="variableFilter"
                placeholder="Search variables (e.g. input, name)..."
                class="variables-pill-bar__search-input"
            />
            <span v-if="variableFilter" class="material-symbols-outlined variables-pill-bar__clear" @click="variableFilter = ''">close</span>
        </div>
        <div v-if="!isVariablesCollapsed" class="variables-pill-bar__list">
            <button
                v-for="v in filteredVariables"
                :key="v"
                type="button"
                class="variables-pill-bar__pill"
                :class="{ 'variables-pill-bar__pill--copied': copiedVar === v }"
                :draggable="true"
                @dragstart="onVariableDragStart($event, v)"
                @mousedown.prevent
                @click="insertOrCopyVariable(v)"
                :title="formatPillTitle(v)"
            >
                <span class="material-symbols-outlined variables-pill-bar__drag-handle">drag_indicator</span>
                <span v-if="copiedVar === v" class="material-symbols-outlined variables-pill-bar__check">check</span>
                <span>{{ formatPillLabel(v) }}</span>
            </button>
        </div>
    </div>

    <!-- Pinned Mock Output Panel -->
    <div v-if="!props.isNested && modelValue" class="pinned-data-panel">
        <div class="pinned-data-panel__header" @click="isPinCollapsed = !isPinCollapsed">
            <div class="pinned-data-panel__title">
                <span class="material-symbols-outlined pinned-data-panel__icon" :class="{ 'pinned-active': isPinnedActive }">push_pin</span>
                <span>Pinned Mock Output</span>
                <span v-if="isPinnedActive" class="pinned-data-panel__badge">ACTIVE</span>
            </div>
            <div class="pinned-data-panel__actions" @click.stop>
                <button
                    type="button"
                    class="pinned-toggle-btn"
                    :class="{ 'pinned-toggle-btn--active': isPinnedActive }"
                    @click="togglePinData"
                >
                    {{ isPinnedActive ? 'Pinned' : 'Pin Data' }}
                </button>
                <span
                    class="material-symbols-outlined variables-pill-bar__chevron"
                    :class="{ 'collapsed': isPinCollapsed }"
                    @click="isPinCollapsed = !isPinCollapsed"
                >
                    expand_more
                </span>
            </div>
        </div>
        <div v-if="!isPinCollapsed && isPinnedActive" class="pinned-data-panel__body">
            <div class="pinned-data-notice">
                <span class="material-symbols-outlined">info</span>
                <span>When pinned, execution returns this mock output and skips live API calls.</span>
            </div>
            <div class="pinned-data-controls">
                <button type="button" class="pinned-btn" @click="formatPinnedJson" title="Prettify JSON">
                    <span class="material-symbols-outlined">code</span> Format JSON
                </button>
                <button type="button" class="pinned-btn" @click="pinLastRunData" title="Capture from Last Run" v-if="hasLastRunData">
                    <span class="material-symbols-outlined">history</span> Use Last Run
                </button>
                <button type="button" class="pinned-btn pinned-btn--danger" @click="clearPinnedData" title="Clear Pin">
                    <span class="material-symbols-outlined">delete</span> Clear
                </button>
            </div>
            <textarea
                class="pinned-data-textarea"
                v-model="modelValue['pinneddata']"
                placeholder='e.g. {"status": "success", "user": {"id": 123, "name": "Jane Doe"}}'
                rows="4"
            ></textarea>
        </div>
    </div>

    <div class="input" v-if="props.nodeType == 'subprocess'">
        <SelectInput
            :options="filteredProcesses"
            :disabled="disabled"
            label="Subprocess"
            v-model="modelValue" />
    </div>
    <div v-else-if="props.nodeType === 'rag' && modelValue" class="rag-config" style="display: flex; flex-direction: column; gap: 12px; padding: 4px;">
        <div>
            <label style="font-weight: 600; font-size: 0.85rem; color: var(--text-color); display: block; margin-bottom: 4px;">RAG Connection (Ollama)</label>
            <SelectInput
                :options="ragConnectionOptions"
                :disabled="disabled"
                :modelValue="modelValue['ragconnectionid'] || modelValue['ragConnectionId'] || ''"
                @update:modelValue="(val: any) => { modelValue['ragconnectionid'] = val; modelValue['ragConnectionId'] = val; }"
                placeholder="Select RAG Knowledge Base" />
            <div v-if="selectedRagConn" style="font-size: 0.78rem; padding: 8px 10px; background: rgba(99, 102, 241, 0.08); border-radius: 8px; border: 1px solid rgba(99, 102, 241, 0.2); color: var(--text-color); margin-top: 4px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                    <span><strong>Provider:</strong> Ollama</span>
                    <span style="opacity: 0.8;">{{ selectedRagConn.documentcount || 0 }} docs ({{ selectedRagConn.chunkcount || 0 }} chunks)</span>
                </div>
                <div><strong>Chat LLM:</strong> <code>{{ selectedRagConn.chatmodel }}</code></div>
                <div><strong>Embedding:</strong> <code>{{ selectedRagConn.embeddingmodel }}</code></div>
            </div>
        </div>
        <div>
            <label style="font-weight: 600; font-size: 0.85rem; color: var(--text-color); display: block; margin-bottom: 4px;">LLM Summarizer Connection (Optional)</label>
            <SelectInput
                :options="ragLlmConnectionOptions"
                :disabled="disabled"
                :modelValue="modelValue['ragllmconnectionid'] || modelValue['ragLlmConnectionId'] || ''"
                @update:modelValue="(val: any) => { modelValue['ragllmconnectionid'] = val; modelValue['ragLlmConnectionId'] = val; }"
                placeholder="Default (Ollama Knowledge Base)" />
        </div>
        <div>
            <label style="font-weight: 600; font-size: 0.85rem; color: var(--text-color); display: block; margin-bottom: 4px;">User Question / Prompt Template</label>
            <TextCodeInput
                v-model="modelValue['ragprompt']"
                placeholder="e.g. {{input}} or Summarize document context for question"
                :disabled="disabled"
                :editorConfig="{ variables: variables, target: 'body' }" />
        </div>
        <div>
            <label style="font-weight: 600; font-size: 0.85rem; color: var(--text-color); display: block; margin-bottom: 4px;">Top-K Chunks to Retrieve</label>
            <TextCodeInput
                v-model="modelValue['ragtopk']"
                type="number"
                placeholder="3"
                :disabled="disabled" />
        </div>
        <div>
            <label style="font-weight: 600; font-size: 0.85rem; color: var(--text-color); display: block; margin-bottom: 4px;">System Prompt (Optional)</label>
            <TextCodeInput
                v-model="modelValue['ragsystemprompt']"
                placeholder="Custom instructions for Ollama LLM"
                :disabled="disabled"
                :editorConfig="{ variables: variables, target: 'body' }" />
        </div>
        <div>
            <label style="font-weight: 600; font-size: 0.85rem; color: var(--text-color); display: block; margin-bottom: 4px;">Output Variable Name</label>
            <TextCodeInput
                v-model="modelValue['ragoutputvar']"
                placeholder="rag_output"
                :disabled="disabled" />
        </div>
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
                <code style="word-break: break-all; font-size: 0.8rem; color: #ffca28;">{{ webhookUrl }}</code>
                <button type="button" @click="copyToClipboard(webhookUrl)" style="background: transparent; border: none; color: var(--text-color-secondary); cursor: pointer; padding: 4px; display: flex; align-items: center;"><span class="material-symbols-outlined" style="font-size: 1.15rem;">content_copy</span></button>
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
    <div v-else-if="props.nodeType === 'code' && modelValue" class="code-node-config" style="display: flex; flex-direction: column; gap: 12px; padding: 4px;">
        <div style="background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.25); border-radius: 6px; padding: 10px; font-size: 0.8rem; color: #fbbf24; line-height: 1.4;">
            <div style="font-weight: 600; margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
                <span class="material-symbols-outlined" style="font-size: 1rem;">code</span>
                <span>JavaScript Sandbox (Goja)</span>
            </div>
            <div>
                • <code>$input</code> / <code>input</code>: Previous node output<br>
                • <code>$vars</code> / <code>variables</code>: Process variables<br>
                • <code>console.log(...)</code>: Captured into execution logs<br>
                • Return any value (e.g. <code>return items.map(...)</code>)
            </div>
        </div>
        <div>
            <label style="font-weight: 600; font-size: 0.85rem; color: var(--text-color); display: block; margin-bottom: 4px;">Script</label>
            <TextCodeInput
                v-model="modelValue['value']"
                :disabled="disabled"
                placeholder="// Enter JavaScript here..."
                :editorConfig="{ variables: variables, target: 'body' }"
            />
        </div>
        <div>
            <label style="font-weight: 600; font-size: 0.85rem; color: var(--text-color); display: block; margin-bottom: 4px;">Output Variable Name (Optional)</label>
            <TextCodeInput
                v-model="modelValue['variable']"
                placeholder="e.g. code_output"
                :disabled="disabled"
            />
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
import { getRagConnections } from '@/views/Rag/Rag.api'
import { getRestUrl } from '@/components/Composable/constants'
import { useWorkflowCanvasStore } from '@/views/Workflow/Canvas/Workflow.Canvas.hooks'

interface Props extends SidebarNodeProps {
    isNested?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    isNested: false
})
const disabled = computed(() => props.disabled)
const modelValue = defineModel<any>()
const { tab } = useTab(props.tabid)

const connectionsList = ref<any[]>([])
const ragConnectionsList = ref<any[]>([])
const templatesList = ref<any[]>([])

const fetchConnectorData = async () => {
    try {
        const connRes = await getConnections()
        connectionsList.value = connRes.toObject().connectionsList || []

        const tempRes = await fetch(`${getRestUrl()}/api/connectors/templates`)
        if (tempRes.ok) {
            templatesList.value = await tempRes.json()
        }

        ragConnectionsList.value = await getRagConnections()
        if (props.nodeType === 'rag' && modelValue.value) {
            if (!modelValue.value['ragconnectionid'] && modelValue.value['ragConnectionId']) {
                modelValue.value['ragconnectionid'] = modelValue.value['ragConnectionId']
            }
            if (!modelValue.value['ragconnectionid'] && ragConnectionsList.value.length === 1) {
                const singleId = ragConnectionsList.value[0].id
                modelValue.value['ragconnectionid'] = singleId
                modelValue.value['ragConnectionId'] = singleId
            }
        }
    } catch (err) {
        console.error("Failed to load connector/RAG data in sidebar:", err)
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

const ragConnectionOptions = computed(() => {
    return ragConnectionsList.value.map(c => ({
        label: `${c.name} (${c.chatmodel})`,
        value: c.id
    }))
})

const ragLlmConnectionOptions = computed(() => {
    const list = [{ label: 'Default (Ollama Knowledge Base)', value: '' }]
    const llmConns = connectionsList.value
        .filter(c => ['google_gemini', 'ollama', 'openai', 'anthropic'].includes((c.connectorid || c.connectorId || '').toLowerCase()))
        .map(c => ({
            label: `${c.name} (${c.connectorid || c.connectorId})`,
            value: c.id
        }))
    return [...list, ...llmConns]
})

const selectedRagConn = computed(() => {
    const val = modelValue.value
    if (!val) return null
    const id = val['ragconnectionid'] || val['ragConnectionId']
    if (!id) return null
    return ragConnectionsList.value.find(c => c.id === id) || null
})

// Auto-select first Ollama RAG connection if none is selected
watch(ragConnectionsList, (conns) => {
    if (props.nodeType === 'rag' && modelValue.value && conns.length > 0) {
        const currentId = modelValue.value['ragconnectionid'] || modelValue.value['ragConnectionId']
        if (!currentId) {
            modelValue.value['ragconnectionid'] = conns[0].id
            modelValue.value['ragConnectionId'] = conns[0].id
        }
    }
}, { immediate: true })

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

const isVariablesCollapsed = ref(false)
const copiedVar = ref<string | null>(null)
let copyTimeout: ReturnType<typeof setTimeout> | undefined = undefined

const copyToClipboard = (text: string) => {
    if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(text).catch(() => {
            fallbackCopy(text)
        })
    } else {
        fallbackCopy(text)
    }
}

const fallbackCopy = (text: string) => {
    try {
        const textArea = document.createElement('textarea')
        textArea.value = text
        textArea.style.position = 'fixed'
        textArea.style.opacity = '0'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
    } catch (e) {
        console.error('Fallback copy failed', e)
    }
}

const insertOrCopyVariable = (varName: string) => {
    const pillText = varName.startsWith('.') ? `{{${varName}}}` : `{{.${varName}}}`

    // Attempt to insert / append into the active input or textarea if one is currently focused
    const activeEl = document.activeElement as HTMLInputElement | HTMLTextAreaElement | null
    if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA') && !activeEl.disabled && !activeEl.readOnly) {
        const start = activeEl.selectionStart ?? activeEl.value.length
        const end = activeEl.selectionEnd ?? activeEl.value.length
        const val = activeEl.value || ''
        activeEl.value = val.substring(0, start) + pillText + val.substring(end)
        const nextPos = start + pillText.length
        activeEl.setSelectionRange(nextPos, nextPos)
        activeEl.dispatchEvent(new Event('input', { bubbles: true }))
        activeEl.dispatchEvent(new Event('change', { bubbles: true }))
    }

    // Always copy to clipboard as well
    copyToClipboard(pillText)

    // Visual feedback
    copiedVar.value = varName
    if (copyTimeout) clearTimeout(copyTimeout)
    copyTimeout = setTimeout(() => {
        if (copiedVar.value === varName) {
            copiedVar.value = null
        }
    }, 1500)
}

const formatPillLabel = (v: string) => {
    if (copiedVar.value === v) return 'Copied!'
    return v.startsWith('.') ? `{{${v}}}` : `{{.${v}}}`
}

const formatPillTitle = (v: string) => {
    const text = v.startsWith('.') ? `{{${v}}}` : `{{.${v}}}`
    return `Click to copy ${text} or insert`
}

const webhookUrl = computed(() => {
    return `${getRestUrl()}/api/webhook/${tab.value.id}`;
})

const curlCommand = computed(() => {
    const secret = modelValue.value ? modelValue.value['value'] : '';
    const header = secret ? `-H "X-Webhook-Secret: ${secret}" \\\n  ` : '';
    return `curl -X POST \\\n  -H "Content-Type: application/json" \\\n  ${header}${webhookUrl.value}`;
})
const { filteredProcesses: rawProcesses, variables } = useSidebarNodeHooks(props.tabid)
const variableFilter = ref('')
const filteredVariables = computed(() => {
    if (!variables.value) return []
    if (!variableFilter.value.trim()) return variables.value
    const q = variableFilter.value.toLowerCase().trim()
    return variables.value.filter(v => v.toLowerCase().includes(q))
})

const onVariableDragStart = (event: DragEvent, varName: string) => {
    const pillText = varName.startsWith('.') ? `{{${varName}}}` : `{{.${varName}}}`
    if (event.dataTransfer) {
        event.dataTransfer.setData('text/plain', pillText)
        event.dataTransfer.effectAllowed = 'copy'
    }
}

// Pinned Data State & Methods
const isPinCollapsed = ref(false)
const isPinnedActive = computed(() => {
    if (!modelValue.value) return false
    return Boolean(modelValue.value['pinneddata'] || (modelValue.value['value'] && String(modelValue.value['value']).startsWith('__PINNED__:')))
})

const togglePinData = () => {
    if (!modelValue.value) return
    if (isPinnedActive.value) {
        clearPinnedData()
    } else {
        modelValue.value['pinneddata'] = '{\n  "status": "success",\n  "mock": true\n}'
        isPinCollapsed.value = false
    }
}

const clearPinnedData = () => {
    if (!modelValue.value) return
    delete modelValue.value['pinneddata']
    if (modelValue.value['value'] && String(modelValue.value['value']).startsWith('__PINNED__:')) {
        modelValue.value['value'] = ''
    }
}

const formatPinnedJson = () => {
    if (!modelValue.value || !modelValue.value['pinneddata']) return
    try {
        const parsed = JSON.parse(modelValue.value['pinneddata'])
        modelValue.value['pinneddata'] = JSON.stringify(parsed, null, 2)
    } catch {
        // keep as is
    }
}

const { replayData } = useWorkflowCanvasStore(props.tabid)
const hasLastRunData = computed(() => {
    if (!replayData?.value || replayData.value.length === 0) return false
    return true
})

const pinLastRunData = () => {
    if (!modelValue.value || !replayData?.value) return
    const lastRun = replayData.value[replayData.value.length - 1]
    if (lastRun && lastRun.variables) {
        modelValue.value['pinneddata'] = JSON.stringify(lastRun.variables, null, 2)
        isPinCollapsed.value = false
    }
}

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
                    isNested: true
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
<style scoped>
.variables-pill-bar {
    display: flex;
    flex-direction: column;
    background: var(--surface-subtle);
    border: 1px solid var(--border-subtle);
    border-radius: 10px;
    margin-bottom: 14px;
    overflow: hidden;
}

.variables-pill-bar__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    cursor: pointer;
    user-select: none;
    background: var(--surface-subtle);
    border-bottom: 1px solid var(--border-subtle);
    transition: background 0.15s ease;
}

.variables-pill-bar__header:hover {
    background: var(--surface-elevated);
}

.variables-pill-bar__title {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--text-main);
}

.variables-pill-bar__icon {
    font-size: 1rem;
    color: #6366f1;
}

.variables-pill-bar__badge {
    background: rgba(99, 102, 241, 0.15);
    color: #4f46e5;
    font-size: 0.7rem;
    padding: 2px 7px;
    border-radius: 10px;
    font-weight: 700;
}
[data-theme="dark"] .variables-pill-bar__badge {
    background: rgba(99, 102, 241, 0.25);
    color: #a5b4fc;
}

.variables-pill-bar__chevron {
    font-size: 1.1rem;
    color: var(--text-muted);
    transition: transform 0.2s ease;
}

.variables-pill-bar__chevron.collapsed {
    transform: rotate(-90deg);
}

.variables-pill-bar__list {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    padding: 10px;
    max-height: 130px;
    overflow-y: auto;
}

.variables-pill-bar__pill {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 9px;
    border-radius: 12px;
    font-size: 0.75rem;
    font-family: monospace;
    cursor: pointer;
    background: var(--surface-elevated);
    border: 1px solid var(--border-subtle);
    color: var(--text-main);
    transition: all 0.15s ease;
    white-space: nowrap;
}

.variables-pill-bar__pill:hover {
    background: rgba(99, 102, 241, 0.12);
    border-color: #6366f1;
    color: #4f46e5;
}
[data-theme="dark"] .variables-pill-bar__pill:hover {
    color: #c7d2fe;
}

.variables-pill-bar__pill--copied {
    background: rgba(34, 197, 94, 0.2) !important;
    border-color: #22c55e !important;
    color: #15803d !important;
}
[data-theme="dark"] .variables-pill-bar__pill--copied {
    color: #4ade80 !important;
}

.variables-pill-bar__check {
    font-size: 0.85rem;
    color: #16a34a;
}
[data-theme="dark"] .variables-pill-bar__check {
    color: #4ade80;
}

/* Variable Filter Search Input */
.variables-pill-bar__search-box {
    position: relative;
    display: flex;
    align-items: center;
    padding: 6px 10px;
    background: var(--surface-elevated);
    border-bottom: 1px solid var(--border-subtle);
}

.variables-pill-bar__search-input {
    width: 100%;
    background: transparent;
    border: none;
    font-size: 0.75rem;
    color: var(--text-main);
    outline: none;
}

.variables-pill-bar__clear {
    font-size: 0.9rem;
    color: var(--text-muted);
    cursor: pointer;
}

.variables-pill-bar__drag-handle {
    font-size: 0.8rem;
    color: var(--text-muted);
    opacity: 0.6;
}

/* Pinned Data Panel */
.pinned-data-panel {
    display: flex;
    flex-direction: column;
    background: var(--surface-subtle);
    border: 1px solid var(--border-subtle);
    border-radius: 10px;
    margin-bottom: 14px;
    overflow: hidden;
}

.pinned-data-panel__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    cursor: pointer;
    user-select: none;
    background: var(--surface-subtle);
    border-bottom: 1px solid var(--border-subtle);
    transition: background 0.15s ease;
}

.pinned-data-panel__header:hover {
    background: var(--surface-elevated);
}

.pinned-data-panel__title {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--text-main);
}

.pinned-data-panel__icon {
    font-size: 1.1rem;
    color: var(--text-muted);
}

.pinned-data-panel__icon.pinned-active {
    color: #f59e0b;
}

.pinned-data-panel__badge {
    background: rgba(245, 158, 11, 0.2);
    color: #d97706;
    font-size: 0.65rem;
    padding: 2px 6px;
    border-radius: 8px;
    font-weight: 800;
    letter-spacing: 0.5px;
}

.pinned-data-panel__actions {
    display: flex;
    align-items: center;
    gap: 8px;
}

.pinned-toggle-btn {
    padding: 3px 10px;
    font-size: 0.72rem;
    font-weight: 600;
    border-radius: 6px;
    border: 1px solid var(--border-subtle);
    background: var(--surface-elevated);
    color: var(--text-main);
    cursor: pointer;
    transition: all 0.15s ease;
}

.pinned-toggle-btn:hover {
    border-color: #f59e0b;
    color: #f59e0b;
}

.pinned-toggle-btn--active {
    background: linear-gradient(135deg, #f59e0b, #d97706);
    color: #ffffff;
    border-color: transparent;
}

.pinned-data-panel__body {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 10px;
}

.pinned-data-notice {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.72rem;
    color: #b45309;
    background: rgba(245, 158, 11, 0.1);
    border: 1px solid rgba(245, 158, 11, 0.2);
    padding: 6px 8px;
    border-radius: 6px;
}

.pinned-data-notice .material-symbols-outlined {
    font-size: 0.95rem;
    flex-shrink: 0;
}

.pinned-data-controls {
    display: flex;
    align-items: center;
    gap: 6px;
}

.pinned-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 8px;
    font-size: 0.7rem;
    font-weight: 500;
    border-radius: 5px;
    border: 1px solid var(--border-subtle);
    background: var(--surface-elevated);
    color: var(--text-main);
    cursor: pointer;
    transition: all 0.15s ease;
}

.pinned-btn:hover {
    border-color: #6366f1;
    color: #4f46e5;
}

.pinned-btn .material-symbols-outlined {
    font-size: 0.85rem;
}

.pinned-btn--danger:hover {
    border-color: #ef4444;
    color: #ef4444;
}

.pinned-data-textarea {
    width: 100%;
    font-family: monospace;
    font-size: 0.75rem;
    background: var(--surface-elevated);
    color: var(--text-main);
    border: 1px solid var(--border-subtle);
    border-radius: 6px;
    padding: 8px;
    line-height: 1.4;
    outline: none;
    resize: vertical;
}

.pinned-data-textarea:focus {
    border-color: #f59e0b;
}
</style>