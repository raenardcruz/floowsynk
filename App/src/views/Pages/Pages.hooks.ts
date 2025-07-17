import { ref } from 'vue'
import { createGlobalState } from '@vueuse/core'


export const usePagesStore = createGlobalState(() => {
    const activeTab = ref<number>(1)
    const droppedItems = ref<Array<any>>([])
    const styles = ref<Record<string, Array<any>>>({})
    const properties = ref<Record<string, Array<any>>>({})
    const selectedItem = ref<string>('')

    return {
        activeTab,
        droppedItems,
        styles,
        properties,
        selectedItem,
    }
})