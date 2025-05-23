import { ref, computed } from 'vue'
import { nodes } from '@/components/Workflow/Nodes'
import { Node } from 'proto/workflow/workflow_pb'

const showSideBar = ref<boolean>(false)
const search = ref<string>('')
const draggedNode = ref<Node.AsObject | null>(null)
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
        return nodes.filter(f => f.nodetype.toLowerCase().includes(search.value))
    })

    return {
        searchNode,
    }
}