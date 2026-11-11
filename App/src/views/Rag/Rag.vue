<template>
  <div class="rag-container">
    <!-- Header -->
    <div class="header-section">
      <div>
        <h1 class="page-title">
          <i class="pi pi-sparkles"></i> RAG Connections & Knowledge Base
        </h1>
        <p class="page-subtitle">
          Manage Ollama vector knowledge bases, upload documents, and test retrieval chatbot.
        </p>
      </div>
      <button class="btn btn-primary" v-if="!isGuest" @click="openCreateModal">
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
      <button class="btn btn-primary" v-if="!isGuest" @click="openCreateModal">
        <i class="pi pi-plus"></i> Create Connection
      </button>
    </div>

    <div v-else class="connections-grid">
      <div v-for="conn in connections" :key="conn.id" class="rag-card">
        <div class="rag-card-header">
          <div class="rag-icon-badge">
            <i class="pi pi-database"></i>
          </div>
          <div class="rag-card-info">
            <h3 class="rag-card-title">{{ conn.name }}</h3>
            <p class="rag-card-desc">{{ conn.description || 'No description provided' }}</p>
          </div>
        </div>

        <div class="rag-specs">
          <div class="spec-item">
            <span class="spec-label"><i class="pi pi-bolt"></i> Provider:</span>
            <span class="spec-value">Ollama</span>
          </div>
          <div class="spec-item">
            <span class="spec-label"><i class="pi pi-server"></i> Ollama Host:</span>
            <span class="spec-value" :title="conn.ollamabaseurl">{{ conn.ollamabaseurl }}</span>
          </div>
          <div class="spec-item">
            <span class="spec-label"><i class="pi pi-sliders-h"></i> Embed Model:</span>
            <span class="spec-value" :title="conn.embeddingmodel">{{ conn.embeddingmodel }}</span>
          </div>
          <div class="spec-item">
            <span class="spec-label"><i class="pi pi-comments"></i> Chat Model:</span>
            <span class="spec-value" :title="conn.chatmodel">{{ conn.chatmodel }}</span>
          </div>
          <div class="spec-item">
            <span class="spec-label"><i class="pi pi-sparkles"></i> Summarizer:</span>
            <span class="spec-value" :title="getSummarizerName(conn)">{{ getSummarizerName(conn) }}</span>
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
          <button class="btn btn-secondary" v-if="!isGuest" @click="openEditModal(conn)" title="Edit Connection">
            <i class="pi pi-pencil"></i>
          </button>
          <button class="btn btn-danger" v-if="!isGuest" @click="handleDelete(conn.id)" title="Delete Connection">
            <i class="pi pi-trash"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Create / Edit Modal -->
    <transition name="modal-pop">
      <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
        <div class="modal-card">
          <div class="modal-header">
            <h2 class="modal-title">{{ isEditing ? 'Edit RAG Connection' : 'New RAG Connection' }}</h2>
            <button class="close-btn" @click="showModal = false" title="Close"><i class="pi pi-times"></i></button>
          </div>

          <!-- Provider: Defaulted to Ollama -->
          <div class="form-group">
            <label class="form-label">Knowledge Connection Provider</label>
            <div class="provider-badge-row">
              <div class="provider-pill active">
                <i class="pi pi-bolt"></i>
                <span>Ollama (Local / Self-hosted)</span>
                <span class="provider-tag">Default</span>
              </div>
            </div>
            <span class="form-hint">
              RAG Knowledge Connection defaults to local Ollama for zero-cost, private embeddings and chat LLM inference.
            </span>
          </div>

          <div class="form-group">
            <label class="form-label">Connection Name</label>
            <input type="text" v-model="form.name" class="form-input" placeholder="e.g. Customer Support Knowledge Base" />
          </div>

          <div class="form-group">
            <div class="form-label-row">
              <label class="form-label">Ollama Base URL</label>
              <button
                type="button"
                class="btn-text-action"
                @click="loadInstalledModels(false)"
                :disabled="modelsLoading"
                title="Scan locally installed Ollama models"
              >
                <i class="pi pi-refresh" :class="{ 'pi-spin': modelsLoading }"></i>
                {{ modelsLoading ? 'Scanning...' : 'Scan Local Models' }}
              </button>
            </div>
            <input
              type="text"
              v-model="form.ollamaBaseUrl"
              class="form-input"
              placeholder="http://localhost:11434"
              @blur="onUrlBlur"
            />
            <span class="form-hint">
              Default: <code>http://localhost:11434</code> (or <code>http://host.docker.internal:11434</code> for Docker-deployed instances).
            </span>
          </div>

          <!-- Model Detection Status Banner -->
          <div v-if="modelsLoading" class="models-status-banner loading">
            <i class="pi pi-spin pi-spinner"></i>
            <span>Querying locally installed Ollama models...</span>
          </div>
          <div v-else-if="installedModels.length > 0" class="models-status-banner success">
            <i class="pi pi-check-circle"></i>
            <span>
              Found <strong>{{ installedModels.length }}</strong> local models
              <span v-if="embeddingCount > 0">({{ embeddingCount }} embedding, {{ chatCount }} chat)</span>
            </span>
          </div>
          <div v-else-if="modelsSearched" class="models-status-banner warning">
            <i class="pi pi-exclamation-triangle"></i>
            <span>Could not query local models from {{ form.ollamaBaseUrl || 'Ollama' }}. Custom model inputs enabled.</span>
          </div>

          <!-- Embedding Model Dropdown / Custom -->
          <div class="form-group">
            <div class="form-label-row">
              <label class="form-label">Embedding Model</label>
              <button
                v-if="installedModels.length > 0"
                type="button"
                class="btn-link-action"
                @click="customEmbedMode = !customEmbedMode"
              >
                {{ customEmbedMode ? '← Pick from installed models' : '✏️ Custom model name' }}
              </button>
            </div>

            <!-- Dropdown mode -->
            <div v-if="!customEmbedMode && embeddingModelOptions.length > 0">
              <select v-model="form.embeddingModel" class="form-input form-select">
                <option disabled value="">Select an installed embedding model...</option>
                <option
                  v-for="opt in embeddingModelOptions"
                  :key="opt.value"
                  :value="opt.value"
                >
                  {{ opt.label }}
                </option>
              </select>
            </div>
            <!-- Manual input mode -->
            <div v-else>
              <input
                type="text"
                v-model="form.embeddingModel"
                class="form-input"
                placeholder="e.g. nomic-embed-text or embeddinggemma-2:latest"
              />
            </div>
            <span class="form-hint" v-if="!customEmbedMode && embeddingModelOptions.length > 0">
              Locally installed Ollama models available for vector embeddings.
            </span>
            <span class="form-hint" v-else>
              Enter an Ollama embedding model name (e.g. <code>nomic-embed-text</code>, <code>all-minilm</code>).
            </span>
          </div>

          <!-- Chat LLM Model Dropdown / Custom -->
          <div class="form-group">
            <div class="form-label-row">
              <label class="form-label">Chat LLM Model</label>
              <button
                v-if="installedModels.length > 0"
                type="button"
                class="btn-link-action"
                @click="customChatMode = !customChatMode"
              >
                {{ customChatMode ? '← Pick from installed models' : '✏️ Custom model name' }}
              </button>
            </div>

            <!-- Dropdown mode -->
            <div v-if="!customChatMode && chatModelOptions.length > 0">
              <select v-model="form.chatModel" class="form-input form-select">
                <option disabled value="">Select an installed chat model...</option>
                <option
                  v-for="opt in chatModelOptions"
                  :key="opt.value"
                  :value="opt.value"
                >
                  {{ opt.label }}
                </option>
              </select>
            </div>
            <!-- Manual input mode -->
            <div v-else>
              <input
                type="text"
                v-model="form.chatModel"
                class="form-input"
                placeholder="e.g. gemma4:e2b-mlx or llama3"
              />
            </div>
            <span class="form-hint" v-if="!customChatMode && chatModelOptions.length > 0">
              Locally installed Ollama models available to generate responses from context.
            </span>
            <span class="form-hint" v-else>
              Enter an Ollama chat/generation model name (e.g. <code>gemma4</code>, <code>llama3</code>).
            </span>
          </div>

          <!-- LLM Summarizer Connection -->
          <div class="form-group">
            <label class="form-label">LLM Summarizer Connection (Optional)</label>
            <select v-model="form.llmConnectionId" class="form-input form-select">
              <option value="">Default Ollama (Local Knowledge Base host & model)</option>
              <option v-for="c in llmConnections" :key="c.id" :value="c.id">
                {{ c.name }} ({{ c.connectorid || c.connectorId }})
              </option>
            </select>
            <span class="form-hint">
              Optionally route response summarization to a connected LLM (e.g. Gemini, Ollama, OpenAI).
            </span>
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
    </transition>

    <!-- Documents Modal -->
    <transition name="modal-pop">
      <div v-if="showDocsModal" class="modal-overlay" @click.self="showDocsModal = false">
        <div class="modal-card modal-card-wide">
          <div class="modal-header">
            <h2 class="modal-title">Documents - {{ selectedConn?.name }}</h2>
            <button class="close-btn" @click="showDocsModal = false" title="Close"><i class="pi pi-times"></i></button>
          </div>

          <div class="form-group" style="margin-bottom: 20px;" v-if="!isGuest">
            <input type="file" ref="fileInputRef" style="display: none;" @change="handleFileUpload" accept=".txt,.md,.json,.csv,.pdf" />
            <button class="btn btn-primary" :disabled="uploading" @click="$refs.fileInputRef.click()">
              <i v-if="uploading" class="pi pi-spin pi-spinner"></i>
              <i v-else class="pi pi-upload"></i> Upload Document (.txt, .md, .json, .csv)
            </button>
          </div>

          <div v-if="docsLoading" class="docs-loading-state">
            <i class="pi pi-spin pi-spinner"></i>
          </div>

          <div v-else-if="documents.length === 0" class="docs-empty-state">
            No documents uploaded yet.
          </div>

          <div v-else class="docs-list">
            <div v-for="doc in documents" :key="doc.id" class="doc-item">
              <div class="doc-item-main">
                <div>
                  <div class="doc-filename">{{ doc.filename }}</div>
                  <div class="doc-meta">
                    {{ (doc.filesize / 1024).toFixed(1) }} KB · {{ doc.status === 'PROCESSING' ? (doc.processedchunkcount || 0) : doc.chunkcount }} chunks
                  </div>
                </div>
                <div class="doc-item-actions">
                  <span class="badge-status" :class="{
                    'badge-ready': doc.status === 'READY',
                    'badge-processing': doc.status === 'PROCESSING',
                    'badge-failed': doc.status === 'FAILED'
                  }">{{ doc.status }}</span>
                  <button class="btn btn-danger btn-icon-only" v-if="!isGuest" @click="handleDeleteDoc(doc.id)" title="Delete document">
                    <i class="pi pi-trash"></i>
                  </button>
                </div>
              </div>

              <!-- Real-time Progress Bar for Embeddings -->
              <div v-if="doc.status === 'PROCESSING'" class="doc-progress-container">
                <div class="doc-progress-info">
                  <span><i class="pi pi-spin pi-spinner"></i> Generating Embeddings...</span>
                  <span>{{ doc.processedchunkcount || 0 }} / {{ doc.totalchunkcount || '?' }} chunks ({{ Math.min(100, Math.round(((doc.processedchunkcount || 0) / (doc.totalchunkcount || 1)) * 100)) }}%)</span>
                </div>
                <div class="doc-progress-bar">
                  <div class="doc-progress-fill" :style="{ width: Math.min(100, Math.round(((doc.processedchunkcount || 0) / (doc.totalchunkcount || 1)) * 100)) + '%' }"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Chatbot Drawer -->
    <transition name="drawer-slide-right">
      <div v-if="showChatDrawer" class="chat-drawer">
        <div class="chat-header">
          <div class="chat-title-group">
            <i class="pi pi-comments chat-header-icon"></i>
            <div>
              <div class="chat-title">{{ activeChatConn?.name }}</div>
              <div class="chat-subtitle">Ollama RAG Playground</div>
            </div>
          </div>
          <button class="close-btn" @click="showChatDrawer = false" title="Close"><i class="pi pi-times"></i></button>
        </div>

        <div class="chat-llm-bar">
          <div class="chat-llm-bar-inner">
            <span class="chat-llm-label"><i class="pi pi-sparkles"></i> Summarizer:</span>
            <select v-model="activeChatLlmConnId" class="chat-llm-select">
              <option value="">Knowledge Base Default ({{ getSummarizerName(activeChatConn) }})</option>
              <option v-for="c in llmConnections" :key="c.id" :value="c.id">
                {{ c.name }} ({{ c.connectorid || c.connectorId }})
              </option>
            </select>
          </div>
        </div>

        <div class="chat-messages" ref="chatScrollRef">
          <div v-if="chatMessages.length === 0" class="chat-empty-state">
            <i class="pi pi-comments"></i>
            <p>Ask any question related to the documents uploaded in this connection!</p>
          </div>

          <div v-for="(msg, idx) in chatMessages" :key="idx"
               class="chat-bubble" :class="msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-bot'">
            <div v-if="msg.summarizer && msg.role === 'bot'" class="chat-summarizer-tag">
              <i class="pi pi-sparkles"></i> {{ msg.summarizer }}
            </div>
            <div class="chat-bubble-text">{{ msg.content }}</div>
            <div v-if="msg.sources && msg.sources.length > 0" class="source-chips">
              <strong class="source-chips-title">Sources retrieved:</strong>
              <div v-for="(s, sIdx) in msg.sources" :key="sIdx" class="source-item">
                📄 {{ s.documentname }} (score: {{ (s.score * 100).toFixed(1) }}%)
              </div>
            </div>
          </div>
        </div>

        <div class="chat-input-row">
          <input type="text" v-model="chatInput" @keyup.enter="sendChatMessage" placeholder="Ask a question..." :disabled="chatSending" />
          <button class="btn btn-chatbot" :disabled="chatSending || !chatInput.trim()" @click="sendChatMessage" title="Send message">
            <i v-if="chatSending" class="pi pi-spin pi-spinner"></i>
            <i v-else class="pi pi-send"></i>
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import {
  getRagConnections,
  createRagConnection,
  updateRagConnection,
  deleteRagConnection,
  getRagDocuments,
  uploadRagDocument,
  deleteRagDocument,
  queryRag,
  fetchInstalledOllamaModels,
  type OllamaModelItem
} from './Rag.api'
import { getConnections } from '@/views/Connectors/Connectors.api'

