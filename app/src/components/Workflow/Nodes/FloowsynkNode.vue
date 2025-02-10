<template>
    <div class="node no-scroll nopan" :style="nodestyle" :class="{ 'node-selected': node.selected }" @click="clickhandler">
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
    <Teleport to="#canvas-content">
        <Sidebar :title="label" :caption="node.id" v-model:visible="show">
            <div v-if="node.data">
                <div class="input" v-for="(value, key) in node.data" :key="key">
                    <legend class="sidebar-legend">
                        <div class="checkbox" v-if="(typeof value) == 'boolean'">
                            <input type="checkbox" v-model="node.data[key]"/>
                            <div class="label">{{ toSentenceCase(key.toString()) }}</div>
                        </div>
                        <span v-else>{{ toSentenceCase(key.toString()) }}</span>
                    </legend>
                    <input class="sidebar-input" type="text" v-model="node.data[key]" v-if="(typeof value) == 'string'"/>
                    <input class="sidebar-input" type="number" v-model="node.data[key]" v-if="(typeof value) == 'number'"/>
                </div>
            </div>
        </Sidebar>
    </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { Handle, Position, useNode, useVueFlow } from '@vue-flow/core';
import { Node } from "@/components/Common/Interfaces";
import Sidebar from "@/components/Common/UI/Sidebar.vue";

const {
    node
} = useNode()

const {
    id
} = useVueFlow()

const show = ref(false);

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
        const event = new CustomEvent('type-select', { detail: { tabid: id } });
        window.dispatchEvent(event);
    } else {
        show.value = true;
    }
}

const { icon, type, label, outputs, inputs, nodestyle } = node as unknown as Node;
</script>

<style scoped src="./FloowsynkNode.css"></style>