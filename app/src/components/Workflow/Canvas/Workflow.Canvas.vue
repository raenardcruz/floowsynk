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
        <div class="content">
            <log-modal :id="id" v-if="tab.showLogModal" />
            <sidebar />
            <VueFlow
                class="vue-flow-container"
                :nodes="tab.nodes"
                :edges="tab.edges"
                :only-render-visible-elements="false"
                :node-types="nodeTypes"
                @paneClick="test"
                @connect="WorkflowCanvas.onConnectEdge($event, props.id)"
                @drop="WorkflowCanvas.onDrop($event, props.id)"
                @dragover="WorkflowCanvas.onDragOver($event)"
                @dragleave="WorkflowCanvas.onDragLeave()"
                @node-drag-stop="WorkflowCanvas.onNodeDragEnd($event, props.id)"
                no-wheel-class-name="no-scroll">
                <DropzoneBackground
                    :style="{
                    backgroundColor: isDragOver ? '#e7f3ff' : 'transparent',
                    transition: 'background-color 0.2s ease', height: '100vh'}">
                    <p v-if="isDragOver">Drop here</p>
                </DropzoneBackground>
            </VueFlow>
        </div>
    </div>
</template>

<script setup lang="ts">
import { VueFlow } from '@vue-flow/core';
import WorkflowCanvas from "./Workflow.Canvas";
import Sidebar from "@/components/Workflow/Sidebar/Workflow.Canvas.SideBar.vue";
import LogModal from "@/components/Workflow/Modal/Workflow.Log.Modal.vue";
import { ref } from "vue";
import nodeTypes from "@/components/Workflow/Nodes/node.types";
import DropzoneBackground from './Background/Dropzone.vue';

const { isDragOver } = WorkflowCanvas.store;

const test = function () {
    console.log('test')
}

const tags = ref<string[]>([])
const props = defineProps(['id']);
const tab = WorkflowCanvas.findTabById(props.id) || { name: '', tags: [], description: '', nodes: [], edges: [] };
</script>

<style scoped src="./Workflow.Canvas.css"></style>