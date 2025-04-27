import { ref, computed } from 'vue'
import { Workflow, WorkflowHistory } from 'proto/floowsynk_pb'
import { createGlobalState } from '@vueuse/core'

export const useProcessListStore = createGlobalState(() => {
    const processes = ref<Workflow.AsObject[]>([])
    const history = ref<WorkflowHistory.AsObject[]>([])
    const search = ref<string>("")

    return {
        processes,
        search,
        history
    }
})

export const useProcessListHooks = () => {
    const { processes, search } = useProcessListStore()
    const filteredProcesses = computed<Workflow.AsObject[]>(() => {
        if (search.value === "") {
            return processes.value
        }
        return processes.value.filter((process) =>
            process.name.toLowerCase().includes(search.value.toLowerCase())
        )
    })

    return {
        filteredProcesses
    }
}