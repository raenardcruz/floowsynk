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
                <div class="node-configuration">
                    <div class="node-configuration__label">
                        <span class="material-symbols-outlined node-configuration__labelicon">settings</span>
                        <span>Node configuration ({{ toSentenceCase(tab.nodesList?.[0]?.nodetype || tab.type) }})</span>
                    </div>
                    <Divider />
                    <WorkflowNodeSidebarFields
                        v-if="tab.nodesList?.[0]?.data"
                        :nodeType="tab.nodesList[0].nodetype"
                        v-model="tab.nodesList[0].data"
                        :tabid="props.id" />
                    <div v-else class="node-configuration__empty">
                        No additional fields required.
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import WorkflowIcon from '@/views/Workflow/Workflow.Icon.vue'
import Divider from 'primevue/divider'
import { ProcessTypeProps } from './Workflow.Modal.ProcessType.types'
import { useTab } from '@/views/Workflow'
import { useProcessTypeHooks } from './Workflow.Modal.ProcessTab.hooks'
import { useProcessTypeHelpers } from './Workflow.Modal.ProcessType.helper'
import { SidebarCanvasFields as WorkflowNodeSidebarFields } from '@/views/Workflow/Sidebar'
import { toSentenceCase } from '@/components/Composable/Utilities'

const props = defineProps<ProcessTypeProps>()
const { tab } = useTab(props.id)
const { isSelected } = useProcessTypeHooks(props.id)
const { selectNode } = useProcessTypeHelpers(props.id)
</script>

<style scoped src="./Workflow.Modal.ProcessType.styles.css"></style>
