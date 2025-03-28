import { useWorkflowCanvasHooks, useWorkflowCanvasStore } from '../Workflow.Canvas.hooks';
import { WorkflowCanvasProps } from '../Workflow.Canvas.types';
import { useWorkflowCanvasHelperMethods } from '../Helper/Workflow.Canvas.Helper'
import { useWorkflowStore } from '@/views/Workflow';
import { generateUUID } from '@/components/Composable/Utilities';
import { useWorkflowCanvasKeyboardActions } from '../KeyboardActions/Workflow.Canvas.KeyboardActions';
import { useSidebarCanvasStore } from '@/components/Workflow/Sidebar/Canvas/Workflow.Sidebar.Canvas.hooks';

const { draggedNode } = useSidebarCanvasStore();

export const useWorkflowCanvasVueFlowEvents = (props: WorkflowCanvasProps, vueFlowInstance: any) => {
    const { activeTab } = useWorkflowStore();
    const { tab, isRunning } = useWorkflowCanvasHooks(props.id);
    const { saveState } = useWorkflowCanvasHelperMethods(props.id, vueFlowInstance);
    const {
      isDragOver,
      mousePosition,
  } = useWorkflowCanvasStore();
  
    // Method: On Connect Edge
    const onConnectEdge = (edge: any) => {
      if (isRunning.value) return;
      if (activeTab.value != tab.value.id) return;
      saveState();
      edge.type = "custom";
      edge.animated = true;
      edge.tabId = tab.value.id;
      if (tab.value.edgesList) {
        const edgeExists = tab.value.edgesList.some(e => e.source === edge.source && e.target === edge.target);
        if (!edgeExists) {
          tab.value.edgesList.push(edge);
        }
      } else {
        throw new Error(`Tab edges not found for id ${tab.value.id}`);
      }
    }
    // Method: On Node Drag End
    const onDragOver = (event: DragEvent) => {
      event.preventDefault();
      isDragOver.value = true;
    }
    // Method: On drag Leave
    const onDragLeave = () => {
      isDragOver.value = false;
    }
    // Method: On Drop
    const onDrop = (event: any) => {
      if (isRunning.value) return;
      saveState();
      const { screenToFlowCoordinate } = vueFlowInstance;
      const node = draggedNode.value;
      const newNode: any = JSON.parse(JSON.stringify(node));
      const x = event.clientX;
      const y = event.clientY;
      if (isNaN(x) || isNaN(y)) {
        return;
      }
      const position = screenToFlowCoordinate({ x, y });
      if (node) {
        newNode.position = position;
        newNode.id = generateUUID();
        if (!newNode.id) {
          throw new Error("Failed to generate node ID");
        }
      } else {
        throw new Error("Dragged node is null");
      }
      if (tab.value.nodesList) {
        tab.value.nodesList.push(newNode);
      } else {
        throw new Error("Tab nodes not found");
      }
    }
    const onNodeDragStart = (_: any) => {
      saveState();
    }
  // Method: On Node Drag End
    const onNodeDragEnd = (event: any) => {
      const { screenToFlowCoordinate } = vueFlowInstance;
      if (!tab.value.nodesList) {
        throw new Error("Tab nodes not found");
      }
      const nodeIndex = tab.value.nodesList.findIndex(node => node.id === event.node.id);
      if (nodeIndex === -1) {
        throw new Error(`Node not found for id ${event.id}`);
      }
      const x = event.clientX;
      const y = event.clientY;
      if (isNaN(x) || isNaN(y)) {
        return;
      }
      const position = screenToFlowCoordinate({ x, y });
      tab.value.nodesList[nodeIndex].position = position;
    }
    // Method: On Mouse Move
    const onMouseMove = (event: any) => {
      mousePosition.value.x = event.clientX;
      mousePosition.value.y = event.clientY;
    }
    // Method: On Key Down
    const onKeyDown = (
      event: any) => {
      // TODO: Prevent behavior on run mode
      const {
        getSelectedNodes,
        getSelectedEdges,
        addSelectedNodes } = vueFlowInstance;
      const {
        copy,
        undo,
        redo,
        paste
      } = useWorkflowCanvasKeyboardActions(props, vueFlowInstance);
      switch (event.key) {
        case 'z':
          if (isRunning.value) return;
          undo();
          break;
        case 'y':
          if (isRunning.value) return;
          redo();
          break;
        case 'c':
          copy(getSelectedNodes, getSelectedEdges);
          break;
        case 'v':
          if (isRunning.value) return;
          paste();
          break;
        case 'a':
          event.preventDefault();
          if (tab.value.nodesList) {
            addSelectedNodes(tab.value.nodesList.filter(f => f.id != "1") as any);
          } else {
            throw new Error(`Tab nodes not found for id ${tab.value.id}`);
          }
          break;
        case 'Delete':
        case 'Backspace':
          if (isRunning.value) return;
          event.preventDefault();
          if (tab.value.nodesList) {
              const nodesToDelete = getSelectedNodes.value.filter((node: any) => node.id !== '0');
              tab.value.nodesList = tab.value.nodesList.filter((node: any) => !nodesToDelete.includes(node));
          } else {
              throw new Error(`Tab nodes not found for id ${tab.value.id}`);
          }
          break;
      }
    }
  
    return {
      onConnectEdge,
      onDragOver,
      onDragLeave,
      onDrop,
      onNodeDragEnd,
      onMouseMove,
      onKeyDown,
      onNodeDragStart
    }
  }