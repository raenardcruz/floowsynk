import { WorkflowServicePromiseClient } from 'proto/floowsynk_grpc_web_pb'
import {
    PageRequest,
    WorkflowList,
    WorkflowHistoryList,
    WorkflowHistoryRequest,
    WorkflowHistoryResponse,
    Empty } from 'proto/floowsynk_pb'
import { getApiUrl } from '@/components/Composable/constants'

export const getAllWorkflows = async (limit: number, offset: number): Promise<WorkflowList> => {
    const client = new WorkflowServicePromiseClient(getApiUrl())
    const request = new PageRequest()
    request.setLimit(limit)
    request.setOffset(offset)
    return await client.listWorkflows(request, {
        'Authorization': `${localStorage.getItem("sessionToken")}`
    })
}

export const listWorkflowRunHistory = async (): Promise<WorkflowHistoryList> => {
    const client = new WorkflowServicePromiseClient(getApiUrl())
    return await client.listWorkflowHistory(new Empty(), {
        'Authorization': `${localStorage.getItem("sessionToken")}`
    })
}

export const getWorkflowHistory = async (id: string): Promise<WorkflowHistoryResponse> => {
    const client = new WorkflowServicePromiseClient(getApiUrl())
    const req = new WorkflowHistoryRequest()
    req.setId(id)
    return await client.getWorkflowHistory(req, {
        'Authorization': `${localStorage.getItem("sessionToken")}`
    })
}