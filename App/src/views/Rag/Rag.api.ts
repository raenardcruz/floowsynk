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
import { getApiUrl, getRestUrl } from '@/components/Composable/constants'

export interface OllamaModelItem {
  name: string
  model: string
  size?: number
  parameterSize?: string
  family?: string
  capabilities?: string[]
  isEmbedding?: boolean
  isChat?: boolean
}

export const fetchInstalledOllamaModels = async (baseUrl: string = ''): Promise<{ models: OllamaModelItem[], source: string, error?: string }> => {
  const cleanBase = baseUrl.trim()

  // 1. Try querying via backend REST endpoint
  try {
    const restEndpoint = `${getRestUrl()}/api/rag/models?url=${encodeURIComponent(cleanBase)}`
    const token = localStorage.getItem('sessionToken') || ''
    const res = await fetch(restEndpoint, {
      method: 'GET',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    })
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data.models) && data.models.length > 0) {
        return { models: data.models, source: 'server' }
      }
    }
  } catch (serverErr) {
    console.warn('Floowsynk server /api/rag/models endpoint query failed, trying direct local query:', serverErr)
  }

  // 2. Direct browser fallback query to local Ollama instance
  try {
    const directUrl = (cleanBase || 'http://localhost:11434').replace(/\/$/, '')
    const directRes = await fetch(`${directUrl}/api/tags`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    })
    if (directRes.ok) {
      const data = await directRes.json()
      if (Array.isArray(data.models) && data.models.length > 0) {
        const models: OllamaModelItem[] = data.models.map((m: any) => {
          const caps: string[] = Array.isArray(m.capabilities) ? m.capabilities : []
          const lowerName = (m.name || '').toLowerCase()
          const lowerFamily = (m.details?.family || '').toLowerCase()
          const isEmbed = caps.some((c: string) => c.toLowerCase() === 'embedding') || lowerName.includes('embed') || lowerFamily.includes('embed')
          const isChat = caps.some((c: string) => c.toLowerCase() === 'completion' || c.toLowerCase() === 'chat') || !isEmbed
          return {
            name: m.name,
            model: m.model || m.name,
            size: m.size,
            parameterSize: m.details?.parameter_size,
            family: m.details?.family,
            capabilities: caps,
            isEmbedding: isEmbed,
            isChat: isChat
          }
        })
        return { models, source: 'direct' }
      }
    }
  } catch (directErr) {
    console.warn('Direct local Ollama query failed:', directErr)
  }

  return { models: [], source: 'none' }
}

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
    description: string,
    llmConnectionId: string = ''
): Promise<RagConnectionProto.AsObject> => {
    const client = new WorkflowServicePromiseClient(getApiUrl())
    const req = new CreateRagConnectionRequest()
    const conn = new RagConnectionProto()
    conn.setName(name)
    conn.setOllamabaseurl(ollamaBaseUrl || 'http://localhost:11434')
    conn.setEmbeddingmodel(embeddingModel || 'nomic-embed-text')
    conn.setChatmodel(chatModel || 'gemma4')
    conn.setDescription(description || '')
    if (llmConnectionId) {
        conn.setLlmconnectionid(llmConnectionId)
    }
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
    description: string,
    llmConnectionId: string = ''
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
    if (llmConnectionId) {
        conn.setLlmconnectionid(llmConnectionId)
    }
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
    systemPrompt: string = '',
    llmConnectionId: string = ''
): Promise<QueryRagResponse.AsObject> => {
    const client = new WorkflowServicePromiseClient(getApiUrl())
    const req = new QueryRagRequest()
    req.setRagconnectionid(ragConnectionId)
    req.setQuery(query)
    req.setTopk(topK)
    req.setSystemprompt(systemPrompt)
    if (llmConnectionId) {
        req.setLlmconnectionid(llmConnectionId)
    }
    const res = await client.queryRag(req, getHeaders())
    return res.toObject()
}
