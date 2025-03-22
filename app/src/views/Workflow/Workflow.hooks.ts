import { ref, computed } from "vue";
import { Workflow } from 'proto/floowsynk_pb';
import { newProcess } from "./Workflow.factory";

const activeTab = ref<string>('main');
const tabs = ref<Workflow.AsObject[]>([]);

export const useWorkflowStore = () => {
    return {
        activeTab,
        tabs
    }
}

export const useTab = (tabId: string) => {
    const tab = computed<Workflow.AsObject>({
        get() {
            return tabs.value.find(tab => tab.id === tabId) || newProcess();
        },
        set(newValue) {
            const index = tabs.value.findIndex(tab => tab.id === tabId);
            if (index !== -1) {
                tabs.value[index] = newValue;
            }
        }
    });

    return {
        tab
    }
}