import { ref, computed } from 'vue'
import { useTab } from '@/views/Workflow'

const showTooltip = ref(false);

export const useProcessTypeStore = () => {
    return {
        showTooltip
    }
}

export const useProcessTypeHooks = (tabId: string) => {
    const { tab } = useTab(tabId)
    const baseurl = window.location.origin;
    const webhookUrl = computed(() =>
        tab.value.nodes && tab.value.nodes[0]
            ? `${baseurl}/api/webhook/${encodeURIComponent(tab.value.nodes[0].data.name)}`
            : ''
    );
    const isSelected = (type: string) => tab.value.type == type;
    return {
        webhookUrl,
        isSelected
    }
}