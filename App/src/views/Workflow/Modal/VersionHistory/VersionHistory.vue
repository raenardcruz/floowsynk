<template>
    <div class="version-history-overlay" v-if="visible" @click.self="close">
        <div class="version-history-panel">
            <!-- Header -->
            <div class="vh-header">
                <div class="vh-header-left">
                    <span class="material-symbols-outlined vh-icon">history</span>
                    <div>
                        <h2 class="vh-title">Version History</h2>
                        <p class="vh-subtitle">{{ workflowName }}</p>
                    </div>
                </div>
                <button class="vh-close-btn" @click="close">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>

            <!-- Publish Current Banner -->
            <div class="vh-publish-banner">
                <div class="vh-publish-info">
                    <span class="material-symbols-outlined">rocket_launch</span>
                    <span>Push current live workflow to <strong>Production</strong></span>
                </div>
                <button class="vh-publish-btn" @click="handlePublishCurrent" :disabled="isPublishing">
                    <span class="material-symbols-outlined" v-if="!isPublishing">upload</span>
                    <span class="material-symbols-outlined spinning" v-else>autorenew</span>
                    {{ isPublishing ? 'Publishing...' : 'Publish Current' }}
                </button>
            </div>

            <!-- Version List -->
            <div class="vh-body">
                <div class="vh-loading" v-if="isLoading">
                    <span class="material-symbols-outlined spinning">autorenew</span>
                    <span>Loading versions...</span>
                </div>
                <div class="vh-empty" v-else-if="versions.length === 0">
                    <span class="material-symbols-outlined">layers_clear</span>
                    <p>No versions yet. Save the workflow to create the first version.</p>
                </div>
                <div class="vh-versions" v-else>
                    <div
                        v-for="(version, index) in versions"
                        :key="version.id"
                        class="vh-version-card"
                        :class="{ 'vh-version-card--latest': index === 0 }"
                    >
                        <div class="vh-version-meta">
                            <div class="vh-version-badge" :class="index === 0 ? 'badge-latest' : 'badge-old'">
                                {{ index === 0 ? 'Latest' : `v${version.versionNum}` }}
                            </div>
                            <div class="vh-version-info">
                                <!-- Editable label -->
                                <input
                                    v-if="editingId === version.id"
                                    class="vh-label-input"
                                    v-model="editingLabel"
                                    @keydown.enter="saveLabel(version)"
                                    @keydown.escape="editingId = null"
                                    @blur="saveLabel(version)"
                                    ref="labelInput"
                                    placeholder="Enter label..."
                                    autofocus
                                />
                                <span v-else class="vh-version-label" @dblclick="startEdit(version)">
                                    {{ version.label || `v${version.versionNum}` }}
                                    <span class="material-symbols-outlined vh-edit-icon" title="Edit label">edit</span>
                                </span>
                                <div class="vh-version-details">
                                    <span class="material-symbols-outlined detail-icon">schedule</span>
                                    <span>{{ version.savedAt }}</span>
                                    <span class="detail-sep">·</span>
                                    <span class="material-symbols-outlined detail-icon">person</span>
                                    <span>{{ version.savedBy || 'Unknown' }}</span>
                                </div>
                            </div>
                        </div>
                        <div class="vh-version-actions">
                            <button
                                class="vh-action-btn vh-publish-version-btn"
                                @click="handlePublishVersion(version)"
                                :disabled="isPublishing"
                                title="Publish this version to Production"
                            >
                                <span class="material-symbols-outlined">rocket_launch</span>
                                Publish
                            </button>
                            <button
                                v-if="index !== 0"
                                class="vh-action-btn vh-restore-btn"
                                @click="handleRestore(version)"
                                :disabled="isRestoring"
                                title="Restore this version as the live workflow"
                            >
                                <span class="material-symbols-outlined">restore</span>
                                Restore
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Confirm Publish Dialog -->
    <div class="vh-confirm-overlay" v-if="confirmPublish" @click.self="confirmPublish = null">
        <div class="vh-confirm-dialog">
            <div class="vh-confirm-icon">
                <span class="material-symbols-outlined">rocket_launch</span>
            </div>
            <h3>Publish to Production?</h3>
            <p>
                You are about to publish
                <strong>{{ confirmPublish.label || 'the current workflow' }}</strong>
                to the <span class="prod-badge">PRODUCTION</span> environment.
                This will overwrite the live production data.
            </p>
            <div class="vh-confirm-actions">
                <button class="vh-btn-cancel" @click="confirmPublish = null">Cancel</button>
                <button class="vh-btn-confirm" @click="executePublish">
                    <span class="material-symbols-outlined">check</span>
                    Yes, Publish
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { listWorkflowVersions, restoreWorkflowVersion, publishWorkflow } from '../../Canvas/Workflow.Canvas.versions.api'

const props = defineProps<{
    visible: boolean
    workflowId: string
    workflowName: string
}>()

const emit = defineEmits<{
    (e: 'close'): void
    (e: 'restored'): void
}>()

