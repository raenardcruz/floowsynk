import Workflow from "@/views/Workflow";
import { Process } from "@/components/Common/Interfaces";
import { ref } from "vue";
import SidebarHelper from "@/components/Workflow/Sidebar/Workflow.Canvas.Sidebar";
import { useVueFlow } from "@vue-flow/core";
import Utilities from "@/components/Common/Utilities";

const isDragOver = ref(false);

export default class WorkflowCanvas {
    static readonly store = {
        activeTab: Workflow.store.activeTab,
        tabs: Workflow.store.tabs,
        isDragOver
    }

    static findTabById(tabId: string): Process {
        const tab = Workflow.store.tabs.value.find(tab => tab.id === tabId);
        if (!tab) {
            throw new Error(`Tab with id ${tabId} not found`);
        }
        return tab as Process;
    }

    static onConnectEdge(edge: any, tabId: string) {
        const tab = this.findTabById(tabId);
        if (Workflow.store.activeTab.value != tabId) return;
        edge.animated = true;
        edge.tabId = tab.id;
        if (tab.edges) {
            tab.edges.push(edge);
        } else {
            throw new Error(`Tab edges not found for id ${tabId}`);
        }
    }

    static onDragOver(event: DragEvent) {
        event.preventDefault();
        isDragOver.value = true;
    }

    static onDragLeave() {
        isDragOver.value = false;
    }

    static onDrop(event: any, tabId: string) {
        const tab = this.findTabById(tabId);
        const { screenToFlowCoordinate } = useVueFlow();
        const node = SidebarHelper.store.draggedNode.value;
        const newNode = { ...node };
        const headerHeight = 159.4;
        const position = screenToFlowCoordinate({
            x: event.clientX,
            y: event.clientY - headerHeight,
        });
        if (node) {
            newNode.position = position;
            newNode.id = Utilities.generateUUID();
            if (!newNode.id) {
                throw new Error("Failed to generate node ID");
            }
        } else {
            throw new Error("Dragged node is null");
        }
        if (tab.nodes) {
            tab.nodes.push(newNode as Required<typeof newNode>);
        } else {
            throw new Error("Tab nodes not found");
        }
    }

    static onNodeDragEnd(event: any, tabId: string) {
        const tab = this.findTabById(tabId);
        const { screenToFlowCoordinate } = useVueFlow();
        if (!tab.nodes) {
            throw new Error("Tab nodes not found");
        }
        const node = tab.nodes.find(node => node.id === event.node.id);
        if (!node) {
            throw new Error(`Node not found for id ${event.id}`);
        }
        const headerHeight = 159.4;
        const position = screenToFlowCoordinate({
            x: event.clientX,
            y: event.clientY - headerHeight,
        });
        node.position = position;
    }
}