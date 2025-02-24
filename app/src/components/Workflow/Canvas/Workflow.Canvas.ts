import Workflow from "@/views/Workflow";
import { Process } from "@/components/Common/Interfaces";
import { ref, shallowRef } from "vue";
import SidebarHelper from "@/components/Workflow/Sidebar/Workflow.Canvas.Sidebar";
import { useVueFlow } from "@vue-flow/core";
import Utilities from "@/components/Common/Utilities";
import axios from "axios";
import {ProcessList} from "@/components/Workflow/Process/Process.List";

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
const nodeStatuses = shallowRef<{ [key: string]: string }>({});
let pendingUpdates: { [key: string]: string } = {};
let updateScheduled = false;

const processStatusUpdates = () => {
  if (Object.keys(pendingUpdates).length > 0) {
    nodeStatuses.value = {
      ...nodeStatuses.value,
      ...pendingUpdates
    };
    pendingUpdates = {};
  }
  updateScheduled = false;
};

const queueStatusUpdate = (nodeId: string, status: string) => {
  pendingUpdates[nodeId] = status;
  if (!updateScheduled) {
    updateScheduled = true;
    requestAnimationFrame(processStatusUpdates);
  }
};

export default class WorkflowCanvas {
  static readonly store = {
    activeTab: Workflow.store.activeTab,
    tabs: Workflow.store.tabs,
    isDragOver,
    viewportPosition,
    nodeStatuses,
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
    tab.nodes = []
    tab.edges = []
    setTimeout(() => {
      tab.nodes = previousState.nodes;
      tab.edges = previousState.edges;
      const { id } = useVueFlow()
      document.getElementById(id)?.focus();
    }, 1);
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
      nodes: selectedNodes.value.map((node: any) => JSON.parse(JSON.stringify(node))),
      edges: selectedEdges.value.map((edge: any) => JSON.parse(JSON.stringify(edge))),
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

      const newNode = {
        ...JSON.parse(JSON.stringify(nodeClip)),
        id: Utilities.generateUUID(),
        position,
        tabId: tab.id
      };

      if (!tab.nodes) {
        throw new Error(`Tab nodes not found for id ${tabId}`);
      }
      tab.nodes.push(newNode);
      newNodes.push(newNode);
    });

    // Process edges
    if (clipBoard.value.edges.length > 0) {
      const edgeMapping = new Map(
        clipBoard.value.nodes.map((node: any) => [node.id, ''])
      );
      
      newNodes.forEach(node => {
        const originalId = clipBoard.value.nodes.find(
          (n: any) => n.position.x === (node.position.x - (node.position.x - referencePos.x))
        )?.id;
        if (originalId) {
          edgeMapping.set(originalId, node.id);
        }
      });

      clipBoard.value.edges.forEach((edgeClip: any) => {
        const newSource = edgeMapping.get(edgeClip.source);
        const newTarget = edgeMapping.get(edgeClip.target);
        
        if (newSource && newTarget) {
          const newEdge = {
            ...JSON.parse(JSON.stringify(edgeClip)),
            id: Utilities.generateUUID(),
            source: newSource,
            target: newTarget,
            tabId: tab.id
          };
          
          if (!tab.edges) {
            throw new Error(`Tab edges not found for id ${tabId}`);
          }
          tab.edges.push(newEdge);
        }
      });
    }
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
    const newNode: any = JSON.parse(JSON.stringify(node));
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
      case 'Delete':
      case 'Backspace':
        event.preventDefault();
        if (tab.nodes) {
            const nodesToDelete = selectedNodes.value.filter((node: any) => node.type !== 'start');
            tab.nodes = tab.nodes.filter((node: any) => !nodesToDelete.includes(node));
        } else {
            throw new Error(`Tab nodes not found for id ${tabId}`);
        }
        break;
    }
  }


  /*
    * ----------------------------------------------------------------------------
    * SECTION: Control Button Actions
    * Description: These functions are called by control buttons
    * ----------------------------------------------------------------------------
  */
  static async save(tab: Process, notif: any) {
    try {
      let payload: any = {
        type: tab.type,
        name: tab.title,
        description: tab.description,
        nodes: tab.nodes,
        edges: tab.edges
      };
      var headers = {
        headers: {
          'Authorization': `${localStorage.getItem('sessionToken')}`,
          'Content-Type': 'application/json'
        }
      }
  
      if (tab.isnew) {
        payload.id = tab.id;
        await axios.post('/api/workflow', payload, headers)
        await ProcessList.init();
        tab.isnew = false;
      } else {
        await axios.put(`/api/workflow/${tab.id}`, payload, headers)
      }
      notif.success("Workflow saved successfully");
    }
    catch (error) {
      notif.error("Failed to save workflow");
    }
  }

  static async delete(tab: Process, notif: any) {
    try {
      var headers = {
        headers: {
          'Authorization': `${localStorage.getItem('sessionToken')}`
        }
      }
      await axios.delete(`/api/workflow/${tab.id}`, headers)
      notif.success("Workflow deleted successfully");
      await ProcessList.init();
      Workflow.store.tabs.value.splice(Workflow.store.tabs.value.indexOf(tab), 1);
      Workflow.store.activeTab.value = 'main';
    }
    catch (error) {
      notif.error("Failed to delete workflow");
    }
  }

  static async run(tab: Process, notif: any) {
    nodeStatuses.value = {};
    pendingUpdates = {};
    let payload: any = {
      nodes: tab.nodes,
      edges: tab.edges
    };
    let resp = await axios.post(`/api/workflow/${tab.id}/run`, payload, {
      headers: {
        "Authorization": `${localStorage.getItem("sessionToken")}`
      }
    });
    notif.success(resp.data.message);
  }
}

// Export for use in other components
export { queueStatusUpdate };
