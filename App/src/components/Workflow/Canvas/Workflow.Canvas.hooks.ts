import { ref, computed } from 'vue'
import { useTab } from '@/views/Workflow'
import { DenormalizeVueFlowObject } from '@/components/Composable/protoTransformers'
import { ReplayData } from 'proto/floowsynk_pb'
import { useMouse, useManualRefHistory } from '@vueuse/core'
import type { Node, Edge } from '@vue-flow/core'

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
    const canvasId = computed(() => btoa(tab.value.id))
    const node = computed({
        get: () => tab.value.nodesList.map((node: Object) => {
            const denormalizedNode = DenormalizeVueFlowObject(node);
            return {
                ...denormalizedNode,
                position: denormalizedNode.position || { x: 0, y: 0 },
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
    const { commit, undo, redo, history } = useManualRefHistory(tab, { clone: true, capacity: 200 })

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