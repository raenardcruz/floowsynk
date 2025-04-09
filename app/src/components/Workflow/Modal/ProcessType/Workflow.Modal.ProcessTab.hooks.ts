import { ref, computed } from 'vue'
import { useTab } from '@/views/Workflow'
import { createGlobalState } from '@vueuse/core'

export const useProcessTypeStore = createGlobalState(() => {
    const showTooltip = ref(false)
    
    return {
        showTooltip
    }
})

export const useProcessTypeHooks = (tabId: string) => {
    const { tab } = useTab(tabId)
    const baseurl = window.location.origin
    const webhookUrl = computed(() => `${baseurl}/api/webhook/${tabId}`)
    const isSelected = (type: string) => tab.value.type == type
    return {
        webhookUrl,
        isSelected
    }
}