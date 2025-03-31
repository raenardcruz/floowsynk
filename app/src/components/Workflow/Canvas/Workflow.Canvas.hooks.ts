import { ref, computed } from 'vue';
import { useTab } from '@/views/Workflow'
import { DenormalizeVueFlowObject } from '@/components/Composable/protoTransformers'
import { ReplayData } from 'proto/floowsynk_pb'

// Global Refs
const isDragOver = ref(false);
const clipBoard = ref({
    nodes: [] as any[],
    edges: [] as any[],
})
const tabStores: Record<string, any> = {}; 

export const useWorkflowCanvasStore = (tabId: string) => {
    if (!tabStores[tabId]) {
        tabStores[tabId] = {
            mousePosition: ref({ x: 0, y: 0 }),
            isRunning: ref(false),
            undoStack: ref<{ nodes: any[], edges: any[] }[]>([]),
            redoStack: ref<{ nodes: any[], edges: any[] }[]>([]),
            nodeStatuses: ref<Record<string, string>>({}),
            replayData: ref<ReplayData.AsObject[]>([]),
            selectedReplayData: ref<number>(0),
            showReplayData: ref(false),
        };
    }

    return tabStores[tabId];
};
export const useWorkflowCanvasGlbalStore = () => {
    return {
        isDragOver,
        clipBoard,
    }
}
export const useWorkflowCanvasHooks = (tabId: string) => {
    const { tab } = useTab(tabId);
    const canvasId = computed(() => btoa(tab.value.id));
    const node = computed({
        get: () => tab.value.nodesList.map((node: any) => DenormalizeVueFlowObject(node)),
        set: (newNodes: any[]) => { 
            tab.value.nodesList = [...newNodes];
        }
    });
    const edge = computed({
        get: () => tab.value.edgesList.map((edge: any) => DenormalizeVueFlowObject(edge)),
        set: (newEdges: any[]) => { 
            tab.value.edgesList = [...newEdges];
        }
    });

    return {
        tab,
        canvasId,
        node,
        edge,
    }
}