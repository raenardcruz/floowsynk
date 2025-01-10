import Workflow from "@/views/Workflow";
import { Process } from "@/components/Common/Interfaces";
import { ref } from "vue";
import SidebarHelper from "@/components/Workflow/Sidebar/Workflow.Canvas.Sidebar";
import { useVueFlow } from "@vue-flow/core";
import Utilities from "@/components/Common/Utilities";

const isDragOver = ref(false);
const clipBoard = ref({
    nodes: [] as any[],
    edges: [] as any[],
});
const viewportPosition = ref({ x: 0, y: 0, zoom: 1 });
const mousePosition = ref({ x: 0, y: 0 });

export default class WorkflowCanvas {
    static readonly store = {
        activeTab: Workflow.store.activeTab,
        tabs: Workflow.store.tabs,
        isDragOver,
        viewportPosition,
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
        edge.type = "custom";
        edge.animated = true;
        edge.tabId = tab.id;
        if (tab.edges) {
            const edgeExists = tab.edges.some(e => e.source === edge.source && e.target === edge.target);
            if (!edgeExists) {
              tab.edges.push(edge);
            }
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
        const newNode: any = { ...node };
        const headerHeight = 159.4;
        const x = (event.clientX - viewportPosition.value.x) / viewportPosition.value.zoom;
        const y = (event.clientY - headerHeight - viewportPosition.value.y) / viewportPosition.value.zoom;
        if (isNaN(x) || isNaN(y)) {
            return;
        }
        const position = screenToFlowCoordinate({ x, y });
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
            tab.nodes.push(newNode);
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
        const x = event.clientX;
        const y = event.clientY - headerHeight;
        if (isNaN(x) || isNaN(y)) {
            return;
        }
        const position = screenToFlowCoordinate({ x, y });
        node.position = position;
    }

    static onBackgroundMove(event: any) {
      viewportPosition.value = event.flowTransform;
    }

    static onMouseMove(event: any) {
      mousePosition.value.x = event.clientX;
      mousePosition.value.y = event.clientY;
    }

    static onKeyDown(event: any, tabId: string, selectedNodes: any, selectedEdges: any) {
        const tab = this.findTabById(tabId);
        const {
            screenToFlowCoordinate,
            addSelectedNodes
        } = useVueFlow();

        if (tab.runMode) {
          event.preventDefault();
          return;
        }
        var tagName = event.srcElement.tagName;
        var isInput = tagName == 'TEXTAREA' || tagName == 'INPUT';
      
        // Copy action Ctrl + C
        if (event.ctrlKey && event.key === 'c') {
          if (!isInput) {
            event.preventDefault();
            clipBoard.value = {
              nodes: [...selectedNodes.value],
              edges: [...selectedEdges.value],
            };
          }
        }
      
        // Paste action Ctrl + V
        else if (event.ctrlKey && event.key === 'v') {
          if (!isInput) {
            event.preventDefault();
            let newNodes: any[] = [];
            let newEdges: any = [];
            let counter = 0;
            let referenceX = 0;
            let referenceY = 0;
            let offsetX = 0;
            let offsetY = 0;
            const headerHeight = 159.4;
            newEdges = JSON.stringify(clipBoard.value.edges);
            clipBoard.value.nodes.forEach(nodeClip => {
                const x = (mousePosition.value.x- viewportPosition.value.x) / viewportPosition.value.zoom;
                const y = (mousePosition.value.y - headerHeight - viewportPosition.value.y) / viewportPosition.value.zoom;
                if (isNaN(x) || isNaN(y)) {
                    return;
                }
                const position = screenToFlowCoordinate({ x, y });
                if (counter == 0) {
                    referenceX = nodeClip.position.x;
                    referenceY = nodeClip.position.y;
                } else {
                    offsetX = nodeClip.position.x - referenceX;
                    offsetY = nodeClip.position.y - referenceY;
                    position.x = position.x + offsetX;
                    position.y = position.y + offsetY;
                }
                var newNode = {...nodeClip};
                newNode.id = Utilities.generateUUID();
                newNode.position = position;
                newNode.tabId = tab.id;
                if (tab.nodes) {
                    tab.nodes.push(newNode);
                } else {
                    throw new Error(`Tab nodes not found for id ${tabId}`);
                }
                
                newEdges = newEdges.replaceAll(nodeClip.id.toString(), newNode.id.toString());
                newNodes.push(newNode);
                counter++;
            });
            JSON.parse(newEdges).forEach((edgeClip: any) => {
              if (newNodes.filter(f => f.id == edgeClip.target).length > 0) {
                edgeClip.tabId = tab.id;
                if (tab.edges) {
                    tab.edges.push(edgeClip);
                } else {
                    throw new Error(`Tab edges not found for id ${tabId}`);
                }
              }
            });
          }
        }
      
        // Select all Nodes Ctrl + A
        else if (event.ctrlKey && event.key === 'a') {
          if (!isInput) {
            event.preventDefault();
            event.preventDefault();
            if (tab.nodes) {
                addSelectedNodes(tab.nodes.filter(f => f.id != "1") as any);
            } else {
                throw new Error(`Tab nodes not found for id ${tabId}`);
            }
          }
        }
      
        // Backspace event
        else if (event.key == 'Backspace') {
          if (!isInput) {
            event.preventDefault();
            selectedNodes.value.forEach((node: any) => {
              if (node.id == "1")
                return;
              if (tab.nodes) {
                tab.nodes.splice(tab.nodes.findIndex(f => f.id == node.id), 1);
              } else {
                throw new Error(`Tab nodes not found for id ${tabId}`);
              }
            })
          }
        }
      
        // Shift event
        else if (event.key == 'Shift') {
          event.preventDefault();
        }
      }
}
