import { useProcessListStore } from './Process.List.hooks'
import { getAllWorkflows } from './Process.List.api'
import { useWorkflowStore, newProcess } from '@/views/Workflow'
import { startNodes } from '@/components/Workflow/Nodes/FloowsynkNode.contants'
import { WorkflowList, Workflow } from 'proto/floowsynk_pb'

export const initWorkflows = async () => {
    const { processes } = useProcessListStore();
    processes.value = [];
    let resp: WorkflowList = await getAllWorkflows(10, 0);
    const workflows: Workflow[] = resp.getWorkflowsList();
    
    if (!workflows || workflows.length === 0) return;
    
    workflows.forEach((process: Workflow) => {
        const p = process.toObject();
        processes.value.push({ isnew: false, ...p });
    });
}

export const cardClicked = (process: Workflow.AsObject) => {
    const { tabs, activeTab } = useWorkflowStore();
    if (!tabs.value.some(existingTab => existingTab.id === process.id)) {
        tabs.value.push(process);
    }
    activeTab.value = process.id;
}

export const createProcess = () => {
    const { tabs, activeTab } = useWorkflowStore();
    let newProc = newProcess();
    if (newProc.nodesList) {
        newProc.nodesList.push(startNodes["defaultnode"]);
    }
    tabs.value.push(newProc);
    activeTab.value = newProc.id;
}
