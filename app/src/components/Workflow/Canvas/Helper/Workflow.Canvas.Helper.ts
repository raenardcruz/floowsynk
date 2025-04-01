import { useWorkflowCanvasHooks, useWorkflowCanvasGlbalStore } from '../Workflow.Canvas.hooks'
import { generateUUID } from '@/components/Composable/Utilities'

export const useWorkflowCanvasHelperMethods = (tabId: string, vueFlowInstance: any) => {
  const { tab } = useWorkflowCanvasHooks(tabId)
  const { mouseX, mouseY } = useWorkflowCanvasGlbalStore()
  const calculateNodePosition = (nodeClip: any, counter: number) => {
    const { screenToFlowCoordinate } = vueFlowInstance
    const position = screenToFlowCoordinate({ x: mouseX.value, y: mouseY.value })

    if (counter > 0) {
      const offsetX = nodeClip.position.x
      const offsetY = nodeClip.position.y
      position.x += offsetX
      position.y += offsetY
    }

    return position
  }
  const createPastedNode = (nodeClip: any, position: any, tabId: string) => {
    return {
      ...nodeClip,
      id: generateUUID(),
      position,
      tabId
    }
  }

  const addTag = () => {
    let tags = tab.value.tagsList || []
    tab.value = {
      ...tab.value,
      tagsList: [...tags, '']
    }
  }

  const removeTag = (index: number) => {
    const newTags = [...tab.value.tagsList]
    newTags.splice(index, 1)
    tab.value = {
      ...tab.value,
      tagsList: newTags
    }
  }

  return {
    calculateNodePosition,
    createPastedNode,
    addTag,
    removeTag
  }
}