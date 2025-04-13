import { ref } from "vue";
import { createGlobalState } from '@vueuse/core'

export const useAppDrawerStore = createGlobalState(() => {
    const appDrawer = ref(false);
    
    return {
        appDrawer
    }
})