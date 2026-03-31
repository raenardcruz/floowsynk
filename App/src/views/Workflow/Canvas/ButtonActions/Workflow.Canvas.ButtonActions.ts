import { ref } from 'vue'
import { useWorkflowCanvasHooks, useWorkflowCanvasStore } from '../Workflow.Canvas.hooks'
import { WorkflowCanvasProps } from '../Workflow.Canvas.types'
import { initWorkflows } from '@/views/Workflow/Process'
import { useWorkflowStore } from '@/views/Workflow'
import { WorkflowWebSocket } from '@/utils/websocket'
import { NodeStatus } from '@/utils/types'
import api from '@/utils/api';
import {
  createProcess,
  updateProcess,
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
  const isSaving = ref(false)
  // Method: Save
  const saveProcess = async () => {
    if (isSaving.value) return
    isSaving.value = true
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
    } finally {
      isSaving.value = false
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

    const ws = new WorkflowWebSocket(tab.value.id)
    ws.connect(
      (data) => {
        const { nodeId, status, message } = data
        switch (status) {
          case NodeStatus.RUNNING:
            nodeStatuses.value[nodeId] = 'running'
            break
          case NodeStatus.COMPLETED:
            nodeStatuses.value[nodeId] = 'success'
            replayData.value.push(data)
            break
          case NodeStatus.FAILED:
            nodeStatuses.value[nodeId] = 'error'
            replayData.value.push(data)
            break
          default:
            nodeStatuses.value[nodeId] = 'info'
            replayData.value.push(data)
            break
        }
      },
      (error) => {
        toast.add({ severity: 'error', summary: 'Error', detail: 'WebSocket connection failed', life: 3000 });
        isRunning.value = false
      },
      () => {
        showReplayData.value = true
        isRunning.value = false
      },
      {
        token: localStorage.getItem('sessionToken') ?? '',
        workflowId: tab.value.id,
      }
    )
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
