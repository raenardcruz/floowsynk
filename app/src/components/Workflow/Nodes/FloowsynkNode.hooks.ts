import { GraphNode } from '@vue-flow/core';
import { Ref, computed, watch } from 'vue'
import { useWorkflowCanvasStore } from '@/components/Workflow/Canvas'

export const useFloowsynkNodeHooks = (tabId: string) => {
    const canvasId = btoa(tabId);

    return {
        canvasId
    }
}

export const useFloowsynkNodeWatchers = (tabId: string, node: GraphNode<any, any, string>, show: Ref<boolean>) => {
    const { nodeStatuses } = useWorkflowCanvasStore(tabId);
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

    return {
        nodestatus
    }
}