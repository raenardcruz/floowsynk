import { useWorkflowCanvasHooks, useWorkflowCanvasStore } from '../Workflow.Canvas.hooks'
import { WorkflowCanvasProps } from '../Workflow.Canvas.types'
import { useNotif, NotifOptions, STATUS_ERROR, STATUS_INFO, STATUS_SUCCESS } from '@/components/Composable/UI/Notif'
import { initWorkflows } from '@/components/Workflow/Process'
import { useWorkflowStore } from '@/views/Workflow'
import { StreamType, NodeStatus } from 'proto/floowsynk_pb'
import {
  createProcess,
  updateProcess,
  executeProcess,
  deleteProcess
} from '../Workflow.Canvas.api'

export const useWorkflowCanvasControlButtonActions = (props: WorkflowCanvasProps, vueFlowInstance: any) => {
  const {
    tabs,
    activeTab,
  } = useWorkflowStore();
  const {
    nodeStatuses,
    runningTabs,
  } = useWorkflowCanvasStore();
  const { tab } = useWorkflowCanvasHooks(props.id);
  // Method: Save
  const saveProcess = async () => {
    try {
      if (tab.value.isnew) {
        await createProcess(tab.value);
        await initWorkflows();
        tab.value.isnew = false;
      } else {
        await updateProcess(tab.value);
      }
      useNotif({
        duration: 5000,
        teleportTarget: `#${btoa(tab.value.id)}`,
        message: "Workflow saved successfully",
        status: STATUS_SUCCESS
      } as NotifOptions);
    }
    catch (error) {
      useNotif({
        duration: 5000,
        teleportTarget: `#${btoa(tab.value.id)}`,
        message: "Failed to save workflow: " + error,
        status: STATUS_ERROR
      } as NotifOptions);
    }
  }
  // Method: Delete
  const removeProcess = async () => {
    try {
      await deleteProcess(tab.value);
      useNotif({
        duration: 5000,
        teleportTarget: `#${btoa(tab.value.id)}`,
        message: "Workflow deleted successfully",
        status: STATUS_INFO
      } as NotifOptions);
      await initWorkflows();
      tabs.value.splice(tabs.value.indexOf(tab.value), 1);
      activeTab.value = 'main';
    }
    catch (error) {
      useNotif({
        duration: 5000,
        teleportTarget: `#${btoa(tab.value.id)}`,
        message: "Failed to delete workflow",
        status: STATUS_ERROR
      } as NotifOptions);
    }
  }

  const runProcess = async () => {
    nodeStatuses.value = {};
    runningTabs.value.push(tab.value.id);
    let stream = await executeProcess(tab.value);
    useNotif({
      duration: 5000,
      teleportTarget: `#${btoa(tab.value.id)}`,
      message: "Workflow started successfully: ",
      status: STATUS_INFO
    } as NotifOptions);
    stream.on('data', (response) => {
      if (response.getStreamtype() == StreamType.STATUS) {
        switch (response.getStatus()) {
          case NodeStatus.RUNNING:
            nodeStatuses.value[response.getNodeid()] = 'running';
            break;
          case NodeStatus.COMPLETED:
            nodeStatuses.value[response.getNodeid()] = 'success';
            break;
          case NodeStatus.FAILED:
            nodeStatuses.value[response.getNodeid()] = 'error';
            break;
        }
      }
    });
  }

  const resetTransform = function () {
    const { setViewport } = vueFlowInstance;
    setViewport({ x: 0, y: 0, zoom: 1 })
  };

  return {
    saveProcess,
    removeProcess,
    runProcess,
    resetTransform
  }
}