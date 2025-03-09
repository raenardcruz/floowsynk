import { ref, computed } from 'vue';
import { useTab } from '@/views/Workflow'
import { WorkflowCanvasProps } from './Workflow.Canvas.types'
import { NotifOptions, useNotif } from '@/components/Composable/UI/Notif'

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

    return {
        tab,
        canvasId,
    }
}

export const useWorkflowCanvasEvents = (props: WorkflowCanvasProps) => {
    const { tab } = useWorkflowCanvasHooks(props.id);
    const eventSource = new EventSource(`/api/workflow/${tab.value.id}/events`);
    eventSource.addEventListener('Complete', (event: any) => {
        useNotif({
            message: `Process Completed. ${event.data}`,
            duration: 5000,
            teleportTarget: `#${tab.value.id}`,
        } as NotifOptions)
    });
    eventSource.addEventListener('NodeStatus', (event: any) => {
        let nodeData = JSON.parse(event.data);
        // queueStatusUpdate(nodeData.nodeId, nodeData.status);
        nodeStatuses.value = {
            ...nodeStatuses.value,
            [nodeData.nodeId]: nodeData.status
        };
    });
    eventSource.addEventListener('Replay', (event: any) => {
        console.log(event);
    });
}

  // let pendingUpdates: { [key: string]: string } = {};
// let updateScheduled = false;

// const processStatusUpdates = () => {
//   if (Object.keys(pendingUpdates).length > 0) {
//     nodeStatuses.value = {
//       ...nodeStatuses.value,
//       ...pendingUpdates
//     };
//     pendingUpdates = {};
//   }
//   updateScheduled = false;
// };

// export const queueStatusUpdate = (nodeId: string, status: string) => {
//   pendingUpdates[nodeId] = status;
//   if (!updateScheduled) {
//     updateScheduled = true;
//     requestAnimationFrame(processStatusUpdates);
//   }
// };