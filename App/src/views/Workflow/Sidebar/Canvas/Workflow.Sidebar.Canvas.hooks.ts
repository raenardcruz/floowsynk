import { ref, computed } from 'vue'
import { nodes } from '@/views/Workflow/Nodes'

const showSideBar = ref<boolean>(false)
const search = ref<string>('')
const draggedNode = ref<any | null>(null)
const expandGroup = ref<string[]>([])

export const useSidebarCanvasStore = () => {
    return {
        showSideBar,
        search,
        draggedNode,
        expandGroup,
    }
}

export const useFloowsynkNodeHooks = () => {
    const searchNode = computed(() => {
        return nodes.filter(f => f.nodeType.toLowerCase().includes(search.value.toLowerCase()))
    })

    return {
        searchNode,
    }
}