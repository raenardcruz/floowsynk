<template>
    <div class="logic-main">
        <div class="tabs">
            <div class="tab" :class="{ 'nav-active': activeTab == 0 }"
                @click="activeTab = 0">
                Processes
            </div>
            <div class="tab" v-for="tab in tabs" :key="tab.id"
                :class="{ 'nav-active': activeTab == tab.id }"
                @click="activeTab = tab.id">
                {{ tab.name }}
                <div @click.stop="Workflow.closeTabById(tab.id)">
                    <span class="material-symbols-outlined close" style="color: red;">close</span>
                </div>
            </div>
        </div>
        <div class="logic-main-content">
            <div class="logic-main-workspace">
                <process-list class="content-animation" v-show="activeTab == 0" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Workflow } from "./Workflow";
import ProcessList from "../components/Workflow/ProcessList.vue";
const {
    tabs,
    activeTab,
} = Workflow.store;
</script>

<style scoped src="./Workflow.css"></style>