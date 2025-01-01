<template>
    <div class="logic-main">
        <div class="tabs">
            <div class="tab" :class="{ 'nav-active': activeTab == 'main' }"
                @click="activeTab = 'main'">
                Processes
            </div>
            <div class="tab" v-for="tab in tabs" :key="tab.id"
                :class="{ 'nav-active': activeTab == tab.id }"
                @click="activeTab = tab.id">
                {{ tab.title }}
                <div @click.stop="Workflow.closeTabById(tab.id)">
                    <span class="material-symbols-outlined close" style="color: red;">close</span>
                </div>
            </div>
        </div>
        <div class="logic-main-content">
            <div class="logic-main-workspace">
                <workflows-process-list class="content-animation" v-show="activeTab == 'main'" />
                <workflow-canvas class="content-animation" v-for="tab in tabs" :key="tab.id" v-show="activeTab == tab.id" :id="tab.id" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import Workflow from "./Workflow";
import WorkflowsProcessList from "../components/Workflow/ProcessList.vue";
import WorkflowCanvas from "../components/Workflow/Workflow.Canvas.vue";
const {
    tabs,
    activeTab,
} = Workflow.store;
</script>

<style scoped src="./Workflow.css"></style>