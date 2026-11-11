import { ref, computed } from 'vue'
import { useTab } from '@/views/Workflow'
import { DenormalizeVueFlowObject } from '@/components/Composable/protoTransformers'
import { ReplayData } from 'proto/workflow/workflow_pb'
import { useMouse, useManualRefHistory } from '@vueuse/core'
import type { Node, Edge } from '@vue-flow/core'
import { getCanvasElementId } from '@/views/Workflow/Nodes/FloowsynkNode.hooks'

// Global Refs
const isDragOver = ref(false)
const clipBoard = ref({
    nodes: [] as any[],
    edges: [] as any[],
})
const tabStores: Record<string, any> = {}
const { x, y, } = useMouse({ touch: false })
const hadOpenModalSidebar = ref(false)

export const useWorkflowCanvasStore = (tabId: string) => {
    if (!tabStores[tabId]) {
        tabStores[tabId] = {
            isRunning: ref(false),
            nodeStatuses: ref<Record<string, string>>({}),
            replayData: ref<ReplayData.AsObject[]>([]),
            selectedReplayData: ref<number>(0),
            showReplayData: ref(false),
            activeInspectorNodeId: ref<string | null>(null),
            hadOpenModalSidebar,
        }
    }

    return tabStores[tabId]
}
export const useWorkflowCanvasGlbalStore = () => {
    return {
        isDragOver,
        clipBoard,
        mouseX: x,
        mouseY: y,
    }
}
export const useWorkflowCanvasHooks = (tabId: string) => {
    const { tab } = useTab(tabId)
    const canvasId = computed(() => getCanvasElementId(tab.value.id || tabId))
    const node = computed({
        get: () => tab.value.nodesList.map((node: Object) => {
            const denormalizedNode = DenormalizeVueFlowObject(node);
            const style: Record<string, any> = { ...(denormalizedNode.style || {}) };
            if (denormalizedNode.dimensions?.width && !style.width) {
                style.width = `${denormalizedNode.dimensions.width}px`;
            }
            if (denormalizedNode.dimensions?.height && !style.height) {
                style.height = `${denormalizedNode.dimensions.height}px`;
            }
            return {
                ...denormalizedNode,
                position: denormalizedNode.position || { x: 0, y: 0 },
                style,
            } as Node<any, any, string>;
        }),
        set: (newNodes: any[]) => { 
            tab.value.nodesList = [...newNodes]
        }
    })
    const edge = computed({
        get: () => tab.value.edgesList.map((edge: Edge<any, any, string>) => DenormalizeVueFlowObject(edge)),
        set: (newEdges: any[]) => { 
            tab.value.edgesList = [...newEdges]
        }
    })
    const { commit, undo, redo, history } = useManualRefHistory(tab, { clone: true, capacity: 50 })

    return {
        tab,
        canvasId,
        node,
        edge,
        commit,
        undo,
        redo,
        history,
    }
}