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
                    <div class="tag" style="background: #0088C2;" v-for="(_, index) in tab.tagsList">
                        <input type="text" placeholder="New Tag" v-model="tab.tagsList[index]" :list="tab.tagsList[index]">
                        <datalist :id="tab.tagsList[index]">
                            <option :value="tag" v-for="tag in tab.tagsList.filter((f: string) => f != 'No Tags')"></option>
                        </datalist>
                        <span class="material-symbols-outlined" style="color: #BC0F26;"
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
            <VueFlow class="vue-flow-container" tabindex="0" v-model:nodes="node as Node<any, any, string>[]" v-model:edges="edge as Edge<any, any, string>[]"
                :only-render-visible-elements="false" :edge-types="edgeTypes"
                :snapToGrid="true" @connect="onConnectEdge($event)"
                @drop="onDrop($event)" @dragover="onDragOver($event)"
                @dragleave="onDragLeave()"
                @node-drag-start="onNodeDragStart($event)"
                @node-drag-stop="onNodeDragEnd($event)"
                @mousemove="onMouseMove($event)"
                @keydown="onKeyDown($event)" delete-key-code="false" no-wheel-class-name="no-scroll">
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
                        <span class="material-symbols-outlined"
                            @click="removeProcess()">delete</span>
                    </ControlButton>
                    <ControlButton title="Save" v-if="!isRunning">
                        <span class="material-symbols-outlined"
                            @click="saveProcess()">save</span>
                    </ControlButton>
                    <ControlButton title="Run" style="background: #6FA071; color: #fff;" v-if="!isRunning">
                        <span class="material-symbols-outlined" @click="runProcess()">play_arrow</span>
                    </ControlButton>
                    <ControlButton title="Exit Run Mode" style="background: #e30b57; color: #fff;" v-else>
                        <span class="material-symbols-outlined" @click="exitRunMode()">close</span>
                    </ControlButton>
                </Controls>
                <template #node-default="nodeProps">
                    <FloowsynkNode v-bind="nodeProps" :tabid="tab.id" />
                </template>
            </VueFlow>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { Node, Edge } from '@vue-flow/core';
import { VueFlow, useVueFlow } from '@vue-flow/core';
import { WorkflowCanvasProps } from './Workflow.Canvas.types'
import { useWorkflowCanvasHooks, useWorkflowCanvasStore } from './Workflow.Canvas.hooks'
import edgeTypes from "@/components/Workflow/Edges/Edge.type";
import { useWorkflowCanvasVueFlowEvents } from './VueFlowEvents/Workflow.Canvas.VueFlowEvents'
import { useWorkflowCanvasControlButtonActions } from './ButtonActions/Workflow.Canvas.ButtonActions'
import { SidebarCanvas } from '@/components/Workflow/Sidebar'
import Modal from '@/components/Composable/UI/Modal'
import { ProcessTypeModal } from '@/components/Workflow/Modal'
import DropzoneBackground from './Background'
import { MiniMap } from '@vue-flow/minimap';
import { ControlButton, Controls } from '@vue-flow/controls';
import FloowsynkNode from '@/components/Workflow/Nodes'
import { useWorkflowCanvasHelperMethods } from './Helper/Workflow.Canvas.Helper'

const props = defineProps<WorkflowCanvasProps>()
const { tab, canvasId, node, edge, isRunning } = useWorkflowCanvasHooks(props.id)
const show = ref(false);
const { addTag, removeTag } = useWorkflowCanvasHelperMethods(props.id, useVueFlow())
const {
    onConnectEdge,
    onDrop,
    onDragOver,
    onDragLeave,
    onNodeDragEnd,
    onMouseMove,
    onKeyDown,
    onNodeDragStart
} = useWorkflowCanvasVueFlowEvents(props, useVueFlow())
const { resetTransform, removeProcess, saveProcess, runProcess, exitRunMode } = useWorkflowCanvasControlButtonActions(props, useVueFlow())
const { 
    isDragOver,
} = useWorkflowCanvasStore()
</script>

<style scoped src="./Workflow.Canvas.styles.css"></style>
