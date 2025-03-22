import { useTab } from '@/views/Workflow'
import { useWorkflowCanvasHelperMethods } from '@/components/Workflow/Canvas'
import { startNodes } from '@/components/Workflow/Nodes';
import { useProcessTypeHooks, useProcessTypeStore } from './Workflow.Modal.ProcessTab.hooks'
import { Node } from 'proto/floowsynk_pb'

export const useProcessTypeHelpers = (tabId: string) => {
    const { tab } = useTab(tabId)
    const { saveState } = useWorkflowCanvasHelperMethods(tabId, null)
    const selectNode = (type: string) => {
        if (!tab.value.nodesList) return;
    
        saveState();
        let tmpNodes = JSON.parse(JSON.stringify(tab.value.nodesList));
        tmpNodes[0] = startNodes[type];
        tab.value = {
            ...tab.value,
            type,
            nodesList: tmpNodes as Node.AsObject[]
        };
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