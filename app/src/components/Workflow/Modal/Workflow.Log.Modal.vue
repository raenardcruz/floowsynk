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
                            <td>{{ formatDateTime(log.dateTime) }}</td>
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
import LogModal from "./Workflow.Log.Modal";
import { computed } from 'vue';

interface Props {
    id: string;
}

const props = defineProps<Props>();
const tab = LogModal.getTab(props.id);

const sortedLogs = computed(() => {
    if (!tab?.logging) return [];
    return [...tab.logging].sort((a, b) => a.stepCount - b.stepCount);
});

const formatDateTime = (date: string) => {
    return LogModal.utcDateToLocal(date);
};

const displayText = (message: string) => {
    return LogModal.displayText(message);
};
</script>
