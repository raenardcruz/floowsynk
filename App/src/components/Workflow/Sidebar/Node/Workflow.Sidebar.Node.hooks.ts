import { computed } from 'vue'
import { useTab } from '@/views/Workflow'
import { useProcessListStore } from '@/components/Workflow/Process'
import { Workflow } from 'proto/floowsynk_pb'

const { processes } = useProcessListStore()

export const useSidebarNodeHooks = (tabId: string) => {
    const { tab } = useTab(tabId)
    const filteredProcesses = computed(() => {
        return processes.value.filter((process: Workflow.AsObject) => process.type == "default")
    })

    const variables = computed(() : Array<any> => {
        return (tab.value.nodesList || [])
            .map(node => {
                if (node.nodetype === 'setVariable' && node.data?.name) {
                    return node.data.name
                } else if (node.data?.variable) {
                    return node.data.variable
                }
                return null
            })
            .filter(val => val !== null)
    })
    return {
        filteredProcesses,
        variables
    }
}