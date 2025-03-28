import { ReplayData } from 'proto/floowsynk_pb';
import { useWorkflowCanvasStore } from '@/components/Workflow/Canvas/Workflow.Canvas.hooks'
export const StepSelected = (data: ReplayData.AsObject) => {
    const { selectedReplayData } = useWorkflowCanvasStore()
    console.log(data)
    selectedReplayData.value = data
}