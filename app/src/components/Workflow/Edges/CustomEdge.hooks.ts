import { computed } from 'vue'
import { CustomEdgeProps } from './CustomEdge.types'
import { getSmoothStepPath } from '@vue-flow/core'

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
        return ({
            ...props.style,
            stroke: 'grey'
        })
    })

    return {
        path,
        edgeStyling
    }
}