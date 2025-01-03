<template>
    <div class="node no-scroll" :style="nodestyle">
        <div class="icon" :style="{ background: icon.color }">
            <span class="material-symbols-outlined">{{ icon.name }}</span>
        </div>
        <div class="content">
            <div class="label">{{ label }}</div>
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

<style scoped>
    .node {
        display: flex;
        align-items: center;
        justify-content: left;
        padding: 5px 15px 5px 5px;
        border: 1px solid #ccc;
        cursor: pointer;
        background: #f0f0f0;
        gap: 20px;
        border-radius: 8px;
        width: fit-content;
        box-shadow: 3px 3px 5px #868686,-3px -3px 5px #fff;
    }

    .icon {
        display: flex;
        position: relative;
        font-size: 24px;
        height: 40px;
        width: 40px;
        color: #fff;
        justify-content: center;
        align-items: center;
        border-radius: 8px;
    }

    .content {
        display: flex;
        flex-direction: column;
    }

    .label {
        font-size: 14px;
        font-weight: bold;
    }

    .type {
        font-size: 12px;
        color: #666;
    }

    .node:hover .handle-input::before,
    .node:hover .handle-output::before {
        opacity: 1;
    }

    .handle-input::before,
    .handle-output::before {
        content: attr(data-output);
        position: absolute;
        white-space: nowrap;
        font-size: 8px;
        top: -4px;
        background: #f0f0f0;
        border: solid 1px #ccc;
        border-radius: 8px;
        padding: 0 5px;
        opacity: 0;
        transition: all 0.3s;
    }

    .handle-input::before {
        left: -40px;
    }
    .handle-output::before {
        right: -45px;
    }
</style>