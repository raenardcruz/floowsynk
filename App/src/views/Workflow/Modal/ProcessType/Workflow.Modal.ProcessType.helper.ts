import { useTab } from '@/views/Workflow'
import { useWorkflowCanvasHooks } from '@/views/Workflow/Canvas/Workflow.Canvas.hooks'
import { startNodes } from '@/views/Workflow/Nodes'
import { Node } from 'proto/workflow/workflow_pb'
import { useCloned } from '@vueuse/core'

export const useProcessTypeHelpers = (tabId: string) => {
    const { tab } = useTab(tabId)
    const { commit } = useWorkflowCanvasHooks(tabId)
    const selectNode = (type: string) => {
        if (!tab.value.nodesList) return
    
        commit()
        let tmpNodes = useCloned(tab.value.nodesList).cloned
        tmpNodes.value[0] = startNodes[type]
        tab.value = {
            ...tab.value,
            type,
            nodesList: tmpNodes.value as Node.AsObject[]
        }
    }

    return {
        selectNode
    }
}
