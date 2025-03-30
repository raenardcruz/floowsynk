import { computed } from 'vue'
import { useWorkflowCanvasStore } from '@/components/Workflow/Canvas/Workflow.Canvas.hooks'

export const useReplayStoreHooks = (tabId: string) => {
    const { replayData, selectedReplayData } = useWorkflowCanvasStore(tabId)
    const selectedReplayDataData = computed({
        get: () => replayData.value[selectedReplayData.value]?.data || {},
        set: (value) => {
            if (selectedReplayData !== null && replayData.value[selectedReplayData.value]) {
                replayData.value[selectedReplayData.value].data = value;
            }
        }
    });

    return {
        selectedReplayDataData
    }
}