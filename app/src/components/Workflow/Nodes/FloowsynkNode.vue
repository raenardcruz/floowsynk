<template>
    <div class="node no-scroll">
        <div class="icon" :style="{ background: icon.color }">
            <span class="material-symbols-outlined">{{ icon.name }}</span>
        </div>
        <div class="content">
            <div class="label">{{ label }}</div>
            <div class="type">{{ type }}</div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { useNode } from '@vue-flow/core'
    import { Node } from "@/components/Common/Interfaces";

    const { 
        node
    } = useNode()

    const { icon, type, label } = node as unknown as Node;
</script>

<style scoped>
    .node {
        display: flex;
        align-items: center;
        justify-content: left;
        padding: 5px 15px 5px 5px;
        border: 1px solid #ccc;
        border-radius: 5px;
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
</style>