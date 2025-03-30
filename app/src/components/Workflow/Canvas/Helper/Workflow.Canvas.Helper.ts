import { useWorkflowCanvasHooks, useWorkflowCanvasStore } from '../Workflow.Canvas.hooks'
import { MAX_HISTORY_SIZE } from '../Workflow.canvas.constants'
import { generateUUID } from '@/components/Composable/Utilities';

export const useWorkflowCanvasHelperMethods = (tabId: string, vueFlowInstance: any) => {
  const {
    undoStack,
    redoStack,
    mousePosition } = useWorkflowCanvasStore(tabId);
  const { tab } = useWorkflowCanvasHooks(tabId);
  // Method: Save State
  const saveState = () => {
    const state = {
      nodes: JSON.parse(JSON.stringify(tab.value.nodesList || [])),
      edges: JSON.parse(JSON.stringify(tab.value.edgesList || []))
    };

    undoStack.value.push(state);
    if (undoStack.value.length > MAX_HISTORY_SIZE) {
      undoStack.value.shift();
    }
    redoStack.value = [];
  }
  // Method: Calculate Node Position
  const calculateNodePosition = (nodeClip: any, counter: number, referencePos: any) => {
    const x = mousePosition.value.x;
    const y = mousePosition.value.y;

    if (isNaN(x) || isNaN(y)) {
      return null;
    }

    const { screenToFlowCoordinate } = vueFlowInstance;
    const position = screenToFlowCoordinate({ x, y });

    if (counter > 0) {
      const offsetX = nodeClip.position.x - referencePos.x;
      const offsetY = nodeClip.position.y - referencePos.y;
      position.x += offsetX;
      position.y += offsetY;
    }

    return position;
  }
  // Method: Create Pasted Node
  const createPastedNode = (nodeClip: any, position: any, tabId: string) => {
    return {
      ...nodeClip,
      id: generateUUID(),
      position,
      tabId
    };
  }

  const addTag = () => {
    let tags = tab.value.tagsList || [];
    tab.value = {
      ...tab.value,
      tagsList: [...tags, '']
    }
  }

  const removeTag = (index: number) => {
    const newTags = [...tab.value.tagsList]
    newTags.splice(index, 1)
    tab.value = {
      ...tab.value,
      tagsList: newTags
    }
  }

  return {
    saveState,
    calculateNodePosition,
    createPastedNode,
    addTag,
    removeTag
  }
}