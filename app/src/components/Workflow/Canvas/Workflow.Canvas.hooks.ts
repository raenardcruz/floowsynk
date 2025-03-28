import { ref, computed } from 'vue';
import { useTab } from '@/views/Workflow'
import { DenormalizeVueFlowObject } from '@/components/Composable/protoTransformers'
import { ReplayData } from 'proto/floowsynk_pb'

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
const replayData =ref<ReplayData.AsObject[]>([]);
const selectedReplayData = ref<ReplayData.AsObject | null>(null);
const showReplayData = ref(false);

export const useWorkflowCanvasStore= () => {
    return {
        isDragOver,
        clipBoard,
        mousePosition,
        runningTabs,
        undoStack,
        redoStack,
        nodeStatuses,
        replayData,
        selectedReplayData,
        showReplayData,
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
    const isRunning = computed(() => {
        console.log('isRunning changed')
        return runningTabs.value.includes(tab.value.id);
    });

    return {
        tab,
        canvasId,
        node,
        edge,
        isRunning,
    }
}