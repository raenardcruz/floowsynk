import { useProcessListStore } from './Process.List.hooks'
import { getAllWorkflows, listWorkflowRunHistory, getWorkflowHistory } from './Process.List.api'
import { useWorkflowStore, newProcess } from '@/views/Workflow'
// import { startNodes } from '@/views/Workflow/Nodes/FloowsynkNode.contants' // Missing import or unused?
import { Workflow, WorkflowHistory, NodeStatus } from '@/utils/types'
import { useWorkflowCanvasStore } from '../Canvas/Workflow.Canvas.hooks'

export const initWorkflows = async () => {
    const { processes, history } = useProcessListStore()
    processes.value = []
    const [ respHistory, respProcesses ] = await Promise.all([ listWorkflowRunHistory(), getAllWorkflows(10, 0) ])
    
    const workflows: Workflow[] = respProcesses.workflows || []
    workflows.forEach((process: Workflow) => {
        processes.value.push({ isnew: false, ...process })
    })

    const historyItems: WorkflowHistory[] = respHistory || []
    historyItems.forEach((data: WorkflowHistory) => {
        history.value.push(data)
    })
}

export const cardClicked = (e: MouseEvent, process: Workflow) => {
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
    // if (newProc.nodes) {
    //     newProc.nodes.push(startNodes["defaultnode"])
    // }
    tabs.value.push(newProc)
    activeTab.value = newProc.id
}

export const historyClicked = async (historyItem: WorkflowHistory) => {
    const { tabs, activeTab } = useWorkflowStore()
    const { processes } = useProcessListStore()
    if (!tabs.value.some(existingTab => existingTab.id === historyItem.workflowId)) {
        const proc = processes.value.find(p => p.id === historyItem.workflowId);
        if (proc) {
            tabs.value.push(proc)
        }
    }
    activeTab.value = historyItem.workflowId
    const { replayData, showReplayData, isRunning, nodeStatuses } = useWorkflowCanvasStore(historyItem.workflowId)
    isRunning.value = true
    nodeStatuses.value = {}
    replayData.value = []
    showReplayData.value = false
    const resp = await getWorkflowHistory(historyItem.id)
    const dataList = resp || []
    for (const response of dataList) {
        switch (response.status) {
                case NodeStatus.RUNNING:
                  nodeStatuses.value[response.nodeId] = 'running'
                  break
                case NodeStatus.COMPLETED:
                  nodeStatuses.value[response.nodeId] = 'success'
                  break
                case NodeStatus.FAILED:
                  nodeStatuses.value[response.nodeId] = 'error'
                  break
                default:
                  nodeStatuses.value[response.nodeId] = 'info'
                  break
              }
              replayData.value.push(response)
    }
    showReplayData.value = true
}