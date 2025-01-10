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

const MAX_HISTORY_SIZE = 20;
const undoStack = ref<{ nodes: any[], edges: any[] }[]>([]);
const redoStack = ref<{ nodes: any[], edges: any[] }[]>([]);

export default class WorkflowCanvas {
  static readonly store = {
    activeTab: Workflow.store.activeTab,
    tabs: Workflow.store.tabs,
    isDragOver,
    viewportPosition,
  }

  /*
    * ----------------------------------------------------------------------------
    * SECTION: Helper Functions
    * Description: These functions are used to help the main functions
    * ----------------------------------------------------------------------------
  */

  static findTabById(tabId: string): Process {
    const tab = Workflow.store.tabs.value.find(tab => tab.id === tabId);
    if (!tab) {
      throw new Error(`Tab with id ${tabId} not found`);
    }
    return tab as Process;
  }

  static saveState(tabId: string) {
    const tab = this.findTabById(tabId);
    const state = {
      nodes: JSON.parse(JSON.stringify(tab.nodes || [])),
      edges: JSON.parse(JSON.stringify(tab.edges || []))
    };

    undoStack.value.push(state);
    if (undoStack.value.length > MAX_HISTORY_SIZE) {
      undoStack.value.shift();
    }
    redoStack.value = [];
  }

  static calculateNodePosition(nodeClip: any, counter: number, referencePos: any) {
    const headerHeight = 159.4;
    const x = (mousePosition.value.x - viewportPosition.value.x) / viewportPosition.value.zoom;
    const y = (mousePosition.value.y - headerHeight - viewportPosition.value.y) / viewportPosition.value.zoom;

    if (isNaN(x) || isNaN(y)) {
      return null;
    }

    const { screenToFlowCoordinate } = useVueFlow();
    const position = screenToFlowCoordinate({ x, y });

    if (counter > 0) {
      const offsetX = nodeClip.position.x - referencePos.x;
      const offsetY = nodeClip.position.y - referencePos.y;
      position.x += offsetX;
      position.y += offsetY;
    }

    return position;
  }

  static createPastedNode(nodeClip: any, position: any, tabId: string) {
    return {
      ...nodeClip,
      id: Utilities.generateUUID(),
      position,
      tabId
    };
  }

  /*
    * ----------------------------------------------------------------------------
    * SECTION: Keyboard Action Events
    * Description: These functions are called by keyboard events
    * ----------------------------------------------------------------------------
  */

  static undo(tabId: string) {
    const tab = this.findTabById(tabId);
    if (undoStack.value.length === 0) return;

    const currentState = {
      nodes: JSON.parse(JSON.stringify(tab.nodes || [])),
      edges: JSON.parse(JSON.stringify(tab.edges || []))
    };
    redoStack.value.push(currentState);

    const previousState = undoStack.value.pop()!;
    tab.nodes = previousState.nodes;
    tab.edges = previousState.edges;
  }

  static redo(tabId: string) {
    const tab = this.findTabById(tabId);
    if (redoStack.value.length === 0) return;

    const currentState = {
      nodes: JSON.parse(JSON.stringify(tab.nodes || [])),
      edges: JSON.parse(JSON.stringify(tab.edges || []))
    };
    undoStack.value.push(currentState);

    const nextState = redoStack.value.pop()!;
    tab.nodes = nextState.nodes;
    tab.edges = nextState.edges;
  }

  static copy(selectedNodes: any, selectedEdges: any) {
    clipBoard.value = {
      nodes: [...selectedNodes.value],
      edges: [...selectedEdges.value],
    };
  }

  static paste(tabId: string) {
    const tab = this.findTabById(tabId);
    if (!clipBoard.value.nodes.length) return;

    this.saveState(tabId);
    const newNodes: any[] = [];
    const referencePos = {
      x: clipBoard.value.nodes[0].position.x,
      y: clipBoard.value.nodes[0].position.y
    };

    clipBoard.value.nodes.forEach((nodeClip, index) => {
      const position = this.calculateNodePosition(nodeClip, index, referencePos);
      if (!position) return;

      const newNode = this.createPastedNode(nodeClip, position, tab.id);
      if (!tab.nodes) {
        throw new Error(`Tab nodes not found for id ${tabId}`);
      }
      tab.nodes.push(newNode);
      newNodes.push(newNode);
    });

    // Process edges
    const edgesJson = JSON.stringify(clipBoard.value.edges);
    let newEdges = edgesJson;
    newNodes.forEach(node => {
      const originalId = clipBoard.value.nodes.find(
        (n: any) => n.position.x === (node.position.x - (node.position.x - referencePos.x))
      )?.id;
      if (originalId) {
        newEdges = newEdges.replace(originalId.toString(), node.id.toString());
      }
    });

    JSON.parse(newEdges).forEach((edgeClip: any) => {
      if (newNodes.some(n => n.id === edgeClip.target)) {
        if (!tab.edges) {
          throw new Error(`Tab edges not found for id ${tabId}`);
        }
        tab.edges.push({ ...edgeClip, tabId: tab.id });
      }
    });
  }

  /*
    * ----------------------------------------------------------------------------
    * SECTION: Vue Flow Events
    * Description: These functions are called by Vue Flow events
    * ----------------------------------------------------------------------------
  */
  static onConnectEdge(edge: any, tabId: string) {
    const tab = this.findTabById(tabId);
    if (Workflow.store.activeTab.value != tabId) return;
    this.saveState(tabId);
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
    this.saveState(tabId);
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
    this.saveState(tabId);
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

  static onKeyDown(event: any, tabId: string, selectedNodes: any, selectedEdges: any, addSelectedNodes: any) {
    const tab = this.findTabById(tabId);

    if (tab.runMode) {
      event.preventDefault();
      return;
    }

    switch (event.key) {
      case 'z':
        this.undo(tabId);
        break;
      case 'y':
        this.redo(tabId);
        break;
      case 'c':
        this.copy(selectedNodes, selectedEdges);
        break;
      case 'v':
        this.paste(tabId);
        break;
      case 'a':
        event.preventDefault();
        if (tab.nodes) {
          addSelectedNodes(tab.nodes.filter(f => f.id != "1") as any);
        } else {
          throw new Error(`Tab nodes not found for id ${tabId}`);
        }
        break;
    }
  }
}