type VersionObj = {
    id: string
    workflowId: string
    versionNum: number
    label: string
    savedAt: string
    savedBy: string
}

const versions = ref<VersionObj[]>([])
const isLoading = ref(false)
const isRestoring = ref(false)
const isPublishing = ref(false)
const editingId = ref<string | null>(null)
const editingLabel = ref('')
const confirmPublish = ref<{ label: string; versionId: string } | null>(null)
const labelInput = ref<HTMLInputElement | null>(null)

const close = () => emit('close')

const loadVersions = async () => {
    if (!props.workflowId) return
    isLoading.value = true
    try {
        const resp = await listWorkflowVersions(props.workflowId)
        versions.value = resp.getVersionsList().map((v: any) => ({
            id: v.getId(),
            workflowId: v.getWorkflowid(),
            versionNum: v.getVersionnum(),
            label: v.getLabel(),
            savedAt: v.getSavedat(),
            savedBy: v.getSavedby(),
        }))
    } catch (err) {
        console.error('Failed to load versions', err)
    } finally {
        isLoading.value = false
    }
}

watch(() => props.visible, (val) => {
    if (val) loadVersions()
})

const startEdit = (version: VersionObj) => {
    editingId.value = version.id
    editingLabel.value = version.label || `v${version.versionNum}`
    nextTick(() => labelInput.value?.focus())
}

const saveLabel = (version: VersionObj) => {
    if (editingLabel.value.trim()) {
        version.label = editingLabel.value.trim()
    }
    editingId.value = null
}

const handleRestore = async (version: VersionObj) => {
    if (!confirm(`Restore to "${version.label || `v${version.versionNum}`}"? The current workflow will be replaced.`)) return
    isRestoring.value = true
    try {
        await restoreWorkflowVersion(version)
        emit('restored')
        close()
    } catch (err) {
        alert('Failed to restore version. Please try again.')
        console.error(err)
    } finally {
        isRestoring.value = false
    }
}

const handlePublishVersion = (version: VersionObj) => {
    confirmPublish.value = { label: version.label || `v${version.versionNum}`, versionId: version.id }
}

const handlePublishCurrent = () => {
    confirmPublish.value = { label: 'current live workflow', versionId: '' }
}

const executePublish = async () => {
    if (!confirmPublish.value) return
    isPublishing.value = true
    const { versionId } = confirmPublish.value
    confirmPublish.value = null
    try {
        const resp = await publishWorkflow(props.workflowId, versionId)
        const result = resp as any
        if (result.getSuccess()) {
            alert(`✅ ${result.getMessage()}`)
        } else {
            alert(`❌ Publish failed: ${result.getMessage()}`)
        }
    } catch (err) {
        alert('Failed to publish. Please try again.')
        console.error(err)
    } finally {
        isPublishing.value = false
    }
}
</script>

<style scoped>
/* Panel overlay */
.version-history-overlay {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    background: rgba(0, 0, 0, 0.55);
    backdrop-filter: blur(3px);
    animation: fadeIn 0.2s ease;
}

@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
@keyframes slideIn { from { transform: translateX(100%) } to { transform: translateX(0) } }

.spinning {
    animation: spin 1s linear infinite;
    display: inline-block;
}
@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }

.version-history-panel {
    width: 480px;
    max-width: 100%;
    height: 100vh;
    background: #1a1b26;
    border-left: 1px solid rgba(255,255,255,0.08);
    display: flex;
    flex-direction: column;
    animation: slideIn 0.28s cubic-bezier(0.16, 1, 0.3, 1);
    overflow: hidden;
}

/* Header */
.vh-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px 16px;
    border-bottom: 1px solid rgba(255,255,255,0.08);
    background: #161722;
}
.vh-header-left {
    display: flex;
    align-items: center;
    gap: 12px;
}
.vh-icon {
    font-size: 28px;
    color: #7c8cf8;
}
.vh-title {
    margin: 0;
    font-size: 16px;
    font-weight: 700;
    color: #e2e4f0;
    letter-spacing: -0.2px;
}
.vh-subtitle {
    margin: 2px 0 0;
    font-size: 12px;
    color: #6b7280;
}
.vh-close-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: #6b7280;
    display: flex;
    align-items: center;
    padding: 6px;
    border-radius: 6px;
    transition: all 0.15s;
}
.vh-close-btn:hover { background: rgba(255,255,255,0.06); color: #e2e4f0; }

/* Publish banner */
.vh-publish-banner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 20px;
    background: linear-gradient(135deg, rgba(124,140,248,0.12), rgba(99,179,237,0.08));
    border-bottom: 1px solid rgba(124,140,248,0.2);
    gap: 12px;
}
.vh-publish-info {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: #a5b4fc;
}
.vh-publish-info .material-symbols-outlined { font-size: 18px; }
.vh-publish-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 7px 14px;
    background: linear-gradient(135deg, #7c8cf8, #63b3ed);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
}
.vh-publish-btn:hover { opacity: 0.88; transform: translateY(-1px); }
.vh-publish-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

