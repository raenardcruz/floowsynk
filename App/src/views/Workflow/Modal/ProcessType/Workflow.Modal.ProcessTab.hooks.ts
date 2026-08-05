import { ref, computed } from 'vue'
import { useTab } from '@/views/Workflow'
import { createGlobalState } from '@vueuse/core'
import { getApiUrl } from '@/components/Composable/constants'

export const useProcessTypeStore = createGlobalState(() => {
    const showTooltip = ref(false)
    
    return {
        showTooltip
    }
})

export const useProcessTypeHooks = (tabId: string) => {
    const { tab } = useTab(tabId)
    const baseurl = getApiUrl()
    const webhookUrl = computed(() => `${baseurl}/api/webhook/${tabId}`)
    const isSelected = (type: string) => tab.value.type == type
    return {
        webhookUrl,
        isSelected
    }
}