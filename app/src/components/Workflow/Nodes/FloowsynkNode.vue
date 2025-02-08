<template>
    <div class="node no-scroll nopan" :style="nodestyle" :class="{ 'node-selected': node.selected }" @dblclick="test">
        <div class="icon" :style="{ background: icon.color }">
            <span class="material-symbols-outlined">{{ icon.name }}</span>
        </div>
        <div class="content">
            <div class="label" v-if="label.length > 0">{{ label }}</div>
            <div class="type">{{ type }}</div>
        </div>
        <Handle class="handle-input" v-if="outputs" v-for="(input, index) in inputs" :key="input" :id="input"
            :data-output="input" type="target" :position="Position.Left"
            :style="{ top: `${(100 / (outputs.length + 1)) * (index + 1)}%` }" />
        <Handle class="handle-output" v-if="outputs" v-for="(output, index) in outputs" :key="output" :id="output"
            :data-output="output" type="source" :position="Position.Right"
            :style="{ top: `${(100 / (outputs.length + 1)) * (index + 1)}%` }" />
    </div>
    <Teleport to="#canvas-content" v-if="showSideBar && node.selected">
        <WorkflowNodeSidebar>
            <h1>{{ node.id }}</h1>
        </WorkflowNodeSidebar>
    </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Handle, Position, useNode, useVueFlow } from '@vue-flow/core';
import { Node } from "@/components/Common/Interfaces";
import WorkflowNodeSidebar from "@/components/Workflow/Sidebar/Workflow.Node.Sidebar.vue";

const {
    node
} = useNode()

const {
    getSelectedNodes
} = useVueFlow()

const test = () => {
    if (node.id == '0') {
        const startClicked = new CustomEvent('startClicked', {
            detail: {
                message: 'Start Node Clicked'
            }
        });
        document.dispatchEvent(startClicked);
    }
}

const showSideBar = computed(() => {
    return getSelectedNodes.value.length == 1 && node.id != "0";
});

const { icon, type, label, outputs, inputs, nodestyle } = node as unknown as Node;
</script>

<style scoped src="./FloowsynkNode.css"></style>