import { useProcessListStore } from './Process.List.hooks'
import { getAllWorkflows } from './Process.List.api'
import { Process } from '@/views/Workflow'
import { useWorkflowStore, newProcess } from '@/views/Workflow'
import { startNodes } from '@/components/Workflow/Nodes/FloowsynkNode.contants'

export const initWorkflows = async () => {
    const { processes } = useProcessListStore();
    let resp: any = await getAllWorkflows();
    processes.value = [];
    if (resp.data && resp.data.items) {
        resp.data.items.forEach((process: any) => {
            processes.value.push({ title: process.name, isnew: false, ...process });
        });
    }
}

export const cardClicked = (process: Process) => {
    const { tabs, activeTab } = useWorkflowStore();
    if (!tabs.value.some(existingTab => existingTab.id === process.id)) {
        tabs.value.push(process);
    }
    activeTab.value = process.id;
}

export const createProcess = () => {
    const { tabs, activeTab } = useWorkflowStore();
    let newProc = newProcess();
    if (newProc.nodes) {
        newProc.nodes.push(startNodes["defaultnode"]);
    }
    tabs.value.push(newProc);
    activeTab.value = newProc.id;
}
