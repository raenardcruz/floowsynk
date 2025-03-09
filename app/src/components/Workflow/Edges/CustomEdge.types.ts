export type CustomEdgeProps = {
    id: string;
    sourceX: number;
    sourceY: number;
    targetX: number;
    targetY: number;
    sourcePosition: string;
    targetPosition: string;
    markerEnd?: string;
    style?: Record<string, any>;
  }