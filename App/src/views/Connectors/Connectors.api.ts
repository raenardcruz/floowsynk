import { WorkflowServicePromiseClient } from 'proto/workflow/workflow_grpc_web_pb'
import {
    ConnectorTemplateList,
    ConnectionList,
    DeleteConnectionRequest
} from 'proto/workflow/workflow_pb'
import { Empty } from 'google-protobuf/google/protobuf/empty_pb'
import { getApiUrl, getRestUrl } from '@/components/Composable/constants'

const getHeaders = () => ({
    'Authorization': `${localStorage.getItem("sessionToken") || ''}`
})

export const getConnectorTemplates = async (): Promise<ConnectorTemplateList> => {
    const client = new WorkflowServicePromiseClient(getApiUrl())
    return await client.listConnectorTemplates(new Empty(), getHeaders())
}

export const getConnections = async (): Promise<ConnectionList> => {
    const client = new WorkflowServicePromiseClient(getApiUrl())
    return await client.listConnections(new Empty(), getHeaders())
}

export const deleteConnection = async (id: string): Promise<Empty> => {
    const client = new WorkflowServicePromiseClient(getApiUrl())
    const req = new DeleteConnectionRequest()
    req.setId(id)
    return await client.deleteConnection(req, getHeaders())
}

export const checkConnectionStatus = async (id: string): Promise<{ valid: boolean }> => {
    const res = await fetch(`${getRestUrl()}/api/connectors/check?id=${encodeURIComponent(id)}`)
    if (!res.ok) return { valid: false }
    return res.json()
}

export const updateConnection = async (
    id: string,
    name: string,
    clientId: string,
    clientSecret: string,
    accessToken: string
): Promise<{ success: boolean }> => {
    const res = await fetch(`${getRestUrl()}/api/connectors/rename`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name, clientId, clientSecret, accessToken })
    })
    if (!res.ok) throw new Error(await res.text())
    return res.json()
}

