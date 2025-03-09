import { useSidebarCanvasStore } from './Workflow.Sidebar.Canvas.hooks'
import { useWorkflowCanvasStore } from '@/components/Workflow/Canvas'
import { nodes } from '@/components/Workflow/Nodes'
import { Node } from '@/views/Workflow'

const {
    draggedNode,
    expandGroup,
} = useSidebarCanvasStore();
const { isDragOver } = useWorkflowCanvasStore();

export const onDragStart = (node: Node) => {
    draggedNode.value = node;
    document.addEventListener('drop', onDragEnd);
}

export const onDragEnd = () => {
    isDragOver.value = false
    draggedNode.value = null
    document.removeEventListener('drop', onDragEnd)
}

export const expandToggle = (name: string) => {
    if (expandGroup.value.includes(name))
        expandGroup.value.splice(expandGroup.value.findIndex(f => f == name));
    else
        expandGroup.value.push(name)
}

export const groupNodes = (id: number): Node[] => {
    return nodes.filter(f => f.group.includes(id))
}