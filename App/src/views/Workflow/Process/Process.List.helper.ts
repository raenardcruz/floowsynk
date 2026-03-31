import { useProcessListStore } from './Process.List.hooks'
import { getAllWorkflows, listWorkflowRunHistory, getWorkflowHistory } from './Process.List.api'
import { useWorkflowStore, newProcess } from '@/views/Workflow'
import { startNodes } from '@/views/Workflow/Nodes/FloowsynkNode.contants'
import { Workflow, WorkflowHistory, NodeStatus } from 'proto/workflow/workflow_pb'
import { useWorkflowCanvasStore } from '../Canvas/Workflow.Canvas.hooks'

export const initWorkflows = async () => {
    const { processes, history } = useProcessListStore()
    processes.value = []
    const [ respHistory, respProcesses ] = await Promise.all([ listWorkflowRunHistory(), getAllWorkflows(10, 0) ])
    
    const workflows: Workflow[] = respProcesses.getWorkflowsList() || []
    workflows.forEach((process: Workflow) => {
        const p = process.toObject()
        processes.value.push({ isnew: false, ...p })
    })

    const historyList: WorkflowHistory[] = respHistory.getHistoryList() || []
    historyList.forEach((data: WorkflowHistory) => {
        history.value.push(data.toObject())
    })
}

export const cardClicked = (e: MouseEvent, process: Workflow.AsObject) => {
    const { tabs, activeTab } = useWorkflowStore()
    if (!tabs.value.some(existingTab => existingTab.id === process.id)) {
        tabs.value.push(process)
    }
    if (e.ctrlKey) return
    activeTab.value = process.id
}

export const createProcess = () => {
    const { tabs, activeTab } = useWorkflowStore()
    let newProc = newProcess()
    if (newProc.nodesList) {
        newProc.nodesList.push(startNodes["defaultnode"])
    }
    tabs.value.push(newProc)
    activeTab.value = newProc.id
}

export const historyClicked = async (historyItem: WorkflowHistory.AsObject) => {
    const { tabs, activeTab } = useWorkflowStore()
    const { processes } = useProcessListStore()
    if (!tabs.value.some(existingTab => existingTab.id === historyItem.workflowid)) {
        tabs.value.push(processes.value.find(process => process.id === historyItem.workflowid) as Workflow.AsObject)
    }
    activeTab.value = historyItem.workflowid
    const { replayData, showReplayData, isRunning, nodeStatuses } = useWorkflowCanvasStore(historyItem.workflowid)
    isRunning.value = true
    nodeStatuses.value = {}
    replayData.value = []
    showReplayData.value = false
    const resp = await getWorkflowHistory(historyItem.id)
    const dataList = resp.getDataList() || []
    for (const response of dataList) {
        switch (response.getStatus()) {
                case NodeStatus.RUNNING:
                  nodeStatuses.value[response.getNodeid()] = 'running'
                  break
                case NodeStatus.COMPLETED:
                  nodeStatuses.value[response.getNodeid()] = 'success'
                  break
                case NodeStatus.FAILED:
                  nodeStatuses.value[response.getNodeid()] = 'error'
                  break
                case NodeStatus.INFO:
                  nodeStatuses.value[response.getNodeid()] = 'info'
                  break
              }
              replayData.value.push(response.toObject())
    }
    showReplayData.value = true
}