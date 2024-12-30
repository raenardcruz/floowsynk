import { ref } from "vue";

const activeTab = ref<string>('main');
const tabs = ref<string[]>([]);

export function workflowStore() {
    return {
        activeTab,
        tabs
    }
}

export class WorkflowHandler {
    selectTab(tabName: string) {
        activeTab.value = tabName;
    }

    closeTab(index: number, tabId: string) {
        tabs.value.splice(index, 1);
        if (activeTab.value == tabId)
            activeTab.value = 'main';
    }
}