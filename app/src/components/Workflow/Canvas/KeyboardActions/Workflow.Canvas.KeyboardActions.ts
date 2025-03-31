import { useWorkflowCanvasHooks, useWorkflowCanvasStore, useWorkflowCanvasGlbalStore } from '../Workflow.Canvas.hooks';
import { WorkflowCanvasProps } from '../Workflow.Canvas.types'
import { useWorkflowCanvasHelperMethods } from '../Helper/Workflow.Canvas.Helper';
import { generateUUID } from '@/components/Composable/Utilities';

export const useWorkflowCanvasKeyboardActions = (props: WorkflowCanvasProps, vueFlowInstance: any) => {
  const {
    undoStack,
    redoStack } = useWorkflowCanvasStore(props.id);
  const { tab } = useWorkflowCanvasHooks(props.id);
  const { clipBoard } = useWorkflowCanvasGlbalStore();
  // Method: Copy
  const undo = () => {
    if (undoStack.value.length === 0) return;

    const currentState = {
      nodes: JSON.parse(JSON.stringify(tab.value.nodesList || [])),
      edges: JSON.parse(JSON.stringify(tab.value.edgesList || []))
    };
    redoStack.value.push(currentState);
    if (redoStack.value.length > 200) redoStack.value.shift();

    const previousState = undoStack.value.pop()!;
    tab.value = {
      ...tab.value,
      nodesList: previousState.nodes,
      edgesList: previousState.edges
    }
  }
  // Method: Redo
  const redo = () => {
    if (redoStack.value.length === 0) return;

    const currentState = {
      nodes: JSON.parse(JSON.stringify(tab.value.nodesList || [])),
      edges: JSON.parse(JSON.stringify(tab.value.edgesList || []))
    };
    undoStack.value.push(currentState);
    if (undoStack.value.length > 200) undoStack.value.shift();

    const nextState = redoStack.value.pop()!;
    tab.value.nodesList = nextState.nodes;
    tab.value.edgesList = nextState.edges;
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

    clipBoard.value.nodes.forEach((nodeClip: any, index: number) => {
      const position = calculateNodePosition(nodeClip, index, referencePos);
      if (!position) return;

      const newNode = {
        ...JSON.parse(JSON.stringify(nodeClip)),
        id: generateUUID(),
        position,
        tabId: tab.value.id
      };

      if (!tab.value.nodesList) {
        throw new Error(`Tab nodes not found for id ${tab.value.id}`);
      }
      tab.value.nodesList.push(newNode);
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
          
          if (!tab.value.edgesList) {
            throw new Error(`Tab edges not found for id ${tab.value.id}`);
          }
          tab.value.edgesList.push(newEdge);
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