import { useWorkflowCanvasStore } from '@/components/Workflow/Canvas/Workflow.Canvas.hooks'

export const StepSelected = (tabId: string, index: number) => {
    const { selectedReplayData } = useWorkflowCanvasStore(tabId)
    selectedReplayData.value = index
}