import { WorkflowServicePromiseClient } from 'proto/workflow/workflow_grpc_web_pb'
import {
    GetWorkflowVersionsRequest,
    WorkflowVersion,
    PublishWorkflowRequest,
} from 'proto/workflow/workflow_pb'
import { getApiUrl } from '@/components/Composable/constants'

const getAuth = () => ({ 'Authorization': `${localStorage.getItem('sessionToken')}` })

export type WorkflowVersionRestorePayload = {
    id: string
    workflowId: string
    versionNum: number
    label: string
}

/** Returns all version snapshots for a workflow (staging only). */
export const listWorkflowVersions = async (workflowId: string) => {
    const client = new WorkflowServicePromiseClient(getApiUrl())
    const req = new GetWorkflowVersionsRequest()
    req.setWorkflowid(workflowId)
    return client.listWorkflowVersions(req, getAuth())
}

/** Restores the live staging workflow to a previous version's snapshot. */
export const restoreWorkflowVersion = async (version: WorkflowVersionRestorePayload) => {
    const client = new WorkflowServicePromiseClient(getApiUrl())
    const req = new WorkflowVersion()
    req.setId(version.id)
    req.setWorkflowid(version.workflowId)
    req.setVersionnum(version.versionNum)
    req.setLabel(version.label)
    return client.restoreWorkflowVersion(req, getAuth())
}

/** Publishes a specific version (or current head) to production. */
export const publishWorkflow = async (workflowId: string, versionId: string = '') => {
    const client = new WorkflowServicePromiseClient(getApiUrl())
    const req = new PublishWorkflowRequest()
    req.setWorkflowid(workflowId)
    req.setVersionid(versionId)
    return client.publishWorkflow(req, getAuth())
}
