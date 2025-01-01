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
            <!-- Logic Here -->
            <log-modal :id="id" v-if="tab.showLogModal" />
            <sidebar />
            <VueFlow :class="id" class="basicflow" :nodes="tab.nodes" :edges="tab.edges" :default-viewport="{ zoom: 1 }"
                :min-zoom="0.1" :max-zoom="5" :only-render-visible-elements="false" no-wheel-class-name="no-scroll"
                delete-key-code="false" tabindex="0">
                <Background pattern-color="#222" :size="1" :gap="20" />
                <Controls :showInteractive="false" position="top-right">
                    <ControlButton title="Reset Transform">
                        <span class="material-symbols-outlined">refresh</span>
                    </ControlButton>
                </Controls>
            </VueFlow>
        </div>
    </div>
</template>

<script setup lang="ts">
import { VueFlow, useVueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { ControlButton, Controls } from '@vue-flow/controls'
import WorkflowCanvas from "./Workflow.Canvas";
import Sidebar from "@/components/Workflow/Sidebar/Workflow.Canvas.SideBar.vue";
import LogModal from "@/components/Workflow/Modal/Workflow.Log.Modal.vue";
import { ref } from "vue";

const tags = ref<string[]>([])
const props = defineProps(['id']);
const tab = WorkflowCanvas.findTabById(props.id) || { name: '', tags: [], description: '' };
</script>

<style scoped src="./Workflow.Canvas.css"></style>