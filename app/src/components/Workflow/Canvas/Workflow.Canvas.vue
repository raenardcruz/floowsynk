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
            <VueFlow :nodes="testNode" :edges="tab.edges"
                :only-render-visible-elements="false"
                :node-types="nodeTypes" 
                no-wheel-class-name="no-scroll"
                class="vue-flow-container">
                <Background />
                <Controls position="top-right">
                </Controls>
            </VueFlow>
        </div>
    </div>
</template>

<script setup lang="ts">
import { VueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { ControlButton, Controls } from '@vue-flow/controls'
import WorkflowCanvas from "./Workflow.Canvas";
import Sidebar from "@/components/Workflow/Sidebar/Workflow.Canvas.SideBar.vue";
import LogModal from "@/components/Workflow/Modal/Workflow.Log.Modal.vue";
import { ref } from "vue";
import nodeTypes from "@/components/Workflow/Nodes/node.types";
import { NodeComponent } from '@vue-flow/core';

const tags = ref<string[]>([])
const props = defineProps(['id']);
const tab = WorkflowCanvas.findTabById(props.id) || { name: '', tags: [], description: '' };

const testNode = [{
    id: '0',
    type: 'start',
    label: 'Default',
    icon: { name: 'play_arrow', color: '#4CAF50' },
    group: [1],
    position: { x: 100, y: 100 },
    data: { label: 'Node 1' },
},
{
        id: '1', type: 'image', label: 'Output Image', position: { x: 300, y: 100 },
        group: [7],
        icon: {
            name: "image",
            color: "#98BC18"
        },
        data: {
            status: "",
            value: ""
        }
    }]
</script>

<style scoped src="./Workflow.Canvas.css"></style>