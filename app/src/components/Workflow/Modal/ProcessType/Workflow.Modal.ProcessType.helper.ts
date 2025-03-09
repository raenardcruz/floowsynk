import { useTab } from '@/views/Workflow'
import { useWorkflowCanvasHelperMethods } from '@/components/Workflow/Canvas'
import { startNodes } from '@/components/Workflow/Nodes';
import { useProcessTypeHooks, useProcessTypeStore } from './Workflow.Modal.ProcessTab.hooks'

export const useProcessTypeHelpers = (tabId: string) => {
    const { tab } = useTab(tabId)
    const { saveState } = useWorkflowCanvasHelperMethods(tabId, null)
    const selectNode = (type: string) => {
        if (!tab.value.nodes) return;
    
        saveState();
        // TODO: Check if we still need to do this after the refactor
        tab.value.type = type;
        let tmpNodes = [...tab.value.nodes];
        tmpNodes[0] = startNodes[type];
        tab.value.nodes = [];
        setTimeout(() => tab.value.nodes = tmpNodes, 0);
    };

    return {
        selectNode
    }
}

export const copyToClipboard = async (tabId: string) => {
    const { showTooltip } = useProcessTypeStore()
    const { webhookUrl } = useProcessTypeHooks(tabId)
    try {
        await navigator.clipboard.writeText(webhookUrl.value);
        showTooltip.value = true;
        setTimeout(() => {
            showTooltip.value = false;
        }, 2000);
    } catch (err) {
        console.error('Failed to copy URL:', err);
    }
};