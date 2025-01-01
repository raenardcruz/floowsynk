<template>
    <div class="background">
        <div class="modal">
            <div class="modal-header">
                <span class="material-symbols-outlined close-btn" @click="tab.showLogModal = false">close</span>
                <h4 style="margin-bottom: 20px;">Logs</h4>
            </div>
            <div class="modal-content">
                <table>
                    <tr>
                        <th>Execution Date</th>
                        <th>Step Id</th>
                        <th>Step</th>
                        <th>Messages</th>
                    </tr>
                    <tr v-if="tab.logging" v-for="log in tab.logging.sort((a, b) => a.stepCount - b.stepCount)" :key="log">
                        <td>{{ LogModal.utcDateToLocal(log.dateTime) }}</td>
                        <td>{{ log.stepId }}</td>
                        <td>
                            <span>{{log.label}}</span>
                            <span>({{ log.type }})</span>
                        </td>
                        <td>
                            <ul>
                                <li v-for="logmessage in log.messages" :key="logmessage">
                                    <span v-html="LogModal.displayText(logmessage)"></span>
                                </li>
                            </ul>
                        </td>
                    </tr>
                </table>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import LogModal from "./Workflow.Log.Modal";
    const props = defineProps(['id']);
    const tab = LogModal.getTab(props.id);
</script>