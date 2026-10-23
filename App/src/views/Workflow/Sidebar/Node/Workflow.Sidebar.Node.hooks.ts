import { computed } from 'vue'
import { useTab } from '@/views/Workflow'
import { useProcessListStore } from '@/views/Workflow/Process'
import { Workflow } from 'proto/workflow/workflow_pb'
import { useWorkflowCanvasStore } from '@/views/Workflow/Canvas'

const { processes } = useProcessListStore()

export const useSidebarNodeHooks = (tabId: string) => {
    const { tab } = useTab(tabId)
    const { replayData } = useWorkflowCanvasStore(tabId)
    const filteredProcesses = computed(() => {
        return processes.value.filter((process: Workflow.AsObject) => process.type == "default")
    })

    const variables = computed((): Array<string> => {
        const varSet = new Set<string>([
            'input',
            'output',
            'webhook_body',
            'webhook_headers',
            'webhook_query'
        ])

        // 1. Declared output variables from all nodes in current tab
        const nodes = (tab.value?.nodesList || []) as any[]
        for (const node of nodes) {
            if (!node || !node.data) continue
            const data = node.data
            if (typeof data.name === 'string' && data.name.trim()) {
                varSet.add(data.name.trim())
            }
            if (typeof data.variable === 'string' && data.variable.trim()) {
                varSet.add(data.variable.trim())
            }
            if (typeof data.listvariable === 'string' && data.listvariable.trim()) {
                varSet.add(data.listvariable.trim())
            }
            if (typeof data.ragoutputvar === 'string' && data.ragoutputvar.trim()) {
                varSet.add(data.ragoutputvar.trim())
            }
        }

        // 2. Runtime variables captured in replayData from most recent test run
        const extractFromReplay = (list: any[]) => {
            if (!Array.isArray(list)) return
            for (const step of list) {
                if (!step) continue
                const vMap = step.variablesMap ?? step.variables
                if (!vMap) continue
                if (Array.isArray(vMap)) {
                    for (const item of vMap) {
                        if (Array.isArray(item) && item.length >= 1) {
                            const k = String(item[0]).trim()
                            if (k) varSet.add(k)
                        } else if (item && typeof item === 'object') {
                            const k = String(item.key || item.name || item[0] || '').trim()
                            if (k) varSet.add(k)
                        }
                    }
                } else if (typeof vMap === 'object') {
                    for (const k of Object.keys(vMap)) {
                        const trimmed = k.trim()
                        if (trimmed) varSet.add(trimmed)
                    }
                }
            }
        }

        extractFromReplay(replayData?.value || [])
        extractFromReplay((tab.value as any)?.replayData)

        return Array.from(varSet)
    })
    return {
        filteredProcesses,
        variables
    }
}