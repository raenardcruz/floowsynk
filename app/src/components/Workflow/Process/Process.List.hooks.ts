import { ref, computed } from 'vue'
import { Process } from '@/views/Workflow'

const processes = ref<Process[]>([]);
const search = ref<string>("");

export const useProcessListStore = () => {
    return {
        processes,
        search
    }
}

export const useProcessListHooks = () => {
    const filteredProcesses = computed<Process[]>(() => {
        if (search.value === "") {
            return processes.value;
        }
        return processes.value.filter((process) =>
            process.title.toLowerCase().includes(search.value.toLowerCase())
        );
    });

    return {
        filteredProcesses
    }
}