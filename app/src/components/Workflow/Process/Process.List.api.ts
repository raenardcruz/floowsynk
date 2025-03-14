import { WorkflowServicePromiseClient } from 'proto/floowsynk_grpc_web_pb'
import { PageRequest, WorkflowList } from 'proto/floowsynk_pb'
import { getApiUrl } from '@/components/Composable/constants'

export const getAllWorkflows = async (limit: number, offset: number): Promise<WorkflowList> => {
    const client = new WorkflowServicePromiseClient(getApiUrl());
    const request = new PageRequest();
    request.setLimit(limit);
    request.setOffset(offset);
    return await client.listWorkflows(request, {
        'Authorization': `${localStorage.getItem("sessionToken")}`
    });
}