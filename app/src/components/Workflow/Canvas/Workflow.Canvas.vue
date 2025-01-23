<template>
    <div class="tab-container">
        <div class="title-section">
            <div class="title">
                <input type="text" v-model="tab.title" placeholder="Enter Process Title">
                <div class="tags">
                    <div class="tag btn" @click="tab.tags.push('')">
                        <span class="material-symbols-outlined">add</span>
                        <span>Add Tag</span>
                    </div>
                    <div class="tag" style="background: #0088C2;" v-for="(tag, index) in tab.tags">
                        <input type="text" placeholder="New Tag" v-model="tab.tags[index]" :list="tab.tags[index]">
                        <datalist :id="tab.tags[index]">
                            <option :value="tag" v-for="tag in tags.filter(f => f != 'No Tags')"></option>
                        </datalist>
                        <span class="material-symbols-outlined" style="color: #BC0F26;" @click="tab.tags.splice(index, 1)">close</span>
                    </div>
                </div>
            </div>
            <div class="description">
                <input type="text" v-model="tab.description" placeholder="Enter Description">
            </div>
        </div>
        <div class="content">
            <log-modal :id="id" v-if="tab.showLogModal" />
            <sidebar />
            <VueFlow
                class="vue-flow-container"
                tabindex="0"
                v-model:nodes="tab.nodes"
                v-model:edges="tab.edges"
                :only-render-visible-elements="false"
                :node-types="nodeTypes"
                :edge-types="edgeTypes"
                :snapToGrid="true"
                @connect="WorkflowCanvas.onConnectEdge($event, props.id)"
                @drop="WorkflowCanvas.onDrop($event, props.id)"
                @dragover="WorkflowCanvas.onDragOver($event)"
                @dragleave="WorkflowCanvas.onDragLeave()"
                @node-drag-stop="WorkflowCanvas.onNodeDragEnd($event, props.id)"
                @move="WorkflowCanvas.onBackgroundMove($event)"
                @mousemove="WorkflowCanvas.onMouseMove($event)"
                @keydown="onKeyDown($event)"
                delete-key-code="false"
                no-wheel-class-name="no-scroll">
                <DropzoneBackground
                    :style="{
                    backgroundColor: isDragOver ? '#e7f3ff' : 'transparent',
                    transition: 'background-color 0.2s ease', height: '100%'}">
                    <h2 v-if="isDragOver">DRAG AREA</h2>
                </DropzoneBackground>
                <MiniMap />
                <Controls style="display: flex;" position="top-right">
                    <ControlButton title="Reset Transform" @click="resetTransform">
                        <span class="material-symbols-outlined">refresh</span>
                    </ControlButton>
                    <ControlButton title="Delete">
                        <span class="material-symbols-outlined">delete</span>
                    </ControlButton>
                    <ControlButton title="Save">
                        <span class="material-symbols-outlined" @click="WorkflowCanvas.save(tab)">save</span>
                    </ControlButton>
                    <ControlButton title="Run" style="background: #6FA071; color: #fff;">
                        <span class="material-symbols-outlined">play_arrow</span>
                    </ControlButton>
                </Controls>
            </VueFlow>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VueFlow, useVueFlow } from '@vue-flow/core';
import { MiniMap } from '@vue-flow/minimap';
import WorkflowCanvas from "./Workflow.Canvas";
import Sidebar from "@/components/Workflow/Sidebar/Workflow.Canvas.SideBar.vue";
import LogModal from "@/components/Workflow/Modal/Workflow.Log.Modal.vue";
import nodeTypes from "@/components/Workflow/Nodes/node.types";
import edgeTypes from "@/components/Workflow/Edges/egde.type";
import DropzoneBackground from './Background/Dropzone.vue';
import { ControlButton, Controls } from '@vue-flow/controls'

const { isDragOver } = WorkflowCanvas.store;
const { 
    getSelectedNodes,
    getSelectedEdges,
    addSelectedNodes,
    setViewport } = useVueFlow();
const props = defineProps(['id']);
const tab = WorkflowCanvas.findTabById(props.id) || { name: '', tags: [], description: '', nodes: [], edges: [] };
const tags = ref<string[]>([]);
const onKeyDown = function (event: KeyboardEvent) {
    WorkflowCanvas.onKeyDown(event, props.id, getSelectedNodes, getSelectedEdges, addSelectedNodes);
};
const resetTransform = function () {
    setViewport({ x: 0, y: 0, zoom: 1 })
};
</script>

<style scoped src="./Workflow.Canvas.css"></style>