const toast = useToast()
const confirm = useConfirm()
const isGuest = computed(() => localStorage.getItem('sessionToken') === 'guest')
const connections = ref<any[]>([])
const availableConnections = ref<any[]>([])
const loading = ref(true)

const llmConnections = computed(() => {
  return availableConnections.value.filter(c =>
    ['google_gemini', 'ollama', 'openai', 'anthropic'].includes((c.connectorid || c.connectorId || '').toLowerCase())
  )
})

const getSummarizerName = (conn: any) => {
  if (!conn) return 'Ollama'
  const llmId = conn.llmconnectionid || conn.llmConnectionId
  if (llmId) {
    const match = availableConnections.value.find(c => c.id === llmId)
    if (match) {
      return `${match.name} (${match.connectorid || match.connectorId})`
    }
  }
  return `Ollama (${conn.chatmodel || 'gemma4'})`
}

const showModal = ref(false)
const isEditing = ref(false)
const editingId = ref('')
const saving = ref(false)
const form = ref({
  name: '',
  ollamaBaseUrl: 'http://localhost:11434',
  embeddingModel: 'nomic-embed-text',
  chatModel: 'gemma4',
  description: '',
  llmConnectionId: ''
})

const installedModels = ref<OllamaModelItem[]>([])
const modelsLoading = ref(false)
const modelsSearched = ref(false)
const customEmbedMode = ref(false)
const customChatMode = ref(false)
let lastQueriedUrl = ''

