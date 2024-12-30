<template>
    <div class="logic-main">
        <div class="tabs">
                <div class="tab nav-active">Processes</div>
                <div class="tab">
                    1.0 sample
                    <div>
                        <span class="material-symbols-outlined close" style="color: red;">close</span>
                    </div>
                </div>
            </div>
        <div class="logic-main-content">
            <div class="logic-main-workspace">
                <process-list class="content-animation" v-show="activeTab == 'main'" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { workflowStore } from "./Workflow";
import ProcessList from "../components/Workflow/ProcessList.vue";

const { activeTab } = workflowStore();
</script>

<style scoped src="./Workflow.css"></style>