/* Body / version list */
.vh-body {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 10px;
}
.vh-loading, .vh-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    height: 200px;
    color: #6b7280;
    font-size: 14px;
}
.vh-loading .material-symbols-outlined,
.vh-empty .material-symbols-outlined {
    font-size: 36px;
    opacity: 0.5;
}

/* Version card */
.vh-version-card {
    background: #20212e;
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 12px;
    padding: 14px 16px;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    transition: border-color 0.15s;
}
.vh-version-card:hover { border-color: rgba(124,140,248,0.3); }
.vh-version-card--latest { border-color: rgba(124,140,248,0.25); background: rgba(124,140,248,0.06); }

.vh-version-meta { display: flex; align-items: flex-start; gap: 10px; min-width: 0; }
.vh-version-badge {
    padding: 3px 10px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.5px;
    white-space: nowrap;
    flex-shrink: 0;
}
.badge-latest { background: rgba(124,140,248,0.2); color: #a5b4fc; }
.badge-old    { background: rgba(255,255,255,0.06); color: #6b7280; }

.vh-version-info { min-width: 0; }
.vh-version-label {
    font-size: 14px;
    font-weight: 600;
    color: #e2e4f0;
    cursor: text;
    display: flex;
    align-items: center;
    gap: 4px;
}
.vh-edit-icon {
    font-size: 14px;
    color: #4b5563;
    opacity: 0;
    transition: opacity 0.15s;
}
.vh-version-label:hover .vh-edit-icon { opacity: 1; }
.vh-label-input {
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(124,140,248,0.5);
    border-radius: 6px;
    color: #e2e4f0;
    font-size: 14px;
    font-weight: 600;
    padding: 2px 8px;
    outline: none;
    width: 100%;
}

.vh-version-details {
    display: flex;
    align-items: center;
    gap: 5px;
    margin-top: 4px;
    font-size: 11px;
    color: #4b5563;
}
.detail-icon { font-size: 13px; }
.detail-sep { color: #374151; }

/* Action buttons */
.vh-version-actions {
    display: flex;
    gap: 6px;
    flex-shrink: 0;
    align-items: flex-start;
}
.vh-action-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 5px 10px;
    border-radius: 7px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    border: 1px solid;
    transition: all 0.15s;
    white-space: nowrap;
}
.vh-action-btn .material-symbols-outlined { font-size: 15px; }
.vh-action-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.vh-publish-version-btn {
    background: rgba(124,140,248,0.1);
    color: #a5b4fc;
    border-color: rgba(124,140,248,0.25);
}
.vh-publish-version-btn:hover:not(:disabled) {
    background: rgba(124,140,248,0.2);
    border-color: rgba(124,140,248,0.5);
}
.vh-restore-btn {
    background: rgba(52,211,153,0.08);
    color: #6ee7b7;
    border-color: rgba(52,211,153,0.2);
}
.vh-restore-btn:hover:not(:disabled) {
    background: rgba(52,211,153,0.15);
    border-color: rgba(52,211,153,0.4);
}

/* Confirm dialog */
.vh-confirm-overlay {
    position: fixed;
    inset: 0;
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0,0,0,0.7);
    backdrop-filter: blur(4px);
    animation: fadeIn 0.15s ease;
}
.vh-confirm-dialog {
    background: #1a1b26;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 16px;
    padding: 32px;
    max-width: 400px;
    width: 90%;
    text-align: center;
    box-shadow: 0 25px 60px rgba(0,0,0,0.5);
}
.vh-confirm-icon {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: linear-gradient(135deg, rgba(124,140,248,0.2), rgba(99,179,237,0.2));
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 16px;
}
.vh-confirm-icon .material-symbols-outlined {
    font-size: 28px;
    color: #7c8cf8;
}
.vh-confirm-dialog h3 {
    margin: 0 0 12px;
    color: #e2e4f0;
    font-size: 18px;
}
.vh-confirm-dialog p {
    color: #9ca3af;
    font-size: 14px;
    line-height: 1.6;
    margin: 0 0 24px;
}
.prod-badge {
    display: inline-block;
    padding: 2px 8px;
    background: rgba(239,68,68,0.15);
    color: #f87171;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1px;
}
.vh-confirm-actions { display: flex; gap: 10px; justify-content: center; }
.vh-btn-cancel {
    padding: 9px 20px;
    background: rgba(255,255,255,0.06);
    color: #9ca3af;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 9px;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.15s;
}
.vh-btn-cancel:hover { background: rgba(255,255,255,0.1); color: #e2e4f0; }
.vh-btn-confirm {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 9px 20px;
    background: linear-gradient(135deg, #7c8cf8, #63b3ed);
    color: white;
    border: none;
    border-radius: 9px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
}
.vh-btn-confirm:hover { opacity: 0.88; transform: translateY(-1px); }

/* Scrollbar */
.vh-body::-webkit-scrollbar { width: 4px; }
.vh-body::-webkit-scrollbar-track { background: transparent; }
.vh-body::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
</style>
