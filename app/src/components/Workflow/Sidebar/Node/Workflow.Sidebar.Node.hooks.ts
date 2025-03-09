import { ref, computed } from 'vue'
import { Process, useTab } from '@/views/Workflow'
import { useProcessListStore } from '@/components/Workflow/Process'

const arraytype = ref('string');
const modalStates = ref<Record<string, boolean>>({});
const { processes } = useProcessListStore();

export const useSidebarNodeStore = () => {
    return {
        arraytype,
        modalStates
    }
}

export const useSidebarNodeHooks = (tabId: string) => {
    const { tab } = useTab(tabId);
    const filteredProcesses = computed(() => {
        return processes.value.filter((process: Process) => process.type == "default");
    })

    const variables = computed(() => {
        (tab.value.nodes || [])
            .map(node => {
                if (node.nodetype === 'setVariable' && node.data?.name) {
                    return node.data.name;
                } else if (node.data?.variable) {
                    return node.data.variable;
                }
                return null;
            })
            .filter(val => val !== null);
    })
    return {
        filteredProcesses,
        variables
    }
}