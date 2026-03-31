import { useTab } from '@/views/Workflow'
import { useWorkflowCanvasHooks } from '@/views/Workflow/Canvas/Workflow.Canvas.hooks'
import { startNodes } from '@/views/Workflow/Nodes'
import { useProcessTypeHooks, useProcessTypeStore } from './Workflow.Modal.ProcessTab.hooks'
import { useCloned, useClipboard, useTimeoutFn } from '@vueuse/core'

export const useProcessTypeHelpers = (tabId: string) => {
    const { tab } = useTab(tabId)
    const { commit } = useWorkflowCanvasHooks(tabId)
    const selectNode = (type: string) => {
        if (!tab.value.nodes) return
    
        commit()
        let tmpNodes = useCloned(tab.value.nodes).cloned
        tmpNodes.value[0] = startNodes[type]
        tab.value = {
            ...tab.value,
            type,
            nodes: tmpNodes.value as any[]
        }
    }

    return {
        selectNode
    }
}

export const copyToClipboard = async (tabId: string) => {
    const { copy } = useClipboard()
    const { showTooltip } = useProcessTypeStore()
    const { webhookUrl } = useProcessTypeHooks(tabId)
    try {
        copy(webhookUrl.value)
        showTooltip.value = true
        useTimeoutFn(() => {
            showTooltip.value = false
        }, 2000)
    } catch (err) {
        console.error('Failed to copy URL:', err)
    }
}