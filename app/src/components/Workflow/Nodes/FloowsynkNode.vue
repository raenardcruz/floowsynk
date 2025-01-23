<template>
    <div class="node no-scroll nopan" :style="nodestyle" :class="{ 'node-selected': node.selected }">
        <div class="icon" :style="{ background: icon.color }">
            <span class="material-symbols-outlined">{{ icon.name }}</span>
        </div>
        <div class="content">
            <div class="label" v-if="label.length > 0">{{ label }}</div>
            <div class="type">{{ type }}</div>
        </div>
        <Handle
    class="handle-input"
    v-if="outputs"
    v-for="(input, index) in inputs" 
    :key="input" 
    :id="input"
    :data-output="input"
    type="target"
    :position="Position.Left"
    :style="{ top: `${(100 / (outputs.length + 1)) * (index + 1)}%` }" />
    <Handle
    class="handle-output"
    v-if="outputs"
    v-for="(output, index) in outputs" 
    :key="output" 
    :id="output"
    :data-output="output"
    type="source"
    :position="Position.Right"
    :style="{ top: `${(100 / (outputs.length + 1)) * (index + 1)}%` }" />
    </div>
</template>

<script setup lang="ts">
    import { Handle, Position, useNode } from '@vue-flow/core'
    import { Node } from "@/components/Common/Interfaces";

    const { 
        node
    } = useNode()

    const { icon, type, label, outputs, inputs, nodestyle } = node as unknown as Node;
</script>

<style scoped src="./FloowsynkNode.css"></style>