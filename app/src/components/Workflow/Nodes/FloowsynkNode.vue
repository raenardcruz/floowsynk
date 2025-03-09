<template>
    <div class="node no-scroll nopan" :style="nodestyle" :class="{ 'node-selected': node.selected, [nodestatus]: true }"
        @click="clickHandler()">
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
        <SideBar :title="label" :caption="node.id" v-model:visible="show">
            <div v-if="node.data">
                <WorkflowNodeSidebarFields :nodeType="nodetype" v-model="node.data" :tabid="props.tabid" />
            </div>
        </SideBar>
    </Teleport>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Handle, Position, useNode } from '@vue-flow/core';
import { SideBar } from "@/components/Composable/UI";
import {SidebarCanvasFields as WorkflowNodeSidebarFields} from "@/components/Workflow/Sidebar"
import { NodeProps } from './FloowsynkNode.types'
import { useFloowsynkNodeHooks, useFloowsynkNodeWatchers } from './FloowsynkNode.hooks'
import { clickhandler } from './FloowsynkNode.helper'
import { Node } from '@/views/Workflow'
import { toSentenceCase } from "@/components/Composable/Utilities";

const props = defineProps<NodeProps>();
const { node } = useNode()
const { canvasId } = useFloowsynkNodeHooks(props.tabid)
const show = ref(false);
const { nodestatus } = useFloowsynkNodeWatchers(props.tabid, node, show)
const clickHandler = () => clickhandler(node, props.tabid, show)
const { icon, nodetype, label, outputs, inputs, nodestyle } = node as unknown as Node;
</script>

<style scoped src="./FloowsynkNode.styles.css"></style>