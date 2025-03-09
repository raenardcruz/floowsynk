<template>
    <div class="background">
        <div class="modal">
            <div class="modal-header">
                <span class="material-symbols-outlined close-btn" @click="tab.showLogModal = false">close</span>
                <h4 style="margin-bottom: 20px;">Logs</h4>
            </div>
            <div class="modal-content">
                <table class="log-table">
                    <thead>
                        <tr>
                            <th>Execution Date</th>
                            <th>Step Id</th>
                            <th>Step</th>
                            <th>Messages</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="!tab?.logging">
                            <td colspan="4">No logs available</td>
                        </tr>
                        <tr v-else v-for="log in sortedLogs" :key="log.stepId">
                            <td>{{ utcDateToLocal(log.dateTime) }}</td>
                            <td>{{ log.stepId }}</td>
                            <td>
                                <span>{{ log.label }}</span>
                                <span class="step-type">({{ log.type }})</span>
                            </td>
                            <td>
                                <ul class="message-list">
                                    <li v-for="(message, index) in log.messages" :key="index">
                                        <span v-html="displayText(message)"></span>
                                    </li>
                                </ul>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { WorkflowModalLogProps } from './Workflow.Modal.Log.types'
import { useTab } from '@/views/Workflow'
import { useWorkflowModalLogHooks } from './Workflow.Modal.Log.hooks'
import { utcDateToLocal, displayText } from './Workflow.Modal.Log.helper'

const props = defineProps<WorkflowModalLogProps>();
const { tab } = useTab(props.id);
const { sortedLogs } = useWorkflowModalLogHooks(props.id);
</script>

<style scoped src="./Workflow.Modal.Log.styles.css"></style>
