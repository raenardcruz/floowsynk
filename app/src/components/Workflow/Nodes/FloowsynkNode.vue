<template>
    <div class="node no-scroll nopan" :style="nodestyle" :class="{ 'node-selected': node.selected, [nodestatus]: true }" @click="clickhandler">
        <div class="icon" :style="{ background: icon.color }">
            <span class="material-symbols-outlined">{{ icon.name }}</span>
        </div>
        <div class="content">
            <div class="label" v-if="label.length > 0">{{ label }}</div>
            <div class="type">{{ toSentenceCase(nodetype) }}</div>
        </div>
        <Handle class="handle-input" v-if="outputs" v-for="(input, index) in inputs" :key="input" :id="input"
            :data-output="input" type="target" :position="Position.Left"
            :style="{ top: `${(100 / (outputs.length + 1)) * (index + 1)}%` }" />
        <Handle class="handle-output" v-if="outputs" v-for="(output, index) in outputs" :key="output" :id="output"
            :data-output="output" type="source" :position="Position.Right"
            :style="{ top: `${(100 / (outputs.length + 1)) * (index + 1)}%` }" />
    </div>
    <Teleport :to="'#' + canvasId">
        <Sidebar :title="label" :caption="node.id" v-model:visible="show">
            <div v-if="node.data">
                <WorkflowNodeSidebarFields :nodeType="nodetype" v-model="node.data" :tabid="props.tabid" />
            </div>
        </Sidebar>
    </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { Handle, Position, useNode } from '@vue-flow/core';
import { Node } from "@/components/Common/Interfaces";
import Sidebar from "@/components/Common/UI/Sidebar.vue";
import WorkflowNodeSidebarFields from "../Sidebar/Workflow.Node.Sidebar.Fields.vue";
import WorkflowCanvas from "@/components/Workflow/Canvas/Workflow.Canvas";

const {
    nodeStatuses,
    runningTabs,
} = WorkflowCanvas.store;
const {
    node
} = useNode()

const props = defineProps<{
    tabid: string;
}>();

const show = ref(false);
const canvasId = btoa(props.tabid);

const toSentenceCase = function (str: string): string {
    return str
        .replace(/([a-z])([A-Z])/g, '$1 $2') // insert space between camelCase words
        .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2') // insert space between PascalCase words
        .replace(/^./, (char) => char.toUpperCase()); // capitalize the first letter
}

watch(() => node.selected, (value) => {
    if (!value) {
        show.value = false;
    }
})

watch(() => node.dragging, (value) => {
    if (value) {
        show.value = false;
    }
})

const clickhandler = () => {
    if (node.id == '0') {
        const event = new CustomEvent('type-select', { detail: { tabid: props.tabid } });
        window.dispatchEvent(event);
    } else {
        show.value = true;
    }
}

const nodestatus = computed(() => {
    if (!isRunning.value) {
        return '';
    }
    if (node.id === '0') {
        return '';
    }
    return nodeStatuses.value[node.id] || '';
})

const isRunning = computed(() => {
    return runningTabs.value.includes(props.tabid);
})

const { icon, nodetype, label, outputs, inputs, nodestyle } = node as unknown as Node;
</script>

<style scoped src="./FloowsynkNode.css"></style>