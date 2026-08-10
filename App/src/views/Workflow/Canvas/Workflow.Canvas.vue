<template>
    <div class="canvas">
        <div class="canvas__header">
            <div class="canvas_titlecontainer">
                <input class="canvas__headerinput canvas__label" type="text" v-model="tab.name" placeholder="Enter Process Title">
                <Tag v-if="isGuest" severity="warn" rounded style="margin-left: 10px; padding: 4px 10px; font-weight: bold; background-color: var(--orange-5); color: var(--white-1);">Guest Mode</Tag>
                <!-- Environment badges -->
                <span v-if="isProduction" class="env-badge env-badge--live" title="Production — live data, no versioning">
                    <span class="material-symbols-outlined">circle</span> LIVE
                    <template v-if="(tab as any).publishedversionnum"> (v{{ (tab as any).publishedversionnum }})</template>
                </span>
                <span v-else class="env-badge env-badge--staging" title="Staging — versioning enabled">
                    <span class="material-symbols-outlined">layers</span> STAGING
                </span>
                <span v-if="tab.ismodified" class="env-badge env-badge--modified" title="This workflow was modified directly in Production and is out of sync with Staging">
                    <span class="material-symbols-outlined">sync_problem</span> OUT OF SYNC
                </span>
                <div class="canvas_tags">
                    <Tag pt:root:class="canvas__tag" @click="addTag" rounded>
                        <span class="material-symbols-outlined">add</span>
                        <span>Add Tag</span>
                    </Tag>
                    <Tag rounded pt:root:class="canvas__tag canvas__tag--active" v-for="(_, index) in tab.tagsList"
                        removable>
                        <input class="canvas__headerinput canvas__tagtext" type="text" placeholder="New Tag" v-model="tab.tagsList[index]"
                            :list="tab.tagsList[index]">
                        <datalist :id="tab.tagsList[index]">
                            <option :value="tag" v-for="tag in tab.tagsList.filter((f: string) => f != 'No Tags')">
                            </option>
                        </datalist>
                        <span class="material-symbols-outlined" @click="removeTag(index)">close</span>
                    </Tag>
                </div>
            </div>
            <div class="description">
                <input class="canvas__headerinput canvas__description" type="text" v-model="tab.description" placeholder="Enter Description">
            </div>
        </div>
        <div class="content" :id="canvasId">
            <SidebarCanvas />
            <Modal title="Process Type" caption="Please select the workflow process type." :visible="show"
                @update:visible="show = $event">
                <ProcessTypeModal :id="tab.id" />
            </Modal>
            <div class="workspace">
                <VueFlow class="vue-flow-container" tabindex="0" v-model:nodes="node" v-model:edges="edge"
                    :only-render-visible-elements="false" :snapToGrid="true" @connect="onConnectEdge($event)"
                    @drop="onDrop($event)" @dragover="onDragOver($event)" @dragleave="onDragLeave()"
                    @selection-drag-stop="commit()" @edges-change="commit()" delete-key-code="false"
                    no-wheel-class-name="no-scroll">
                    <Background />
                    <MiniMap />
                    <Controls style="display: flex;" position="top-right">
                        <ControlButton title="Reset Transform" @click="resetTransform">
                            <span class="material-symbols-outlined">refresh</span>
                        </ControlButton>
                        <ControlButton title="Delete" v-if="!isRunning">
                            <span class="material-symbols-outlined" @click="removeProcess()">delete</span>
                        </ControlButton>
                        <ControlButton title="Save" v-if="!isRunning">
                            <span class="material-symbols-outlined" @click="saveProcess()">save</span>
                        </ControlButton>
                        <!-- Version History button (staging only) -->
                        <ControlButton title="Version History" v-if="!isRunning && !isProduction" @click="showVersionHistory = true">
                            <span class="material-symbols-outlined">history</span>
                        </ControlButton>
                        <!-- Revert to Staging copy (when modified in production) -->
                        <ControlButton title="Revert to Staging Copy" v-if="!isRunning && tab.ismodified" style="background: #f97316; color: #ffffff;" @click="handleRevertWorkflow">
                            <span class="material-symbols-outlined">restart_alt</span>
                        </ControlButton>
                        <ControlButton title="Run" style="background: var(--green-2); color: var(--white-1);"
                            v-if="!isRunning">
                            <span class="material-symbols-outlined" @click="runProcess()">play_arrow</span>
                        </ControlButton>
                        <ControlButton title="Exit Run Mode" style="background: var(--red-2); color: var(--white-1);"
                            v-else>
                            <span class="material-symbols-outlined" @click="exitRunMode()">close</span>
                        </ControlButton>
                    </Controls>
                    <template #node-default="nodeProps">
                        <FloowsynkNode v-bind="nodeProps" :tabid="tab.id" />
                    </template>
                    <template #edge-custom="edgeProps">
                        <CustomEdge v-bind="edgeProps" :tabId="tab.id" />
                    </template>
                </VueFlow>
                <div class="replaysteps" v-if="showReplayData && isRunning">
                    <ReplaySteps :tabId="tab.id" />
                </div>
            </div>
        </div>
        <!-- Version History modal (staging only) -->
        <VersionHistoryModal
            v-if="!isProduction"
            :visible="showVersionHistory"
            :workflowId="tab.id"
            :workflowName="tab.name"
            @close="showVersionHistory = false"
            @restored="onVersionRestored"
        />
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const isGuest = ref(localStorage.getItem('sessionToken') === 'guest')
const isProduction = ref(import.meta.env.VITE_APP_ENVIRONMENT === 'production')
const showVersionHistory = ref(false)
import { revertWorkflowToStaging } from './Workflow.Canvas.versions.api'
import { VueFlow, useVueFlow } from '@vue-flow/core'
import { WorkflowCanvasProps } from './Workflow.Canvas.types'
import { useWorkflowCanvasHooks, useWorkflowCanvasStore } from './Workflow.Canvas.hooks'
import { useWorkflowCanvasVueFlowEvents } from './VueFlowEvents/Workflow.Canvas.VueFlowEvents'
import { useWorkflowCanvasControlButtonActions } from './ButtonActions/Workflow.Canvas.ButtonActions'
import { SidebarCanvas } from '@/views/Workflow/Sidebar'
import { Modal } from '@/components/Composable/UI/Modal'
import { ProcessTypeModal, VersionHistoryModal } from '@/views/Workflow/Modal'
import { MiniMap } from '@vue-flow/minimap'
import { Background } from '@vue-flow/background'
import { ControlButton, Controls } from '@vue-flow/controls'
import FloowsynkNode from '@/views/Workflow/Nodes'
import { useWorkflowCanvasHelperMethods } from './Helper/Workflow.Canvas.Helper'
import CustomEdge from '@/views/Workflow/Edges/CustomEdge.vue'
import ReplaySteps from '../ReplaySteps'
import Tag from 'primevue/tag'

