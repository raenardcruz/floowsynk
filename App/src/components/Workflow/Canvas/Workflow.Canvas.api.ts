import { Workflow } from 'proto/floowsynk_pb'
import { WorkflowServicePromiseClient } from 'proto/floowsynk_grpc_web_pb'
import { getApiUrl } from '@/components/Composable/constants'
import { workflowFromObject } from '@/components/Composable/protoTransformers'

export const updateProcess = async (process: Workflow.AsObject) => {
   const client = new WorkflowServicePromiseClient(getApiUrl())
   const workflow = workflowFromObject(process)
    return client.updateWorkflow(workflow, {
        'Authorization': `${localStorage.getItem('sessionToken')}`
    })
}

export const createProcess = async (process: Workflow.AsObject) => {
    const client = new WorkflowServicePromiseClient(getApiUrl())
    const workflow = workflowFromObject(process)
    return client.createWorkflow(workflow, {
        'Authorization': `${localStorage.getItem('sessionToken')}`
    })
}

export const deleteProcess = async (process: Workflow.AsObject) => {
    const client = new WorkflowServicePromiseClient(getApiUrl())
    const workflow = workflowFromObject(process)
    return client.deleteWorkflow(workflow, {
        'Authorization': `${localStorage.getItem('sessionToken')}`
    })
}

export const executeProcess = async (_: Workflow.AsObject) => {
    const client = new WorkflowServicePromiseClient(getApiUrl())
    const workflow = workflowFromObject(_)
    return client.quickRun(workflow, {
        'Authorization': `${localStorage.getItem('sessionToken')}`,
    })
}