const embeddingCount = computed(() => installedModels.value.filter(m => m.isEmbedding).length)
const chatCount = computed(() => installedModels.value.filter(m => m.isChat).length)

const formatModelSize = (bytes?: number) => {
  if (!bytes) return ''
  const gb = bytes / (1024 * 1024 * 1024)
  if (gb >= 1) return ` (${gb.toFixed(1)} GB)`
  const mb = bytes / (1024 * 1024)
  return ` (${mb.toFixed(0)} MB)`
}

const embeddingModelOptions = computed(() => {
  if (installedModels.value.length === 0) return []

  const embedModels = installedModels.value.filter(m => m.isEmbedding)
  const otherModels = installedModels.value.filter(m => !m.isEmbedding)

  const items = [
    ...embedModels.map(m => ({
      label: `✨ ${m.name} [Embedding]${formatModelSize(m.size)}`,
      value: m.name
    })),
    ...otherModels.map(m => ({
      label: `${m.name}${formatModelSize(m.size)}`,
      value: m.name
    }))
  ]

  if (form.value.embeddingModel && !items.some(i => i.value === form.value.embeddingModel)) {
    items.unshift({
      label: `${form.value.embeddingModel} (Current)`,
      value: form.value.embeddingModel
    })
  }

  return items
})

const chatModelOptions = computed(() => {
  if (installedModels.value.length === 0) return []

  const chatModels = installedModels.value.filter(m => m.isChat)
  const otherModels = installedModels.value.filter(m => !m.isChat)

  const items = [
    ...chatModels.map(m => ({
      label: `💬 ${m.name}${m.parameterSize ? ` (${m.parameterSize})` : ''}${formatModelSize(m.size)}`,
      value: m.name
    })),
    ...otherModels.map(m => ({
      label: `${m.name}${formatModelSize(m.size)}`,
      value: m.name
    }))
  ]

  if (form.value.chatModel && !items.some(i => i.value === form.value.chatModel)) {
    items.unshift({
      label: `${form.value.chatModel} (Current)`,
      value: form.value.chatModel
    })
  }

  return items
})

