import { ref } from "vue";
import { Process } from "@/components/Common/Interfaces";

const activeTab = ref<string>('main');
const tabs = ref<Process[]>([]);

export default class Workflow {
    static store = {
        activeTab,
        tabs
    }

    static selectTab(tabId: string) {
        activeTab.value = tabId;
    }

    static closeTabById(tabId: string) {
        const index = tabs.value.findIndex(tab => tab.id === tabId);
        if (index !== -1) {
            tabs.value.splice(index, 1);
            if (activeTab.value === tabId) {
                activeTab.value = 'main';
            }
        }
    }
}