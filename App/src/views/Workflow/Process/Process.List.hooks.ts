import { ref, computed } from 'vue'
import { Workflow, WorkflowHistory } from '@/utils/types'
import { createGlobalState } from '@vueuse/core'

export const useProcessListStore = createGlobalState(() => {
    const processes = ref<Workflow[]>([])
    const history = ref<WorkflowHistory[]>([])
    const search = ref<string>("")

    return {
        processes,
        search,
        history
    }
})

export const useProcessListHooks = () => {
    const { processes, search } = useProcessListStore()
    const filteredProcesses = computed<Workflow[]>(() => {
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