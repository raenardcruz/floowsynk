import { WorkflowServicePromiseClient } from 'proto/workflow/workflow_grpc_web_pb'
import {
    ConnectionList,
    DeleteConnectionRequest,
    ListConnectionsRequest
} from 'proto/workflow/workflow_pb'
import { Empty } from 'google-protobuf/google/protobuf/empty_pb'
import { getApiUrl, getRestUrl } from '@/components/Composable/constants'
import { ref } from 'vue'

const getHeaders = () => ({
    'Authorization': `${localStorage.getItem("sessionToken") || ''}`
})

export const getConnectorTemplates = async (): Promise<any[]> => {
    const res = await fetch(`${getRestUrl()}/api/connectors/templates`)
    if (!res.ok) throw new Error(await res.text())
    return res.json()
}

export const getConnections = async (): Promise<ConnectionList> => {
    const client = new WorkflowServicePromiseClient(getApiUrl())
    return await client.listConnections(new ListConnectionsRequest(), getHeaders())
}

const connectionsList = ref<any[]>([])
const templatesList = ref<any[]>([])
let isCatalogLoaded = false
let inFlightCatalogPromise: Promise<void> | null = null

export const fetchConnectorCatalog = async (force = false): Promise<void> => {
    if (!force && isCatalogLoaded) {
        return
    }
    if (inFlightCatalogPromise) {
        return inFlightCatalogPromise
    }
    inFlightCatalogPromise = (async () => {
        try {
            const [connRes, templates] = await Promise.all([
                getConnections(),
                getConnectorTemplates()
            ])
            connectionsList.value = connRes.toObject().connectionsList || []
            templatesList.value = templates || []
            isCatalogLoaded = true
        } catch (err) {
            console.error("Failed to load connector catalog:", err)
        } finally {
            inFlightCatalogPromise = null
        }
    })()
    return inFlightCatalogPromise
}

export const useConnectorCatalog = () => {
    return {
        connectionsList,
        templatesList,
        fetchConnectorCatalog
    }
}

export const deleteConnection = async (id: string): Promise<Empty> => {
    const client = new WorkflowServicePromiseClient(getApiUrl())
    const req = new DeleteConnectionRequest()
    req.setId(id)
    return await client.deleteConnection(req, getHeaders())
}

export const checkConnectionStatus = async (id: string): Promise<{ valid: boolean; error?: string }> => {
    const res = await fetch(`${getRestUrl()}/api/connectors/check?id=${encodeURIComponent(id)}`)
    if (!res.ok) {
        const text = await res.text()
        return { valid: false, error: text || 'Connection check failed' }
    }
    return res.json()
}

export const createConnection = async (
    connectorId: string,
    name: string,
    authType: string,
    fields: Record<string, string>
): Promise<{ success: boolean; id: string }> => {
    const res = await fetch(`${getRestUrl()}/api/connectors/create`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `${localStorage.getItem("sessionToken") || ''}`
        },
        body: JSON.stringify({ connectorId, name, authType, fields })
    })
    if (!res.ok) throw new Error(await res.text())
    return res.json()
}

export const updateConnection = async (
    id: string,
    name: string,
    clientId?: string,
    clientSecret?: string,
    accessToken?: string,
    fields?: Record<string, string>
): Promise<{ success: boolean }> => {
    const res = await fetch(`${getRestUrl()}/api/connectors/rename`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `${localStorage.getItem("sessionToken") || ''}`
        },
        body: JSON.stringify({ id, name, clientId, clientSecret, accessToken, fields })
    })
    if (!res.ok) throw new Error(await res.text())
    return res.json()
}

export const revertConnection = async (id: string): Promise<{ success: boolean; message: string }> => {
    const res = await fetch(`${getRestUrl()}/api/connectors/revert`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `${localStorage.getItem("sessionToken") || ''}`
        },
        body: JSON.stringify({ id })
    })
    if (!res.ok) throw new Error(await res.text())
    return res.json()
}


