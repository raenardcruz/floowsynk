import { GraphNode } from '@vue-flow/core';
import { Ref, computed, watch } from 'vue'
import { useWorkflowCanvasStore } from '@/components/Workflow/Canvas'
import { useWorkflowCanvasHooks } from '@/components/Workflow/Canvas/Workflow.Canvas.hooks'

export const useFloowsynkNodeHooks = (tabId: string) => {
    const canvasId = btoa(tabId);

    return {
        canvasId
    }
}

export const useFloowsynkNodeWatchers = (tabId: string, node: GraphNode<any, any, string>, show: Ref<boolean>) => {
    const { nodeStatuses, replayNodes } = useWorkflowCanvasStore();
    const { isRunning } = useWorkflowCanvasHooks(tabId)
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
    const nodestatus = computed(() => {
        if (node.id === '0') {
            return '';
        }
        return nodeStatuses.value[node.id] || '';
    })


    const nodeData = computed({
        get() {
            if (!isRunning.value) {
                return node.data;
            } else {
                if (replayNodes.value.findIndex(f => f.id === node.id) !== -1) {
                    return replayNodes.value.find(f => f.id === node.id)?.data ?? node.data;
                } else {
                    return node.data;
                }
            }
        },
        set(value) {
            if (!isRunning.value) {
                node.data = value;
            }
        }
    })

    return {
        nodestatus,
        nodeData
    }
}