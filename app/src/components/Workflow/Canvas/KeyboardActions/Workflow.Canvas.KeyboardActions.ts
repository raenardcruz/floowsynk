import { useWorkflowCanvasHooks, useWorkflowCanvasStore } from '../Workflow.Canvas.hooks';
import { WorkflowCanvasProps } from '../Workflow.Canvas.types'
import { useWorkflowCanvasHelperMethods } from '../Helper/Workflow.Canvas.Helper';
import { generateUUID } from '@/components/Composable/Utilities';

const {
    undoStack,
    redoStack,
    clipBoard } = useWorkflowCanvasStore();

export const useWorkflowCanvasKeyboardActions = (props: WorkflowCanvasProps, vueFlowInstance: any) => {
  const { tab } = useWorkflowCanvasHooks(props.id);
  // Method: Copy
  const undo = () => {
    if (undoStack.value.length === 0) return;

    const currentState = {
      nodes: JSON.parse(JSON.stringify(tab.value.nodes || [])),
      edges: JSON.parse(JSON.stringify(tab.value.edges || []))
    };
    redoStack.value.push(currentState);
    if (redoStack.value.length > 200) redoStack.value.shift();

    const previousState = undoStack.value.pop()!;
    tab.value = {
      ...tab.value,
      nodes: previousState.nodes,
      edges: previousState.edges
    }
  }
  // Method: Redo
  const redo = () => {
    if (redoStack.value.length === 0) return;

    const currentState = {
      nodes: JSON.parse(JSON.stringify(tab.value.nodes || [])),
      edges: JSON.parse(JSON.stringify(tab.value.edges || []))
    };
    undoStack.value.push(currentState);
    if (undoStack.value.length > 200) undoStack.value.shift();

    const nextState = redoStack.value.pop()!;
    tab.value.nodes = nextState.nodes;
    tab.value.edges = nextState.edges;
  }
  // Method: copy
  const copy = (selectedNodes: any, selectedEdges: any) => {
    clipBoard.value = {
      nodes: selectedNodes.value.map((node: any) => JSON.parse(JSON.stringify(node))),
      edges: selectedEdges.value.map((edge: any) => JSON.parse(JSON.stringify(edge))),
    };
  }
  // Method: paste
  const paste = () => {
    const { saveState, calculateNodePosition } = useWorkflowCanvasHelperMethods(props.id, vueFlowInstance);
    if (!clipBoard.value.nodes.length) return;

    saveState();
    const newNodes: any[] = [];
    const referencePos = {
      x: clipBoard.value.nodes[0].position.x,
      y: clipBoard.value.nodes[0].position.y
    };

    clipBoard.value.nodes.forEach((nodeClip, index) => {
      const position = calculateNodePosition(nodeClip, index, referencePos);
      if (!position) return;

      const newNode = {
        ...JSON.parse(JSON.stringify(nodeClip)),
        id: generateUUID(),
        position,
        tabId: tab.value.id
      };

      if (!tab.value.nodes) {
        throw new Error(`Tab nodes not found for id ${tab.value.id}`);
      }
      tab.value.nodes.push(newNode);
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
            id: generateUUID(),
            source: newSource,
            target: newTarget,
            tabId: tab.value.id
          };
          
          if (!tab.value.edges) {
            throw new Error(`Tab edges not found for id ${tab.value.id}`);
          }
          tab.value.edges.push(newEdge);
        }
      });
    }
  }

  return {
    undo,
    redo,
    copy,
    paste
  }
}