const loadInstalledModels = async (autoSelect = false) => {
  modelsLoading.value = true
  modelsSearched.value = true
  try {
    const res = await fetchInstalledOllamaModels(form.value.ollamaBaseUrl)
    installedModels.value = res.models
    lastQueriedUrl = form.value.ollamaBaseUrl.trim()

    if (res.models.length > 0) {
      if (autoSelect || !form.value.embeddingModel || !form.value.chatModel) {
        // Prioritize models explicitly detected as embedding
        const bestEmbed = res.models.find(m => m.isEmbedding) || res.models[0]
        if (bestEmbed && (autoSelect || !form.value.embeddingModel)) {
          form.value.embeddingModel = bestEmbed.name
        }

        // Prioritize models detected as chat / completion
        const bestChat = res.models.find(m => m.isChat) || res.models[0]
        if (bestChat && (autoSelect || !form.value.chatModel)) {
          form.value.chatModel = bestChat.name
        }
      }
      customEmbedMode.value = false
      customChatMode.value = false
    } else {
      customEmbedMode.value = true
      customChatMode.value = true
    }
  } catch (err) {
    console.error('Error fetching installed models:', err)
    customEmbedMode.value = true
    customChatMode.value = true
  } finally {
    modelsLoading.value = false
  }
}

const onUrlBlur = () => {
  const url = form.value.ollamaBaseUrl.trim()
  if (url && url !== lastQueriedUrl) {
    loadInstalledModels(false)
  }
}

