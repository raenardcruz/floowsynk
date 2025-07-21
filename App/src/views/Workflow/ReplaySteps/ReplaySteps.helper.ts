import { useWorkflowCanvasStore } from '@/views/Workflow/Canvas/Workflow.Canvas.hooks'

export const StepSelected = (tabId: string, index: number) => {
    const { selectedReplayData } = useWorkflowCanvasStore(tabId)
    selectedReplayData.value = index
}