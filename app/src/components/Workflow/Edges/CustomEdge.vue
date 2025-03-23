<template>
    <BaseEdge :id="id" :style="edgeStyling" :path="path[0]" :marker-end="markerEnd" />
    <EdgeLabelRenderer>
        <div :style="{
            pointerEvents: 'all',
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${path[1]}px,${path[2]}px)`,
        }" class="nodrag nopan">
            <button @click="removeEdges(id)" v-if="!isRunning">
                <span class="material-symbols-outlined">cancel</span>
            </button>
        </div>
    </EdgeLabelRenderer>
</template>

<script lang="ts" setup>
import { BaseEdge, EdgeLabelRenderer, useVueFlow } from '@vue-flow/core'
import { CustomEdgeProps } from './CustomEdge.types'
import { useCustomEdgeHooks } from './CustomEdge.hooks'
import { useWorkflowCanvasHooks } from '@/components/Workflow/Canvas/Workflow.Canvas.hooks'

const props = defineProps<CustomEdgeProps>()
const { removeEdges } = useVueFlow()
const { path, edgeStyling } = useCustomEdgeHooks(props)
const { isRunning } = useWorkflowCanvasHooks(props.tabId)
</script>

<style scoped src='./CustomEdge.styles.css'></style>
