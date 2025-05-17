import { useWorkflowCanvasHooks, useWorkflowCanvasStore, useWorkflowCanvasGlbalStore } from '../Workflow.Canvas.hooks'
import { WorkflowCanvasProps } from '../Workflow.Canvas.types'
import { useWorkflowStore } from '@/views/Workflow'
import { generateUUID } from '@/components/Composable/Utilities'
import { useWorkflowCanvasKeyboardActions } from '../KeyboardActions/Workflow.Canvas.KeyboardActions'
import { useSidebarCanvasStore } from '@/components/Workflow/Sidebar/Canvas/Workflow.Sidebar.Canvas.hooks'
import { watch } from 'vue'
import { onKeyStroke, useCloned } from '@vueuse/core'
import { useWorkflowCanvasControlButtonActions } from '../ButtonActions/Workflow.Canvas.ButtonActions'
import { closeTabById } from '@/views/Workflow/Workflow.helpers'
import { useTab } from '@/views/Workflow/Workflow.hooks'

const { draggedNode } = useSidebarCanvasStore()

export const useWorkflowCanvasVueFlowEvents = (props: WorkflowCanvasProps, vueFlowInstance: any) => {
  const { saveProcess, exitRunMode, runProcess, removeProcess, resetTransform } = useWorkflowCanvasControlButtonActions(props, vueFlowInstance)
  const { activeTab } = useWorkflowStore()
  const { commit, undo, redo } = useWorkflowCanvasHooks(props.id)
  const { tab, setActiveTabToNext, setActiveTabToPrevious } = useTab(props.id)
  const {
    selectedReplayData,
    replayData,
    isRunning,
    showReplayData,
    hadOpenModalSidebar,
  } = useWorkflowCanvasStore(props.id)
  const { isDragOver, } = useWorkflowCanvasGlbalStore()

  // Method: On Connect Edge
  const onConnectEdge = (edge: any) => {
    if (isRunning.value) return
    if (activeTab.value != tab.value.id) return
    edge.type = "custom"
    edge.animated = true
    edge.tabId = tab.value.id
    if (tab.value.edgesList) {
      const edgeExists = tab.value.edgesList.some(e => e.source === edge.source && e.target === edge.target)
      if (!edgeExists) {
        tab.value.edgesList.push(edge)
      }
    } else {
      throw new Error(`Tab edges not found for id ${tab.value.id}`)
    }
  }
  // Method: On Node Drag End
  const onDragOver = (event: DragEvent) => {
    event.preventDefault()
    isDragOver.value = true
  }
  // Method: On drag Leave
  const onDragLeave = () => {
    isDragOver.value = false
  }
  // Method: On Drop
  const onDrop = (event: any) => {
    if (isRunning.value) return
    const { screenToFlowCoordinate } = vueFlowInstance
    const newNode: any = useCloned(draggedNode).cloned
    const x = event.clientX
    const y = event.clientY
    if (isNaN(x) || isNaN(y)) {
      return
    }
    const position = screenToFlowCoordinate({ x, y })
    if (newNode) {
      newNode.value.position = position
      newNode.value.id = generateUUID()
      if (!newNode.value.id) {
        throw new Error("Failed to generate node ID")
      }
    } else {
      throw new Error("Dragged node is null")
    }
    if (tab.value.nodesList) {
      tab.value.nodesList.push(newNode.value)
      commit()
    } else {
      throw new Error("Tab nodes not found")
    }
  }

  onKeyStroke((e) => {
    if (activeTab.value != tab.value.id) return
    const {
      getSelectedNodes,
      getSelectedEdges,
      addSelectedNodes } = vueFlowInstance
    const {
      copy,
      paste
    } = useWorkflowCanvasKeyboardActions(props, vueFlowInstance)
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return
    }
    // Select All
    if (e.ctrlKey && e.key.toLocaleLowerCase() === 'a') {
      e.preventDefault()
      if (tab.value.nodesList) {
        addSelectedNodes(tab.value.nodesList.filter(f => f.id != "1") as any)
      } else {
        throw new Error(`Tab nodes not found for id ${tab.value.id}`)
      }
    }
    // Copy
    else if (e.ctrlKey && e.key.toLocaleLowerCase() === 'c') {
      copy(getSelectedNodes, getSelectedEdges)
    }
    // Paste
    else if (e.ctrlKey && e.key.toLocaleLowerCase() === 'v') {
      if (isRunning.value) return
      paste()
      commit()
    }
    // Undo
    else if (e.ctrlKey && e.key.toLocaleLowerCase() === 'z') {
      undo()
    }
    // Redo
    else if (e.ctrlKey && e.key.toLocaleLowerCase() === 'y') {
      redo()
    }
    // Delete
    else if (e.key === 'Delete' || e.key === 'Backspace') {
      if (isRunning.value) return
      e.preventDefault()
      if (tab.value.nodesList) {
        const nodesToDelete = getSelectedNodes.value.filter((node: any) => node.id !== '0')
        tab.value.nodesList = tab.value.nodesList.filter((node: any) => !nodesToDelete.includes(node))
      } else {
        throw new Error(`Tab nodes not found for id ${tab.value.id}`)
      }
    }
    // Save Process
    else if (e.ctrlKey && e.key.toLocaleLowerCase() === 's') {
      e.preventDefault()
      saveProcess()
    }
    // Exit Run Mode 
    else if (e.key === 'Escape') {
      if (isRunning.value) {
        exitRunMode()
        return
      } else if (hadOpenModalSidebar.value) {
        return
      } else {
        closeTabById(activeTab.value)
      }
    }
    // Run
    else if (e.ctrlKey && e.key.toLocaleLowerCase() === 'enter') {
      if (isRunning.value) return
      runProcess()
    }
    // Reset Transform
    else if (e.ctrlKey && e.key.toLocaleLowerCase() === ' ') {
      resetTransform()
    }
    // Remove Process
    else if (e.ctrlKey && e.key.toLocaleLowerCase() === 'x') {
      if (isRunning.value) return
      removeProcess()
    }
    // Previous Replay Data
    else if (e.key === 'ArrowUp') {
      if (showReplayData.value)
        if (selectedReplayData.value > 0)
          selectedReplayData.value--
    }
    // Next Replay Data
    else if (e.key === 'ArrowDown') {
      if (showReplayData.value)
        if (selectedReplayData.value < replayData.value.length - 1)
          selectedReplayData.value++
    } else if (e.key === 'ArrowLeft') {
      setTimeout(() => setActiveTabToPrevious(), 10)
    } else if (e.key === 'ArrowRight') {
      setTimeout(() => setActiveTabToNext(), 10)
    }
  }, { dedupe: true })

  watch(selectedReplayData, (newValue) => {
    if (newValue >= 0 && newValue < replayData.value.length) {
      const nodeId = replayData.value[newValue]?.nodeid
      if (!nodeId) return

      const node = tab.value.nodesList?.find((n: any) => n.id === nodeId)
      if (!node) {
        console.warn(`Node with ID ${nodeId} not found`)
        return
      }

      const { setViewport } = vueFlowInstance
      const targetPosition = {
        x: node.position?.x ?? 0,
        y: node.position?.y ?? 0,
      }

      const currentViewport = vueFlowInstance.getViewport()
      const animationDuration = 300
      const frameRate = 60
      const totalFrames = (animationDuration / 1000) * frameRate
      const deltaX = (-targetPosition.x - currentViewport.x) / totalFrames
      const deltaY = (-targetPosition.y - currentViewport.y) / totalFrames

      let frame = 0
      const animate = () => {
        if (frame < totalFrames) {
          setViewport({
            x: currentViewport.x + deltaX * frame,
            y: currentViewport.y + deltaY * frame,
            zoom: 1,
          })
          frame++
          requestAnimationFrame(animate)
        } else {
          setViewport({
            x: -targetPosition.x,
            y: -targetPosition.y,
            zoom: 1,
          })
        }
      }

      animate()
    }
  })

  return {
    onConnectEdge,
    onDragOver,
    onDragLeave,
    onDrop,
    commit
  }
}