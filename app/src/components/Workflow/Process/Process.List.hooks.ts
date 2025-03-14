import { ref, computed } from 'vue'
import { Workflow } from 'proto/floowsynk_pb'

const processes = ref<Workflow.AsObject[]>([]);
const search = ref<string>("");

export const useProcessListStore = () => {
    return {
        processes,
        search
    }
}

export const useProcessListHooks = () => {
    const filteredProcesses = computed<Workflow.AsObject[]>(() => {
        if (search.value === "") {
            return processes.value;
        }
        return processes.value.filter((process) =>
            process.name.toLowerCase().includes(search.value.toLowerCase())
        );
    });

    return {
        filteredProcesses
    }
}