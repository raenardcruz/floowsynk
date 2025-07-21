import { ref } from 'vue'
import { createGlobalState } from '@vueuse/core'

export const useComponentsContents = createGlobalState(() => {
    const activeSection = ref(1)
    
    return {
        activeSection
    }
})