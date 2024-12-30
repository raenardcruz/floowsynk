import { ref } from "vue";

export interface Tab {
    id: number;
    name: string;
}

const activeTab = ref<number>(0);
const tabs = ref<Tab[]>([]);

export class Workflow {
    static store = {
        activeTab,
        tabs
    }

    static selectTab(tabId: number) {
        activeTab.value = tabId;
    }

    static closeTabById(tabId: number) {
        const index = tabs.value.findIndex(tab => tab.id === tabId);
        if (index !== -1) {
            tabs.value.splice(index, 1);
            if (activeTab.value === tabId) {
                activeTab.value = 0;
            }
        }
    }
}