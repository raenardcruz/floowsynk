import { useTab } from '@/views/Workflow'

export const useProcessTypeHooks = (tabId: string) => {
    const { tab } = useTab(tabId)
    const isSelected = (type: string) => tab.value.type == type
    return {
        isSelected
    }
}
