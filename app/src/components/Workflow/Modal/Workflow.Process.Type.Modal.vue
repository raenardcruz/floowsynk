<template>
    <div class="modalcontent">
        <div class="content">
            <div class="type-content">
                <div class="card" :class="{ selected: isSelected('defaultnode') || isSelected('default') }"
                    @click="selectNode('defaultnode')">
                    <WorkflowIcon type="defaultnode" />
                    <span>Default</span>
                </div>
                <div class="card" :class="{ selected: isSelected('webhook') }" @click="selectNode('webhook')">
                    <WorkflowIcon type="webhook" />
                    <span>Webhook</span>
                </div>
                <div class="card" :class="{ selected: isSelected('interval') }" @click="selectNode('interval')">
                    <WorkflowIcon type="interval" />
                    <span>Interval</span>
                </div>
                <div class="card" :class="{ selected: isSelected('events') }" @click="selectNode('events')">
                    <WorkflowIcon type="events" />
                    <span>Events</span>
                </div>
            </div>
            <div class="field-content">
                <div v-if="isSelected('defaultnode') || isSelected('default')">
                    No additional fields required.
                </div>
                <div v-if="isSelected('events')" class="fields">
                    <label for="name">Name: </label>
                    <input type="text" class="input" id="name" placeholder="Event Name" v-model="tab.nodes[0].data.name"
                        v-if="tab.nodes && tab.nodes[0]" />
                </div>
                <div v-else-if="isSelected('webhook')" class="fields">
                    <label for="name">Name: </label>
                    <input type="text" class="input" id="name" placeholder="Name of webhook"
                        v-model="tab.nodes[0].data.name" v-if="tab.nodes && tab.nodes[0]" />
                    <label for="url" v-if="tab.nodes && tab.nodes[0] && tab.nodes[0].data.name.length > 0">Webhook Url:
                    </label>
                    <span style="display: flex; align-items: center; position: relative;"
                        v-if="tab.nodes && tab.nodes[0] && tab.nodes[0].data.name.length > 0">
                        <input type="text" class="input" id="url" :value="webhookUrl" readonly />
                        <span class="material-symbols-outlined copy-btn" @click="copyToClipboard">content_copy</span>
                        <span class="tooltip" v-if="showTooltip">URL copied!</span>
                    </span>
                </div>
                <div v-else-if="isSelected('interval')" class="fields">
                    <label for="name">Type: </label>
                    <Select class="input" v-model="tab.nodes[0].data.type" v-if="tab.nodes && tab.nodes[0]">
                        <option value="seconds">Seconds</option>
                        <option value="minutes">Minutes</option>
                        <option value="hours">Hours</option>
                        <option value="days">Days</option>
                    </Select>
                    <label for="interval">Interval: </label>
                    <input type="number" class="input" id="interval" placeholder="Interval in seconds"
                        v-model="tab.nodes[0].data.interval" v-if="tab.nodes && tab.nodes[0]" />
                    <label>Days of the week:</label>
                    <div class="week">
                        <div class="weekdays">
                            <label v-for="(day, index) in ['S', 'M', 'T', 'W', 'T', 'F', 'S']" :key="day"
                                class="day-box">
                                <input type="checkbox" :value="day" v-model="tab.nodes[0].data.weeks[index]"
                                    v-if="tab.nodes && tab.nodes[0]" />
                                <span class="day-label">{{ day }}</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { defineProps, ref, reactive, computed } from 'vue';
import WorkflowIcon from '@/components/Workflow/Workflow.Icon.vue';
import TypeModal from './Workflow.Modal';
import { startNodes } from '@/components/Workflow/Nodes/node';

// Props
const props = defineProps(['id']);

// Reactive state
const tab = reactive(TypeModal.getTab(props.id));
const showTooltip = ref(false);

// Computed properties
const baseurl = window.location.origin;
const webhookUrl = computed(() => 
    tab.nodes && tab.nodes[0] 
        ? `${baseurl}/api/webhook/${encodeURIComponent(tab.nodes[0].data.name)}` 
        : ''
);

// Node selection functions
const isSelected = (type: string) => tab.type == type;

const selectNode = (type: string) => {
    if (!tab.nodes) return;
    
    tab.type = type;
    let tmpNodes = [...tab.nodes];
    tmpNodes[0] = startNodes[type];
    tab.nodes = [];
    setTimeout(() => tab.nodes = tmpNodes, 0);
};

// Utility functions
const copyToClipboard = async () => {
    try {
        await navigator.clipboard.writeText(webhookUrl.value);
        showTooltip.value = true;
        setTimeout(() => {
            showTooltip.value = false;
        }, 2000);
    } catch (err) {
        console.error('Failed to copy URL:', err);
    }
};
</script>

<style scoped>
.modalcontent {
    position: relative;
    display: flex;
    overflow: auto;
    height: 100%;
    width: 100%;
}
.content {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    border-top: solid 1px grey;
}

.content .type-content {
    position: relative;
    display: grid;
    grid-template-columns: repeat(2, auto);
    align-content: center;
    justify-content: center;
    align-self: center;
    grid-gap: 20px;
    width: 100%;
    height: fit-content;
    padding: 10px;
}

.content .type-content .card {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #f5f5f5;
    padding: 20px;
    border-radius: 5px;
    box-shadow: 3px 3px 5px #868686, -3px -3px 5px #fff;
    cursor: pointer;
    transition: all 0.3s ease;
}

.content .type-content .card:hover {
    box-shadow: 3px 3px 10px #868686, -3px -3px 10px #fff;
}

.content .type-content .card.selected {
    box-shadow: inset 3px 3px 5px #868686, inset -3px -3px 5px #fff !important;
}

.content .field-content {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    border-left: solid 1px grey;
    padding: 10px;
}

.fields {
    position: relative;
    display: grid;
    grid-template-columns: repeat(2, auto);
    align-content: center;
    justify-content: center;
    align-self: center;
    grid-gap: 20px;
    width: 100%;
    height: fit-content;
}

.fields .input {
    position: relative;
    display: block;
    width: 100%;
    padding: 10px;
    border: solid 1px grey;
    border-radius: 50px;
    box-shadow: inset 3px 3px 5px #868686, inset -3px -3px 5px #fff;
    transition: all 0.3s ease;
}

.week {
    position: relative;
    grid-column: span 2;
    width: 100%;
}

.weekdays {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    width: 100%;
}

.day-box {
    position: relative;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    user-select: none;
}

.day-box input[type="checkbox"] {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
}

.day-label {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: #f5f5f5;
    box-shadow: 3px 3px 5px #868686, -3px -3px 5px #fff;
    transition: all 0.3s ease;
}

.day-box input[type="checkbox"]:checked+.day-label {
    box-shadow: inset 3px 3px 5px #868686, inset -3px -3px 5px #fff;
    color: #4a90e2;
}

.day-box:hover .day-label {
    box-shadow: 3px 3px 10px #868686, -3px -3px 10px #fff;
}

.copy-btn {
    cursor: pointer;
}

.tooltip {
    position: absolute;
    right: -50px;
    top: 150%;
    transform: translateY(-50%);
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 5px 10px;
    border-radius: 4px;
    font-size: 12px;
    white-space: nowrap;
}

.tooltip::before {
    content: '';
    position: absolute;
    left: -5px;
    top: 50%;
    transform: translateY(-50%);
    border-width: 5px;
    border-style: solid;
    border-color: transparent rgba(0, 0, 0, 0.8) transparent transparent;
}
</style>