const showDocsModal = ref(false)
const selectedConn = ref<any>(null)
const documents = ref<any[]>([])
const docsLoading = ref(false)
const uploading = ref(false)
const fileInputRef = ref<any>(null)

const showChatDrawer = ref(false)
const activeChatConn = ref<any>(null)
const activeChatLlmConnId = ref<string>('')
const chatInput = ref('')
const chatSending = ref(false)
const chatMessages = ref<{ role: 'user' | 'bot'; content: string; sources?: any[]; summarizer?: string }[]>([])
const chatScrollRef = ref<any>(null)

const loadConnections = async () => {
  loading.value = true
  try {
    const [ragList, connsList] = await Promise.all([
      getRagConnections(),
      getConnections().then(res => res.toObject().connectionsList || []).catch(() => [])
    ])
    connections.value = ragList
    availableConnections.value = connsList
  } catch (err) {
    console.error('Failed loading RAG connections:', err)
  } finally {
    loading.value = false
  }
}

const openCreateModal = () => {
  if (isGuest.value) return
  isEditing.value = false
  editingId.value = ''
  form.value = {
    name: 'Ollama Knowledge Base',
    ollamaBaseUrl: 'http://localhost:11434',
    embeddingModel: '',
    chatModel: '',
    description: '',
    llmConnectionId: ''
  }
  customEmbedMode.value = false
  customChatMode.value = false
  showModal.value = true
  loadInstalledModels(true)
}

