import { WorkflowServicePromiseClient } from 'proto/workflow/workflow_grpc_web_pb'
import {
    ListRagConnectionsRequest,
    CreateRagConnectionRequest,
    UpdateRagConnectionRequest,
    DeleteRagConnectionRequest,
    ListRagDocumentsRequest,
    UploadRagDocumentRequest,
    DeleteRagDocumentRequest,
    QueryRagRequest,
    RagConnectionProto,
    RagDocumentProto,
    QueryRagResponse
} from 'proto/workflow/workflow_pb'
import { getApiUrl } from '@/components/Composable/constants'

const getHeaders = () => ({
    'Authorization': `${localStorage.getItem("sessionToken") || ''}`
})

export const getRagConnections = async (): Promise<RagConnectionProto.AsObject[]> => {
    const client = new WorkflowServicePromiseClient(getApiUrl())
    const res = await client.listRagConnections(new ListRagConnectionsRequest(), getHeaders())
    return res.getConnectionsList().map(c => c.toObject())
}

export const createRagConnection = async (
    name: string,
    ollamaBaseUrl: string,
    embeddingModel: string,
    chatModel: string,
    description: string
): Promise<RagConnectionProto.AsObject> => {
    const client = new WorkflowServicePromiseClient(getApiUrl())
    const req = new CreateRagConnectionRequest()
    const conn = new RagConnectionProto()
    conn.setName(name)
    conn.setOllamabaseurl(ollamaBaseUrl || 'http://localhost:11434')
    conn.setEmbeddingmodel(embeddingModel || 'nomic-embed-text')
    conn.setChatmodel(chatModel || 'gemma4')
    conn.setDescription(description || '')
    req.setConnection(conn)

    const res = await client.createRagConnection(req, getHeaders())
    return res.toObject()
}

export const updateRagConnection = async (
    id: string,
    name: string,
    ollamaBaseUrl: string,
    embeddingModel: string,
    chatModel: string,
    description: string
): Promise<RagConnectionProto.AsObject> => {
    const client = new WorkflowServicePromiseClient(getApiUrl())
    const req = new UpdateRagConnectionRequest()
    const conn = new RagConnectionProto()
    conn.setId(id)
    conn.setName(name)
    conn.setOllamabaseurl(ollamaBaseUrl)
    conn.setEmbeddingmodel(embeddingModel)
    conn.setChatmodel(chatModel)
    conn.setDescription(description)
    req.setConnection(conn)

    const res = await client.updateRagConnection(req, getHeaders())
    return res.toObject()
}

export const deleteRagConnection = async (id: string): Promise<void> => {
    const client = new WorkflowServicePromiseClient(getApiUrl())
    const req = new DeleteRagConnectionRequest()
    req.setId(id)
    await client.deleteRagConnection(req, getHeaders())
}

export const getRagDocuments = async (ragConnectionId: string): Promise<RagDocumentProto.AsObject[]> => {
    const client = new WorkflowServicePromiseClient(getApiUrl())
    const req = new ListRagDocumentsRequest()
    req.setRagconnectionid(ragConnectionId)
    const res = await client.listRagDocuments(req, getHeaders())
    return res.getDocumentsList().map(d => d.toObject())
}

export const uploadRagDocument = async (
    ragConnectionId: string,
    fileName: string,
    fileContent: Uint8Array
): Promise<RagDocumentProto.AsObject> => {
    const client = new WorkflowServicePromiseClient(getApiUrl())
    const req = new UploadRagDocumentRequest()
    req.setRagconnectionid(ragConnectionId)
    req.setFilename(fileName)
    req.setFilecontent(fileContent)
    const res = await client.uploadRagDocument(req, getHeaders())
    return res.toObject()
}

export const deleteRagDocument = async (id: string, ragConnectionId: string): Promise<void> => {
    const client = new WorkflowServicePromiseClient(getApiUrl())
    const req = new DeleteRagDocumentRequest()
    req.setId(id)
    req.setRagconnectionid(ragConnectionId)
    await client.deleteRagDocument(req, getHeaders())
}

export const queryRag = async (
    ragConnectionId: string,
    query: string,
    topK: number = 3,
    systemPrompt: string = ''
): Promise<QueryRagResponse.AsObject> => {
    const client = new WorkflowServicePromiseClient(getApiUrl())
    const req = new QueryRagRequest()
    req.setRagconnectionid(ragConnectionId)
    req.setQuery(query)
    req.setTopk(topK)
    req.setSystemprompt(systemPrompt)
    const res = await client.queryRag(req, getHeaders())
    return res.toObject()
}
