import Workflow from "../../views/Workflow";
import { Process } from "../Common/Interfaces"

export default class WorkflowCanvas {
    static store = {
        activeTab: Workflow.store.activeTab,
        tabs: Workflow.store.tabs
    }

    static findTabById(tabId: string): Process {
        const tab = Workflow.store.tabs.value.find(tab => tab.id === tabId);
        if (!tab) {
            throw new Error(`Tab with id ${tabId} not found`);
        }
        return tab as Process;
    }
}