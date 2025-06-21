import { ref } from 'vue'
import { createGlobalState } from '@vueuse/core'


export const usePagesStore = createGlobalState(() => {
    const activeTab = ref<number>(1)

    return {
        activeTab,
    }
})