import { computed } from 'vue'
import {useTab } from '@/views/Workflow'

export const useWorkflowModalLogHooks = (tabId: string) => {
    const { tab } = useTab(tabId)
    const sortedLogs = computed(() => {
        if (!tab.value.logging) return [];
        return [...tab.value.logging].sort((a, b) => a.stepCount - b.stepCount);
    });

    return {
        sortedLogs
    }
}