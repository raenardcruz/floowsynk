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
                        <span class="material-symbols-outlined" style="color: #BC0F26;"
                            @click="tab.tags.splice(index, 1)">close</span>
                    </div>
                </div>
            </div>
            <div class="description">
                <input type="text" v-model="tab.description" placeholder="Enter Description">
            </div>
        </div>
        <div class="content" :id="canvasId">
            <log-modal :id="id" v-if="tab.showLogModal" />
            <sidebar />
            <Modal title="Process Type" caption="Please select the workflow process type." v-model:visible="show">
                <WorkflowProcessTypeModal :id="tab.id" />
            </Modal>
            <VueFlow class="vue-flow-container" tabindex="0" v-model:nodes="tab.nodes" v-model:edges="tab.edges"
                :only-render-visible-elements="false" :edge-types="edgeTypes"
                :snapToGrid="true" @connect="WorkflowCanvas.onConnectEdge($event, props.id)"
                @drop="WorkflowCanvas.onDrop($event, props.id)" @dragover="WorkflowCanvas.onDragOver($event)"
                @dragleave="WorkflowCanvas.onDragLeave()"
                @node-drag-stop="WorkflowCanvas.onNodeDragEnd($event, props.id)"
                @move="WorkflowCanvas.onBackgroundMove($event)" @mousemove="WorkflowCanvas.onMouseMove($event)"
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
                    <ControlButton title="Delete">
                        <span class="material-symbols-outlined"
                            @click="WorkflowCanvas.delete(tab, props.notif)">delete</span>
                    </ControlButton>
                    <ControlButton title="Save">
                        <span class="material-symbols-outlined"
                            @click="WorkflowCanvas.save(tab, props.notif)">save</span>
                    </ControlButton>
                    <ControlButton title="Run" style="background: #6FA071; color: #fff;">
                        <span class="material-symbols-outlined" @click="WorkflowCanvas.run(tab, notif)">play_arrow</span>
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
import { ref, defineProps } from "vue";
import { VueFlow, useVueFlow } from '@vue-flow/core';
import { MiniMap } from '@vue-flow/minimap';
import WorkflowCanvas from "./Workflow.Canvas";
import Sidebar from "@/components/Workflow/Sidebar/Workflow.Canvas.SideBar.vue";
import LogModal from "@/components/Workflow/Modal/Workflow.Log.Modal.vue";
import edgeTypes from "@/components/Workflow/Edges/egde.type";
import DropzoneBackground from './Background/Dropzone.vue';
import { ControlButton, Controls } from '@vue-flow/controls';
import Modal from "@/components/Common/UI/Modal.vue"
import WorkflowProcessTypeModal from '@/components/Workflow/Modal/Workflow.Process.Type.Modal.vue';
import FloowsynkNode from "../Nodes/FloowsynkNode.vue";
import { queueStatusUpdate } from './Workflow.Canvas';

const { isDragOver } = WorkflowCanvas.store;
const {
    getSelectedNodes,
    getSelectedEdges,
    addSelectedNodes,
    setViewport } = useVueFlow();
const props = defineProps(['id', 'notif']);
const tab = WorkflowCanvas.findTabById(props.id) || { name: '', tags: [], description: '', nodes: [], edges: [] };
const tags = ref<string[]>([]);
const onKeyDown = function (event: KeyboardEvent) {
    WorkflowCanvas.onKeyDown(event, props.id, getSelectedNodes, getSelectedEdges, addSelectedNodes);
};
const resetTransform = function () {
    setViewport({ x: 0, y: 0, zoom: 1 })
};
const show = ref(false);
window.addEventListener('type-select', (data: any) => {
    if (tab.id == data.detail.tabid) {
        show.value = true;
    }
});

const eventSource = new EventSource(`/api/workflow/${tab.id}/events`);
eventSource.addEventListener('Complete', (event: any) => {
    props.notif?.success(`Process Completed. ${event.data}`);
});
eventSource.addEventListener('NodeStatus', (event: any) => {
    let nodeData = JSON.parse(event.data);
    queueStatusUpdate(nodeData.nodeId, nodeData.status);
});
eventSource.addEventListener('Complete', (event: any) => {
    props.notif?.success(`Process Completed. ${event.data}`);
});
eventSource.addEventListener('NodeStatus', (event: any) => {
    let nodeData = JSON.parse(event.data);
    queueStatusUpdate(nodeData.nodeId, nodeData.status);
});
eventSource.addEventListener('Replay', (event: any) => {
    console.log(event);
});
const canvasId = btoa(tab.id);
</script>

<style scoped src="./Workflow.Canvas.css"></style>
