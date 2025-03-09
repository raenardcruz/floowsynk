import { useWorkflowStore } from './Workflow.hooks'

const { activeTab, tabs } = useWorkflowStore();

export const selectTab = (tabId: string) => {
    activeTab.value = tabId;
}

export const closeTabById = (tabId: string) => {
    const index = tabs.value.findIndex(tab => tab.id === tabId);
    if (index !== -1) {
        tabs.value.splice(index, 1);
        if (activeTab.value === tabId) {
            activeTab.value = 'main';
        }
    }
}