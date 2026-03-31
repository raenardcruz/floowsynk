import { useWorkflowCanvasHooks, useWorkflowCanvasStore } from '../Workflow.Canvas.hooks'
import { WorkflowCanvasProps } from '../Workflow.Canvas.types'
import { initWorkflows } from '@/views/Workflow/Process'
import { useWorkflowStore } from '@/views/Workflow'
import { NodeStatus, ReplayData, Node } from 'proto/workflow/workflow_pb'
import {
  createProcess,
  updateProcess,
  executeProcess,
  deleteProcess
} from '../Workflow.Canvas.api'
import { useToast } from 'primevue/usetoast'

export const useWorkflowCanvasControlButtonActions = (props: WorkflowCanvasProps, vueFlowInstance: any) => {
  const toast = useToast()
  const {
    tabs,
    activeTab,
  } = useWorkflowStore()
  const {
    nodeStatuses,
    replayData,
    showReplayData,
    isRunning,
  } = useWorkflowCanvasStore(props.id)
  const { tab } = useWorkflowCanvasHooks(props.id)
  // Method: Save
  const saveProcess = async () => {
    try {
      if (tab.value.isnew) {
        await createProcess(tab.value)
        await initWorkflows()
        tab.value.isnew = false
      } else {
        await updateProcess(tab.value)
      }
      console.log("Saved process:", tab.value)
      toast.add({severity:'success', summary: 'Success', detail: 'Workflow saved successfully', life: 3000});
    }
    catch (error) {
      toast.add({severity:'error', summary: 'Error', detail: 'Failed to save workflow' + error, life: 3000});
    }
  }
  // Method: Delete
  const removeProcess = async () => {
    try {
      await deleteProcess(tab.value)
      toast.add({severity:'success', summary: 'Success', detail: 'Workflow deleted successfully', life: 3000});
      await initWorkflows()
      tabs.value.splice(tabs.value.indexOf(tab.value), 1)
      activeTab.value = 'main'
    }
    catch (error) {
      toast.add({severity:'error', summary: 'Error', detail: 'Failed to delete workflow' + error, life: 3000});
    }
  }

  const runProcess = async () => {
    showReplayData.value = false
    replayData.value = []
    nodeStatuses.value = {}
    isRunning.value = true
    let stream = await executeProcess(tab.value)
    toast.add({severity:'success', summary: 'Success', detail: 'Workflow started successfully', life: 3000});
    stream.on('data', (response: ReplayData) => {
      const status: NodeStatus = response?.getStatus()
      switch (status) {
        case NodeStatus.RUNNING:
          nodeStatuses.value[response.getNodeid()] = 'running'
          break
        case NodeStatus.COMPLETED:
          nodeStatuses.value[response.getNodeid()] = 'success'
          replayData.value.push(response.toObject())
          break
        case NodeStatus.FAILED:
          nodeStatuses.value[response.getNodeid()] = 'error'
          replayData.value.push(response.toObject())
          break
        case NodeStatus.INFO:
          nodeStatuses.value[response.getNodeid()] = 'info'
          replayData.value.push(response.toObject())
          break
        default:
          nodeStatuses.value[response.getNodeid()] = 'error'
          break
      }
    })
    stream.on('end', () => {
      showReplayData.value = true
    })
  }

  const resetTransform = function () {
    const { setViewport } = vueFlowInstance
    setViewport({ x: 0, y: 0, zoom: 1 })
  }

  const exitRunMode = function () {
    isRunning.value = false
    tab.value.nodesList.forEach((node: Node.AsObject) => {
      nodeStatuses.value[node.id] = ''
    })
    showReplayData.value = false
  }

  return {
    saveProcess,
    removeProcess,
    runProcess,
    resetTransform,
    exitRunMode,
  }
}