import { ref, computed } from 'vue';
import { useTab } from '@/views/Workflow'
import { DenormalizeVueFlowObject } from '@/components/Composable/protoTransformers'

const isDragOver = ref(false);
const clipBoard = ref({
  nodes: [] as any[],
  edges: [] as any[],
});
const mousePosition = ref({ x: 0, y: 0 });
const runningTabs = ref<string[]>([]);
const undoStack = ref<{ nodes: any[], edges: any[] }[]>([]);
const redoStack = ref<{ nodes: any[], edges: any[] }[]>([]);
const nodeStatuses = ref<Record<string, string>>({});

export const useWorkflowCanvasStore= () => {
    return {
        isDragOver,
        clipBoard,
        mousePosition,
        runningTabs,
        undoStack,
        redoStack,
        nodeStatuses,
    }
}
export const useWorkflowCanvasHooks = (tabId: string) => {
    const { tab } = useTab(tabId);
    const canvasId = computed(() => btoa(tab.value.id));
    const node = computed({
        get: () => tab.value.nodesList.map(node => DenormalizeVueFlowObject(node)),
        set: (newNodes) => { tab.value.nodesList = newNodes; }
    });
    const edge = computed({
        get: () => tab.value.edgesList.map(edge => DenormalizeVueFlowObject(edge)),
        set: (newEdges) => { tab.value.edgesList = newEdges; }
    });

    return {
        tab,
        canvasId,
        node,
        edge,
    }
}