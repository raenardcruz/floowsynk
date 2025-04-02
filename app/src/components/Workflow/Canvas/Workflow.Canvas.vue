<template>
    <div class="tab-container">
        <div class="title-section">
            <div class="title">
                <input type="text" v-model="tab.name" placeholder="Enter Process Title">
                <div class="tags">
                    <div class="tag btn" @click="addTag">
                        <span class="material-symbols-outlined">add</span>
                        <span>Add Tag</span>
                    </div>
                    <div class="tag" style="background: var(--blue-2);" v-for="(_, index) in tab.tagsList">
                        <input type="text" placeholder="New Tag" v-model="tab.tagsList[index]"
                            :list="tab.tagsList[index]">
                        <datalist :id="tab.tagsList[index]">
                            <option :value="tag" v-for="tag in tab.tagsList.filter((f: string) => f != 'No Tags')">
                            </option>
                        </datalist>
                        <span class="material-symbols-outlined" style="color: var(--red-2);"
                            @click="removeTag(index)">close</span>
                    </div>
                </div>
            </div>
            <div class="description">
                <input type="text" v-model="tab.description" placeholder="Enter Description">
            </div>
        </div>
        <div class="content" :id="canvasId">
            <SidebarCanvas />
            <Modal title="Process Type" caption="Please select the workflow process type." v-model:visible="show">
                <ProcessTypeModal :id="tab.id" />
            </Modal>
            <div class="workspace">
                <VueFlow class="vue-flow-container" tabindex="0" v-model:nodes="node as Node<any, any, string>[]"
                    v-model:edges="edge as Edge<any, any, string>[]" :only-render-visible-elements="false"
                    :snapToGrid="true" @connect="onConnectEdge($event)" @drop="onDrop($event)"
                    @dragover="onDragOver($event)" @dragleave="onDragLeave()"
                    @selection-drag-stop="commit()" @edges-change="commit()" delete-key-code="false"
                    no-wheel-class-name="no-scroll">
                    <DropzoneBackground :style="{
                        backgroundColor: isDragOver ? '#e7f3ff' : 'transparent',
                        transition: 'background-color 0.2s ease', height: '100%'
                    }">
                        <h2 v-if="isDragOver">DRAG AREA</h2>
                    </DropzoneBackground>
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
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Node, Edge } from '@vue-flow/core'
import { VueFlow, useVueFlow } from '@vue-flow/core'
import { WorkflowCanvasProps } from './Workflow.Canvas.types'
import { useWorkflowCanvasHooks, useWorkflowCanvasStore, useWorkflowCanvasGlbalStore } from './Workflow.Canvas.hooks'
import { useWorkflowCanvasVueFlowEvents } from './VueFlowEvents/Workflow.Canvas.VueFlowEvents'
import { useWorkflowCanvasControlButtonActions } from './ButtonActions/Workflow.Canvas.ButtonActions'
import { SidebarCanvas } from '@/components/Workflow/Sidebar'
import Modal from '@/components/Composable/UI/Modal'
import { ProcessTypeModal } from '@/components/Workflow/Modal'
import DropzoneBackground from './Background'
import { MiniMap } from '@vue-flow/minimap'
import { ControlButton, Controls } from '@vue-flow/controls'
import FloowsynkNode from '@/components/Workflow/Nodes'
import { useWorkflowCanvasHelperMethods } from './Helper/Workflow.Canvas.Helper'
import CustomEdge from '@/components/Workflow/Edges/CustomEdge.vue'
import ReplaySteps from '../ReplaySteps'

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
const { isDragOver } = useWorkflowCanvasGlbalStore()
</script>

<style scoped src="./Workflow.Canvas.styles.css"></style>