const openEditModal = (conn: any) => {
  if (isGuest.value) return
  isEditing.value = true
  editingId.value = conn.id
  form.value = {
    name: conn.name,
    ollamaBaseUrl: conn.ollamabaseurl || 'http://localhost:11434',
    embeddingModel: conn.embeddingmodel,
    chatModel: conn.chatmodel,
    description: conn.description,
    llmConnectionId: conn.llmconnectionid || conn.llmConnectionId || ''
  }
  showModal.value = true
  loadInstalledModels(false)
}

const handleSave = async () => {
  if (isGuest.value) return
  const name = form.value.name.trim() || 'Ollama Knowledge Base'
  const ollamaBaseUrl = form.value.ollamaBaseUrl.trim() || 'http://localhost:11434'
  const embeddingModel = form.value.embeddingModel.trim() || 'nomic-embed-text'
  const chatModel = form.value.chatModel.trim() || 'gemma4'

  saving.value = true
  try {
    if (isEditing.value) {
      await updateRagConnection(
        editingId.value,
        name,
        ollamaBaseUrl,
        embeddingModel,
        chatModel,
        form.value.description,
        form.value.llmConnectionId
      )
      toast.add({ severity: 'success', summary: 'Updated', detail: 'RAG connection updated successfully.', life: 3000 })
    } else {
      await createRagConnection(
        name,
        ollamaBaseUrl,
        embeddingModel,
        chatModel,
        form.value.description,
        form.value.llmConnectionId
      )
      toast.add({ severity: 'success', summary: 'Created', detail: 'RAG connection created successfully.', life: 3000 })
    }
    showModal.value = false
    await loadConnections()
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Error', detail: `Error saving RAG connection: ${err}`, life: 4000 })
  } finally {
    saving.value = false
  }
}

const handleDelete = (id: string) => {
  if (isGuest.value) return
  confirm.require({
    message: 'Are you sure you want to delete this RAG connection and all indexed document vectors?',
    header: 'Delete RAG Connection',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await deleteRagConnection(id)
        toast.add({ severity: 'info', summary: 'Deleted', detail: 'RAG connection removed.', life: 3000 })
        await loadConnections()
      } catch (err) {
        toast.add({ severity: 'error', summary: 'Delete Failed', detail: String(err), life: 4000 })
      }
    }
  })
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
  if (isGuest.value) return
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
    toast.add({ severity: 'error', summary: 'Upload Failed', detail: String(err), life: 4000 })
  } finally {
    uploading.value = false
    if (fileInputRef.value) fileInputRef.value.value = ''
  }
}

const handleDeleteDoc = async (docId: string) => {
  if (isGuest.value) return
  if (!selectedConn.value) return
  try {
    await deleteRagDocument(docId, selectedConn.value.id)
    toast.add({ severity: 'info', summary: 'Deleted', detail: 'Document removed from knowledge base.', life: 3000 })
    documents.value = await getRagDocuments(selectedConn.value.id)
    await loadConnections()
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Delete Failed', detail: String(err), life: 4000 })
  }
}

const openChatDrawer = (conn: any) => {
  activeChatConn.value = conn
  activeChatLlmConnId.value = conn.llmconnectionid || conn.llmConnectionId || ''
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

  const selectedLlm = activeChatLlmConnId.value
  const summarizerLabel = selectedLlm
    ? getSummarizerName({ llmconnectionid: selectedLlm })
    : getSummarizerName(activeChatConn.value)

  try {
    const res = await queryRag(activeChatConn.value.id, query, 3, '', selectedLlm)
    chatMessages.value.push({
      role: 'bot',
      content: res.answer,
      sources: res.sourcesList,
      summarizer: summarizerLabel
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
