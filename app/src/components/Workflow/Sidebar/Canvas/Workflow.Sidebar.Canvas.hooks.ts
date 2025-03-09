import { ref, computed } from 'vue'
import { nodes } from '@/components/Workflow/Nodes'
import { Node } from '@/views/Workflow'

const showSideBar = ref<boolean>(false);
const search = ref<string>('');
const draggedNode = ref<Node | null>(null);
const expandGroup = ref<string[]>([]);

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
        return nodes.filter(f => f.nodetype.toLowerCase().includes(search.value) || f.label.toLowerCase().includes(search.value))
    })

    return {
        searchNode,
    }
}