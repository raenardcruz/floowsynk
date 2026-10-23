<template>
  <div class="rag-container">
    <!-- Header -->
    <div class="header-section">
      <div>
        <h1 class="page-title">
          <i class="pi pi-bolt"></i> RAG Connections & Knowledge Base
        </h1>
        <p class="page-subtitle">
          Manage Ollama vector knowledge bases, upload documents, and test retrieval chatbot.
        </p>
      </div>
      <button class="btn btn-primary" @click="openCreateModal">
        <i class="pi pi-plus"></i> New RAG Connection
      </button>
    </div>

    <!-- Active RAG Connections Grid -->
    <div v-if="loading" class="empty-state">
      <i class="pi pi-spin pi-spinner empty-icon"></i>
      <h3>Loading RAG Connections...</h3>
    </div>

    <div v-else-if="connections.length === 0" class="empty-state">
      <div class="empty-icon"><i class="pi pi-database"></i></div>
      <h3>No RAG Connections yet</h3>
      <p>Create your first RAG connection using Ollama to start indexing documents.</p>
      <button class="btn btn-primary" @click="openCreateModal">
        <i class="pi pi-plus"></i> Create Connection
      </button>
    </div>

    <div v-else class="connections-grid">
      <div v-for="conn in connections" :key="conn.id" class="rag-card">
        <div class="rag-card-header">
          <div class="rag-icon-badge">
            <i class="pi pi-brain"></i>
          </div>
          <div class="rag-card-info">
            <h3 class="rag-card-title">{{ conn.name }}</h3>
            <p class="rag-card-desc">{{ conn.description || 'No description provided' }}</p>
          </div>
        </div>

        <div class="rag-specs">
          <div class="spec-item">
            <span class="spec-label"><i class="pi pi-server"></i> Ollama Host:</span>
            <span class="spec-value">{{ conn.ollamabaseurl }}</span>
          </div>
          <div class="spec-item">
            <span class="spec-label"><i class="pi pi-sliders-h"></i> Embed Model:</span>
            <span class="spec-value">{{ conn.embeddingmodel }}</span>
          </div>
          <div class="spec-item">
            <span class="spec-label"><i class="pi pi-comments"></i> Chat Model:</span>
            <span class="spec-value">{{ conn.chatmodel }}</span>
          </div>
        </div>

        <div class="rag-card-stats">
          <div class="stat-pill">
            <i class="pi pi-file"></i> {{ conn.documentcount }} Docs
          </div>
          <div class="stat-pill">
            <i class="pi pi-align-left"></i> {{ conn.chunkcount }} Chunks
          </div>
        </div>

        <div class="rag-card-actions">
          <button class="btn btn-secondary" @click="openDocsModal(conn)">
            <i class="pi pi-folder-open"></i> Docs ({{ conn.documentcount }})
          </button>
          <button class="btn btn-chatbot" @click="openChatDrawer(conn)">
            <i class="pi pi-comments"></i> Chatbot
          </button>
          <button class="btn btn-secondary" @click="openEditModal(conn)">
            <i class="pi pi-pencil"></i>
          </button>
          <button class="btn btn-danger" @click="handleDelete(conn.id)">
            <i class="pi pi-trash"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Create / Edit Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal-card">
        <div class="modal-header">
          <h2 class="modal-title">{{ isEditing ? 'Edit RAG Connection' : 'New RAG Connection' }}</h2>
          <button class="close-btn" @click="showModal = false"><i class="pi pi-times"></i></button>
        </div>

        <div class="form-group">
          <label class="form-label">Connection Name</label>
          <input type="text" v-model="form.name" class="form-input" placeholder="e.g. Customer Support Knowledge Base" />
        </div>

        <div class="form-group">
          <label class="form-label">Ollama Base URL</label>
          <input type="text" v-model="form.ollamaBaseUrl" class="form-input" placeholder="http://localhost:11434" />
        </div>

        <div class="form-group">
          <label class="form-label">Embedding Model</label>
          <input type="text" v-model="form.embeddingModel" class="form-input" placeholder="nomic-embed-text" />
        </div>

        <div class="form-group">
          <label class="form-label">Chat LLM Model</label>
          <input type="text" v-model="form.chatModel" class="form-input" placeholder="gemma4" />
        </div>

        <div class="form-group">
          <label class="form-label">Description</label>
          <textarea v-model="form.description" class="form-textarea" rows="3" placeholder="Brief description of the documents indexed in this connection..."></textarea>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showModal = false">Cancel</button>
          <button class="btn btn-primary" :disabled="saving" @click="handleSave">
            <i v-if="saving" class="pi pi-spin pi-spinner"></i>
            {{ isEditing ? 'Save Changes' : 'Create Connection' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Documents Modal -->
    <div v-if="showDocsModal" class="modal-overlay" @click.self="showDocsModal = false">
      <div class="modal-card" style="width: 680px;">
        <div class="modal-header">
          <h2 class="modal-title">Documents - {{ selectedConn?.name }}</h2>
          <button class="close-btn" @click="showDocsModal = false"><i class="pi pi-times"></i></button>
        </div>

        <div class="form-group" style="margin-bottom: 20px;">
          <input type="file" ref="fileInputRef" style="display: none;" @change="handleFileUpload" accept=".txt,.md,.json,.csv,.pdf" />
          <button class="btn btn-primary" :disabled="uploading" @click="$refs.fileInputRef.click()">
            <i v-if="uploading" class="pi pi-spin pi-spinner"></i>
            <i v-else class="pi pi-upload"></i> Upload Document (.txt, .md, .json, .csv)
          </button>
        </div>

        <div v-if="docsLoading" style="text-align: center; padding: 20px;">
          <i class="pi pi-spin pi-spinner" style="font-size: 24px;"></i>
        </div>

        <div v-else-if="documents.length === 0" style="text-align: center; color: #9ca3af; padding: 30px;">
          No documents uploaded yet.
        </div>

        <div v-else class="docs-list" style="max-height: 360px; overflow-y: auto;">
          <div v-for="doc in documents" :key="doc.id" class="doc-item" style="display: flex; flex-direction: column; align-items: stretch; gap: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div style="font-weight: 600; color: #f3f4f6;">{{ doc.filename }}</div>
                <div style="font-size: 12px; color: #9ca3af;">
                  {{ (doc.filesize / 1024).toFixed(1) }} KB · {{ doc.status === 'PROCESSING' ? (doc.processedchunkcount || 0) : doc.chunkcount }} chunks
                </div>
              </div>
              <div style="display: flex; align-items: center; gap: 12px;">
                <span class="badge-status" :class="{
                  'badge-ready': doc.status === 'READY',
                  'badge-processing': doc.status === 'PROCESSING',
                  'badge-failed': doc.status === 'FAILED'
                }">{{ doc.status }}</span>
                <button class="btn btn-danger" style="padding: 6px 10px;" @click="handleDeleteDoc(doc.id)">
                  <i class="pi pi-trash"></i>
                </button>
              </div>
            </div>

            <!-- Real-time Progress Bar for Embeddings -->
            <div v-if="doc.status === 'PROCESSING'" style="margin-top: 4px;">
              <div style="display: flex; justify-content: space-between; font-size: 11px; color: #facc15; margin-bottom: 4px; font-weight: 600;">
                <span><i class="pi pi-spin pi-spinner"></i> Generating Embeddings...</span>
                <span>{{ doc.processedchunkcount || 0 }} / {{ doc.totalchunkcount || '?' }} chunks ({{ Math.min(100, Math.round(((doc.processedchunkcount || 0) / (doc.totalchunkcount || 1)) * 100)) }}%)</span>
              </div>
              <div style="width: 100%; height: 6px; background: rgba(255,255,255,0.1); border-radius: 4px; overflow: hidden;">
                <div :style="{ width: Math.min(100, Math.round(((doc.processedchunkcount || 0) / (doc.totalchunkcount || 1)) * 100)) + '%' }" style="height: 100%; background: linear-gradient(90deg, #eab308, #4ade80); transition: width 0.3s ease;"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Chatbot Drawer -->
    <div v-if="showChatDrawer" class="chat-drawer">
      <div class="chat-header">
        <div class="chat-title-group">
          <i class="pi pi-comments" style="font-size: 20px; color: #ec4899;"></i>
          <div>
            <div style="font-weight: 700; color: #ffffff;">{{ activeChatConn?.name }}</div>
            <div style="font-size: 11px; color: #a78bfa;">Ollama RAG Playground</div>
          </div>
        </div>
        <button class="close-btn" @click="showChatDrawer = false"><i class="pi pi-times"></i></button>
      </div>

      <div class="chat-messages" ref="chatScrollRef">
        <div v-if="chatMessages.length === 0" style="text-align: center; color: #9ca3af; margin-top: 40px;">
          <i class="pi pi-bot" style="font-size: 36px; margin-bottom: 12px; color: #818cf8;"></i>
          <p>Ask any question related to the documents uploaded in this connection!</p>
        </div>

        <div v-for="(msg, idx) in chatMessages" :key="idx"
             class="chat-bubble" :class="msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-bot'">
          <div>{{ msg.content }}</div>
          <div v-if="msg.sources && msg.sources.length > 0" class="source-chips">
            <strong>Sources retrieved:</strong>
            <div v-for="(s, sIdx) in msg.sources" :key="sIdx" style="margin-top: 4px;">
              📄 {{ s.documentname }} (score: {{ (s.score * 100).toFixed(1) }}%)
            </div>
          </div>
        </div>
      </div>

      <div class="chat-input-row">
        <input type="text" v-model="chatInput" @keyup.enter="sendChatMessage" placeholder="Ask a question..." :disabled="chatSending" />
        <button class="btn btn-chatbot" :disabled="chatSending || !chatInput.trim()" @click="sendChatMessage">
          <i v-if="chatSending" class="pi pi-spin pi-spinner"></i>
          <i v-else class="pi pi-send"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import {
  getRagConnections,
  createRagConnection,
  updateRagConnection,
  deleteRagConnection,
  getRagDocuments,
  uploadRagDocument,
  deleteRagDocument,
  queryRag
} from './Rag.api'

const connections = ref<any[]>([])
const loading = ref(true)

const showModal = ref(false)
const isEditing = ref(false)
const editingId = ref('')
const saving = ref(false)
const form = ref({
  name: '',
  ollamaBaseUrl: 'http://localhost:11434',
  embeddingModel: 'nomic-embed-text',
  chatModel: 'gemma4',
  description: ''
})

const showDocsModal = ref(false)
const selectedConn = ref<any>(null)
const documents = ref<any[]>([])
const docsLoading = ref(false)
const uploading = ref(false)
const fileInputRef = ref<any>(null)

const showChatDrawer = ref(false)
const activeChatConn = ref<any>(null)
const chatInput = ref('')
const chatSending = ref(false)
const chatMessages = ref<{ role: 'user' | 'bot'; content: string; sources?: any[] }[]>([])
const chatScrollRef = ref<any>(null)

const loadConnections = async () => {
  loading.value = true
  try {
    connections.value = await getRagConnections()
  } catch (err) {
    console.error('Failed loading RAG connections:', err)
  } finally {
    loading.value = false
  }
}

const openCreateModal = () => {
  isEditing.value = false
  editingId.value = ''
  form.value = {
    name: '',
    ollamaBaseUrl: 'http://localhost:11434',
    embeddingModel: 'nomic-embed-text',
    chatModel: 'gemma4',
    description: ''
  }
  showModal.value = true
}

const openEditModal = (conn: any) => {
  isEditing.value = true
  editingId.value = conn.id
  form.value = {
    name: conn.name,
    ollamaBaseUrl: conn.ollamabaseurl,
    embeddingModel: conn.embeddingmodel,
    chatModel: conn.chatmodel,
    description: conn.description
  }
  showModal.value = true
}

const handleSave = async () => {
  if (!form.value.name) return
  saving.value = true
  try {
    if (isEditing.value) {
      await updateRagConnection(
        editingId.value,
        form.value.name,
        form.value.ollamaBaseUrl,
        form.value.embeddingModel,
        form.value.chatModel,
        form.value.description
      )
    } else {
      await createRagConnection(
        form.value.name,
        form.value.ollamaBaseUrl,
        form.value.embeddingModel,
        form.value.chatModel,
        form.value.description
      )
    }
    showModal.value = false
    await loadConnections()
  } catch (err) {
    alert(`Error saving RAG connection: ${err}`)
  } finally {
    saving.value = false
  }
}

const handleDelete = async (id: string) => {
  if (!confirm('Are you sure you want to delete this RAG connection and all indexed document vectors?')) return
  try {
    await deleteRagConnection(id)
    await loadConnections()
  } catch (err) {
    alert(`Failed to delete connection: ${err}`)
  }
}

let docsPollTimer: any = null

const startDocsPolling = () => {
  stopDocsPolling()
  docsPollTimer = setInterval(async () => {
    if (!selectedConn.value || !showDocsModal.value) {
      stopDocsPolling()
      return
    }
    try {
      documents.value = await getRagDocuments(selectedConn.value.id)
      const isProcessing = documents.value.some(d => d.status === 'PROCESSING')
      if (!isProcessing) {
        stopDocsPolling()
        await loadConnections()
      }
    } catch (e) {
      console.error(e)
    }
  }, 1000)
}

const stopDocsPolling = () => {
  if (docsPollTimer) {
    clearInterval(docsPollTimer)
    docsPollTimer = null
  }
}

const openDocsModal = async (conn: any) => {
  selectedConn.value = conn
  showDocsModal.value = true
  docsLoading.value = true
  try {
    documents.value = await getRagDocuments(conn.id)
    if (documents.value.some(d => d.status === 'PROCESSING')) {
      startDocsPolling()
    }
  } catch (err) {
    console.error('Failed loading documents:', err)
  } finally {
    docsLoading.value = false
  }
}

const handleFileUpload = async (event: any) => {
  const file = event.target.files?.[0]
  if (!file || !selectedConn.value) return

  uploading.value = true
  try {
    const arrayBuffer = await file.arrayBuffer()
    const contentBytes = new Uint8Array(arrayBuffer)
    await uploadRagDocument(selectedConn.value.id, file.name, contentBytes)
    documents.value = await getRagDocuments(selectedConn.value.id)
    startDocsPolling()
    await loadConnections()
  } catch (err) {
    alert(`Upload failed: ${err}`)
  } finally {
    uploading.value = false
    if (fileInputRef.value) fileInputRef.value.value = ''
  }
}

const handleDeleteDoc = async (docId: string) => {
  if (!selectedConn.value) return
  try {
    await deleteRagDocument(docId, selectedConn.value.id)
    documents.value = await getRagDocuments(selectedConn.value.id)
    await loadConnections()
  } catch (err) {
    alert(`Failed to delete document: ${err}`)
  }
}

const openChatDrawer = (conn: any) => {
  activeChatConn.value = conn
  chatMessages.value = []
  showChatDrawer.value = true
}

const sendChatMessage = async () => {
  const query = chatInput.value.trim()
  if (!query || !activeChatConn.value || chatSending.value) return

  chatMessages.value.push({ role: 'user', content: query })
  chatInput.value = ''
  chatSending.value = true

  await nextTick()
  if (chatScrollRef.value) chatScrollRef.value.scrollTop = chatScrollRef.value.scrollHeight

  try {
    const res = await queryRag(activeChatConn.value.id, query, 3, '')
    chatMessages.value.push({
      role: 'bot',
      content: res.answer,
      sources: res.sourcesList
    })
  } catch (err) {
    chatMessages.value.push({
      role: 'bot',
      content: `Error generating response: ${err}`
    })
  } finally {
    chatSending.value = false
    await nextTick()
    if (chatScrollRef.value) chatScrollRef.value.scrollTop = chatScrollRef.value.scrollHeight
  }
}

onMounted(() => {
  loadConnections()
})

onUnmounted(() => {
  stopDocsPolling()
})
</script>

<style scoped src="./Rag.styles.css"></style>
