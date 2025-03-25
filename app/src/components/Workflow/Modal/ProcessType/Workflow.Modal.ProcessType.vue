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
                    <input
                    type="text" 
                    class="input" 
                    id="name" 
                    placeholder="Event Name"
                    v-model="tab.nodesList[0].data.name"
                    v-if="tab.nodesList && tab.nodesList[0] && tab.nodesList[0].data" />
                </div>
                <div v-else-if="isSelected('webhook')" class="fields">
                    <label for="name">Name: </label>
                    <input
                        type="text"
                        class="input"
                        id="name" 
                        placeholder="Name of webhook"
                        v-model="tab.nodesList[0].data.name" 
                        v-if="tab.nodesList && tab.nodesList[0] && tab.nodesList[0].data" />
                    <label
                        for="url"
                        v-if="tab.nodesList && tab.nodesList[0].data && tab.nodesList[0].data.name && tab.nodesList[0].data.name.length > 0">
                        Webhook Url:
                    </label>
                    <span style="display: flex; align-items: center; position: relative;"
                        v-if="tab.nodesList && tab.nodesList[0].data && tab.nodesList[0].data.name && tab.nodesList[0].data.name.length > 0">
                        <input type="text" class="input" id="url" :value="webhookUrl" readonly />
                        <span class="material-symbols-outlined copy-btn" @click="copyToClipboard(id)">content_copy</span>
                        <span class="tooltip" v-if="showTooltip">URL copied!</span>
                    </span>
                </div>
                <div v-else-if="isSelected('interval')" class="fields">
                    <label for="name">Type: </label>
                    <select
                    class="input"
                    v-model="tab.nodesList[0].data.type"
                    v-if="tab.nodesList[0].data">
                        <option value="seconds">Seconds</option>
                        <option value="minutes">Minutes</option>
                        <option value="hours">Hours</option>
                        <option value="days">Days</option>
                    </select>
                    <label for="interval">Interval: </label>
                    <input type="number" class="input" id="interval" placeholder="Interval in seconds"
                        v-model="tab.nodesList[0].data.interval" v-if="tab.nodesList[0].data" />
                    <label>Days of the week:</label>
                    <div class="week">
                        <div class="weekdays">
                            <label v-for="(day, index) in ['S', 'M', 'T', 'W', 'T', 'F', 'S']" :key="day"
                                class="day-box">
                                <input type="checkbox" :value="day" v-model="tab.nodesList[0].data.weeks.boolitemsList[index]"
                                    v-if="tab.nodesList && tab.nodesList[0].data && tab.nodesList[0].data.weeks" />
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
import WorkflowIcon from '@/components/Workflow/Workflow.Icon.vue';
import { ProcessTypeProps } from './Workflow.Modal.ProcessType.types'
import { useTab } from '@/views/Workflow'
import { useProcessTypeHooks, useProcessTypeStore } from './Workflow.Modal.ProcessTab.hooks'
import { useProcessTypeHelpers, copyToClipboard } from './Workflow.Modal.ProcessType.helper'

const props = defineProps<ProcessTypeProps>()
const { tab } = useTab(props.id)
const { webhookUrl, isSelected } = useProcessTypeHooks(props.id)
const { showTooltip } = useProcessTypeStore()
const { selectNode } = useProcessTypeHelpers(props.id)
</script>

<style scoped src="./Workflow.Modal.ProcessType.styles.css"></style>