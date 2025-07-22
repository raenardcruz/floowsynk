import { computed } from 'vue'
import { CustomEdgeProps } from './CustomEdge.types'
import { getSmoothStepPath } from '@vue-flow/core'
import { useWorkflowCanvasStore } from '@/views/Workflow/Canvas'

export const useCustomEdgeHooks = (props: CustomEdgeProps) => {
    const path = computed(() => getSmoothStepPath({
        sourceX: props.sourceX,
        sourceY: props.sourceY,
        targetX: props.targetX,
        targetY: props.targetY,
        sourcePosition: props.sourcePosition as any,
        targetPosition: props.targetPosition as any,
    }))
    const edgeStyling = computed(() => {
        const { nodeStatuses } = useWorkflowCanvasStore(props.tabId)
        const sourceStatus = nodeStatuses.value[props.source]
        const targetStatus = nodeStatuses.value[props.target]
        const isExecuted = !!sourceStatus && !!targetStatus
        return ({
            ...props.style,
            stroke: isExecuted ? 'black' : 'grey',
            strokeWidth: isExecuted ? 2 : 1,
            strokeDasharray: isExecuted ? '3' : '5',
        })
    })

    return {
        path,
        edgeStyling,
    }
}