const props = defineProps<WorkflowCanvasProps>()
const { tab, canvasId, node, edge } = useWorkflowCanvasHooks(props.id)
const show = ref(false)
const { addTag, removeTag } = useWorkflowCanvasHelperMethods(props.id, useVueFlow())
const {
    onConnectEdge,
    onDrop,
    onDragOver,
    onDragLeave,
    commit,
} = useWorkflowCanvasVueFlowEvents(props, useVueFlow())
const { resetTransform, removeProcess, saveProcess, runProcess, exitRunMode } = useWorkflowCanvasControlButtonActions(props, useVueFlow())
const {
    showReplayData,
    isRunning,
} = useWorkflowCanvasStore(props.id)

const onVersionRestored = () => {
    // Reload the workflow from the server after a version restore
    window.location.reload()
}

const handleRevertWorkflow = async () => {
    if (!confirm('Revert this production workflow back to its staging copy? Any changes done directly on production will be removed.')) return
    try {
        await revertWorkflowToStaging(tab.value.id)
        window.location.reload()
    } catch (err: any) {
        alert('Failed to revert workflow: ' + (err as Error).message)
    }
}
</script>

<style scoped src="./Workflow.Canvas.styles.css"></style>

<style scoped>
/* Environment badges */
.env-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 10px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.8px;
    margin-left: 8px;
    flex-shrink: 0;
}
.env-badge .material-symbols-outlined { font-size: 10px; }
.env-badge--live {
    background: rgba(34, 197, 94, 0.15);
    color: #4ade80;
    border: 1px solid rgba(34, 197, 94, 0.4);
    animation: pulse-live 2s infinite;
}
@keyframes pulse-live {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
}
.env-badge--staging {
    background: rgba(234, 179, 8, 0.15);
    color: #facc15;
    border: 1px solid rgba(234, 179, 8, 0.4);
}
.env-badge--modified {
    background: rgba(249, 115, 22, 0.15);
    color: #fb923c;
    border: 1px solid rgba(249, 115, 22, 0.4);
}
</style>
