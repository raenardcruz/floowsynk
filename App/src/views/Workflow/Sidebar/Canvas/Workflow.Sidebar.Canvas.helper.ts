import { useSidebarCanvasStore } from './Workflow.Sidebar.Canvas.hooks'
import { useWorkflowCanvasGlbalStore } from '@/views/Workflow/Canvas/Workflow.Canvas.hooks'
import { nodes } from '@/views/Workflow/Nodes'

export const onDragStart = (node: any) => {
    const {
        draggedNode,
    } = useSidebarCanvasStore()
    draggedNode.value = node
    document.addEventListener('drop', onDragEnd)
}

export const onDragEnd = () => {
    const {
        draggedNode,
    } = useSidebarCanvasStore()
    const { isDragOver } = useWorkflowCanvasGlbalStore()
    isDragOver.value = false
    draggedNode.value = null
    document.removeEventListener('drop', onDragEnd)
}

export const expandToggle = (name: string) => {
    const {
        expandGroup,
    } = useSidebarCanvasStore()
    if (expandGroup.value.includes(name))
        expandGroup.value.splice(expandGroup.value.findIndex(f => f == name))
    else
        expandGroup.value.push(name)
}

export const groupNodes = (id: number): any[] => {
    return nodes.filter(f => f.groupList.includes(id))
}