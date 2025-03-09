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
                <div @click.stop="closeTabById(tab.id)">
                    <span class="material-symbols-outlined close" style="color: red;">close</span>
                </div>
            </div>
        </div>
        <div class="logic-main-content">
            <div class="logic-main-workspace">
                <WorkflowsProcessList class="content-animation" v-show="activeTab == 'main'" />
                <WorkflowCanvas class="content-animation" v-for="tab in tabs" :key="tab.id" v-show="activeTab == tab.id" :id="tab.id" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import WorkflowsProcessList from "@/components/Workflow/Process/Process.List.vue";
import { WorkflowCanvas } from "@/components/Workflow/Canvas";
import { useWorkflowStore } from "./Workflow.hooks";
import { closeTabById } from './Workflow.helpers';

const {
    activeTab,
    tabs,
} = useWorkflowStore();
</script>

<style scoped src="./Workflow.styles.css"></style>