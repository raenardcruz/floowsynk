import { useWorkflowCanvasHooks, useWorkflowCanvasGlbalStore } from '../Workflow.Canvas.hooks'
import { WorkflowCanvasProps } from '../Workflow.Canvas.types'
import { useWorkflowCanvasHelperMethods } from '../Helper/Workflow.Canvas.Helper'
import { generateUUID } from '@/components/Composable/Utilities'
import { useCloned } from '@vueuse/core'

export const useWorkflowCanvasKeyboardActions = (props: WorkflowCanvasProps, vueFlowInstance: any) => {
  const { tab  } = useWorkflowCanvasHooks(props.id)
  const { clipBoard } = useWorkflowCanvasGlbalStore()
  // Method: copy
  const copy = (selectedNodes: any, selectedEdges: any) => {
    clipBoard.value = {
      nodes: selectedNodes.value.map((node: any) => useCloned(node).cloned.value),
      edges: selectedEdges.value.map((edge: any) => useCloned(edge).cloned.value),
    }
  }
  // Method: paste
  const paste = () => {
    const { calculateNodePosition } = useWorkflowCanvasHelperMethods(props.id, vueFlowInstance)
    if (!clipBoard.value.nodes.length) return

    let idMapping: Record<string, string> = {}
    const newNodes: any[] = []

    clipBoard.value.nodes.forEach((nodeClip: any, index: number) => {
      const position = calculateNodePosition(nodeClip, index)
      if (!position) return

      const newNode = {
        ...nodeClip,
        id: generateUUID(),
        position: index === 0 ? position : {
          x: position.x,
          y: position.y
        },
        tabId: tab.value.id
      }

      if (!tab.value.nodesList) {
        throw new Error(`Tab nodes not found for id ${tab.value.id}`)
      }
      tab.value.nodesList.push(newNode)
      newNodes.push(newNode)
      idMapping[nodeClip.id] = newNode.id
    })

    // Process edges
    if (clipBoard.value.edges.length > 0) {
      clipBoard.value.edges.forEach((edgeClip: any) => {
        const newSource = idMapping[edgeClip.source]
        const newTarget = idMapping[edgeClip.target]

        if (newSource && newTarget) {
          const newEdge = {
        ...useCloned(edgeClip).cloned.value,
        id: generateUUID(),
        source: newSource,
        target: newTarget,
        tabId: tab.value.id
          }

          if (!tab.value.edgesList) {
        throw new Error(`Tab edges not found for id ${tab.value.id}`)
          }
          tab.value.edgesList.push(newEdge)
        }
      })
    }
  }

  return {
    copy,
    paste
  }
}