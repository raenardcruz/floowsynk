<template>
  <div class="connectors-container">
    <div class="header-section">
      <h1 class="page-title">Connectors</h1>

      <p class="page-subtitle">Connect external services and configure integrations using OAuth or API Keys.</p>
    </div>

    <!-- Active Connections -->
    <div class="section-card">
      <div class="section-header">
        <h2 class="section-title">Active Connections</h2>
        <span class="badge" v-if="connections.length > 0">{{ connections.length }} Connected</span>
      </div>

      <div v-if="connections.length === 0" class="empty-state">
        <div class="empty-icon"><i class="pi pi-share-alt"></i></div>
        <h3>No active connections</h3>
        <p>Pick a connector from the gallery below to set up your first integration.</p>
      </div>

      <div v-else class="connections-grid">
        <div v-for="conn in connections" :key="conn.id" class="connection-item">
          <div class="connection-meta">
            <span class="connector-icon-wrapper">
              <img v-if="getTemplateIcon(conn.connectorid) && (getTemplateIcon(conn.connectorid).startsWith('/') || getTemplateIcon(conn.connectorid).endsWith('.svg'))" :src="getTemplateIcon(conn.connectorid)" class="connector-img-icon" alt="icon" />
              <i v-else :class="getTemplateIcon(conn.connectorid)"></i>
            </span>
            <div class="connection-details">
              <div class="connection-name-row">
                <span class="connection-name">{{ conn.name }}</span>
                <!-- Credential status badge -->
                <span
                  class="status-badge"
                  :class="{
                    'status-checking': connectionStatuses[conn.id] === 'checking',
                    'status-valid':    connectionStatuses[conn.id] === 'valid',
                    'status-invalid':  connectionStatuses[conn.id] === 'invalid',
                    'status-unknown':  !connectionStatuses[conn.id],
                  }"
                >
                  <span v-if="connectionStatuses[conn.id] === 'checking'" class="status-pulse"></span>
                  <i v-else-if="connectionStatuses[conn.id] === 'valid'" class="pi pi-check-circle"></i>
                  <i v-else-if="connectionStatuses[conn.id] === 'invalid'" class="pi pi-exclamation-triangle"></i>
                  <i v-else class="pi pi-minus-circle"></i>
                  <span v-if="connectionStatuses[conn.id] === 'checking'">Checking…</span>
                  <span v-else-if="connectionStatuses[conn.id] === 'valid'">Active</span>
                  <span v-else-if="connectionStatuses[conn.id] === 'invalid'">Invalid</span>
                  <span v-else>Unknown</span>
                </span>
              </div>
              <span class="connector-type">{{ conn.connectorid }} · {{ conn.authtype }}</span>
            </div>
          </div>
          <div class="connection-actions">
            <button class="btn btn-secondary" @click="openEditModal(conn)" title="Edit connection">
              <i class="pi pi-pencil"></i> Edit
            </button>
            <button class="btn btn-danger" @click="handleDelete(conn.id)" title="Remove this connection">
              <i class="pi pi-trash"></i> Remove
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Connector Gallery -->
    <div class="section-card mt-6">
      <div class="section-header">
        <h2 class="section-title">Connector Gallery</h2>
        <span class="badge" v-if="templates.length > 0">{{ templates.length }} Available</span>
      </div>

      <div class="templates-grid">
        <div v-for="temp in templates" :key="temp.id" class="template-card">
          <div class="template-header">
            <span class="template-icon">
              <img v-if="temp.icon && (temp.icon.startsWith('/') || temp.icon.endsWith('.svg'))" :src="temp.icon" class="connector-img-icon" alt="icon" />
              <i v-else :class="temp.icon || 'pi pi-box'"></i>
            </span>
            <span class="badge badge-success">{{ temp.authtype }}</span>
          </div>
          <h3 class="template-title">{{ temp.name }}</h3>
          <p class="template-desc">{{ temp.description }}</p>
          <button class="btn btn-primary" @click="openConnectModal(temp)">Connect</button>
        </div>
      </div>
    </div>

    <!-- Connect / Edit Modal -->
    <Modal
      :visible="isModalVisible"
      :title="isEditMode ? 'Edit Connection' : 'Add Connection'"
      :caption="isEditMode ? 'Update connection details or re-authenticate' : 'Configure connection details'"
      @update:visible="isModalVisible = $event"
      @save="handleModalSave"
      :saveLabel="isEditMode ? 'Save Changes' : 'Connect'"
      width="70%"
      height="auto"
      bgcolor="none"
    >
      <div class="connection-modal-grid" v-if="selectedTemplate">
        <!-- Left: Configuration Form -->
        <div class="modal-col-form">
          <!-- Connector identity header -->
          <div class="modal-connector-header">
            <span class="modal-connector-icon">
              <img v-if="selectedTemplate.icon && (selectedTemplate.icon.startsWith('/') || selectedTemplate.icon.endsWith('.svg'))" :src="selectedTemplate.icon" class="modal-connector-img" alt="icon" />
              <i v-else :class="selectedTemplate.icon || 'pi pi-box'"></i>
            </span>
            <div class="modal-connector-identity">
              <span class="modal-connector-name">{{ selectedTemplate.name }}</span>
              <span class="modal-connector-authtype">{{ selectedTemplate.authtype }}</span>
            </div>
          </div>
          <h3 class="modal-section-title"><i class="pi pi-cog"></i> Configuration</h3>
          <div class="form-group">
            <label for="connName">Connection Name</label>
            <TextInput id="connName" v-model="newConnectionName" placeholder="e.g. My Slack Connection" class="w-full mt-2" />
          </div>
          <div v-if="selectedTemplate && selectedTemplate.authtype === 'oauth2'" class="form-group mt-4">
            <label for="clientId">Client ID</label>
            <TextInput id="clientId" v-model="clientId" placeholder="Enter Client ID" class="w-full mt-2" />
          </div>
          <div v-if="selectedTemplate && selectedTemplate.authtype === 'oauth2'" class="form-group mt-4">
            <label for="clientSecret">Client Secret</label>
            <PasswordInput id="clientSecret" v-model="clientSecret" placeholder="Enter Client Secret" class="w-full mt-2" />
          </div>

          <!-- Access token — edit mode only: allows direct credential repair without re-OAuth -->
          <div v-if="isEditMode && selectedTemplate && selectedTemplate.authtype === 'oauth2'" class="form-group mt-4">
            <label for="accessToken">
              Access Token
              <span class="field-hint">— paste a new token to replace the stored one</span>
            </label>
            <PasswordInput id="accessToken" v-model="accessToken" placeholder="Leave blank to keep existing" class="w-full mt-2" />
          </div>

          <!-- Re-authenticate button only in edit mode -->
          <div v-if="isEditMode && selectedTemplate.authtype === 'oauth2'" class="reauth-section">
            <p class="reauth-hint">
              <i class="pi pi-info-circle"></i>
              To refresh your credentials, update the Client ID / Secret above and click Re-authenticate.
              Your existing connection ID will be preserved.
            </p>
            <button class="btn btn-reauth" @click="handleReAuth">
              <i class="pi pi-refresh"></i> Re-authenticate
            </button>
          </div>
        </div>

        <!-- Right: Actions & Setup Guide -->
        <div class="modal-col-info">
          <!-- Supported Actions -->
          <div class="supported-actions-section">
            <h3 class="modal-section-title"><i class="pi pi-bolt"></i> Supported Actions</h3>
            <div class="actions-list">
              <div v-for="act in getConnectorActions(selectedTemplate.id)" :key="act.name" class="action-card">
                <div class="action-header">
                  <i :class="act.icon" class="action-icon"></i>
                  <span class="action-name">{{ act.name }}</span>
                </div>
                <p class="action-desc">{{ act.description }}</p>
              </div>
            </div>
          </div>

          <!-- Setup Guide -->
          <div v-if="selectedTemplate && getConnectorInstructions(selectedTemplate.id)" class="instructions-section">
            <h4 class="instructions-title"><i class="pi pi-info-circle"></i> Setup Guide</h4>
            <ol class="instructions-list" v-html="parseMarkdownBody(getConnectorInstructions(selectedTemplate.id))"></ol>
          </div>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  getConnectorTemplates,
  getConnections,
  deleteConnection,
  checkConnectionStatus,
  updateConnection,
} from './Connectors.api'
import Modal from '@/components/Composable/UI/Modal'
import { TextInput, PasswordInput } from '@/components/Composable/UI/Inputs'

interface ConnectorProtoTemplate {
  id: string
  name: string
  description: string
  icon: string
  baseurl: string
  authtype: string
}

interface ConnectionProto {
  id: string
  name: string
  connectorid: string
  authtype: string
  createdat: string
}

type ConnectionStatus = 'checking' | 'valid' | 'invalid' | 'unknown'

const getConnectorActions = (id: string) => {
  if (id === 'github') {
    return [
      { name: 'Create Issue', description: 'Create a new issue in a repository', icon: 'pi pi-exclamation-circle' },
      { name: 'Trigger Workflow Dispatch', description: 'Trigger a GitHub Actions workflow event', icon: 'pi pi-play' },
      { name: 'List Repositories', description: 'List repositories for the authenticated user', icon: 'pi pi-list' }
    ]
  }
  if (id === 'slack') {
    return [
      { name: 'Post Message', description: 'Send a message to a Slack channel', icon: 'pi pi-send' }
    ]
  }
  return []
}

const getConnectorInstructions = (id: string): string => {
  const origin = window.location.origin
  const callbackUrl = `${origin}/connectors`
  if (id === 'github') {
    return `
1. Navigate to GitHub Settings > **Developer Settings** > [OAuth Apps](https://github.com/settings/developers) and click **Register a new application**.
2. Set the **Homepage URL** to \`${origin}\`.
3. Set the **Authorization callback URL** to \`${callbackUrl}\`.
4. Register the application, copy the generated **Client ID**, generate a new **Client Secret**, and paste them below.
    `
  }
  if (id === 'slack') {
    return `
1. Go to the [Slack API Dashboard](https://api.slack.com/apps) and click **Create New App** (From scratch).
2. Navigate to **OAuth & Permissions**, add the Redirect URL \`${callbackUrl}\`, and click **Save URL**.
3. Under **Scopes** > **Bot Token Scopes**, add the \`chat:write\` and \`chat:write.public\` scopes.
4. Under **Basic Information** > **App Credentials**, copy the **Client ID** and **Client Secret**, and paste them below.
    `
  }
  return ''
}

const parseMarkdown = (text: string) => {
  if (!text) return ''
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>')
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" class="instructions-link">$1</a>')
  return html
}

const parseMarkdownBody = (text: string) => {
  const lines = text.trim().split('\n')
  return lines.map(line => {
    const match = line.trim().match(/^(\d+)\.\s+(.*)$/)
    if (match) {
      return `<li>${parseMarkdown(match[2])}</li>`
    }
    return line.trim() ? `<p>${parseMarkdown(line)}</p>` : ''
  }).join('')
}

// ─── State ───────────────────────────────────────────────────────────────────
const templates = ref<ConnectorProtoTemplate[]>([])
const connections = ref<ConnectionProto[]>([])
const connectionStatuses = reactive<Record<string, ConnectionStatus>>({})
const isModalVisible = ref(false)
const isEditMode = ref(false)
const editingConnectionId = ref<string | null>(null)
const selectedTemplate = ref<ConnectorProtoTemplate | null>(null)
const newConnectionName = ref('')
const clientId = ref('')
const clientSecret = ref('')
const accessToken = ref('')

// ─── Load ─────────────────────────────────────────────────────────────────────
const loadData = async () => {
  try {
    const templatesRes = await getConnectorTemplates()
    const templatesListObj = templatesRes.toObject()
    templates.value = (templatesListObj.templatesList as unknown as ConnectorProtoTemplate[]) || []

    const connectionsRes = await getConnections()
    const connectionsListObj = connectionsRes.toObject()
    connections.value = (connectionsListObj.connectionsList as unknown as ConnectionProto[]) || []
  } catch (err) {
    console.error('Failed to load data:', err)
  }
}

const checkAllStatuses = async () => {
  for (const conn of connections.value) {
    connectionStatuses[conn.id] = 'checking'
    checkConnectionStatus(conn.id)
      .then(res => { connectionStatuses[conn.id] = res.valid ? 'valid' : 'invalid' })
      .catch(() => { connectionStatuses[conn.id] = 'invalid' })
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getTemplateIcon = (connectorId: string) => {
  const match = templates.value.find(t => t.id === connectorId)
  return match ? match.icon : 'pi pi-box'
}

const getTemplateByConnectorId = (connectorId: string): ConnectorProtoTemplate | null => {
  return templates.value.find(t => t.id === connectorId) ?? null
}

// ─── Modal: Add mode ──────────────────────────────────────────────────────────
const openConnectModal = (template: ConnectorProtoTemplate) => {
  isEditMode.value = false
  editingConnectionId.value = null
  selectedTemplate.value = template
  newConnectionName.value = `${template.name} Connection`
  clientId.value = ''
  clientSecret.value = ''
  accessToken.value = ''
  isModalVisible.value = true
}

// ─── Modal: Edit mode ─────────────────────────────────────────────────────────
const openEditModal = (conn: ConnectionProto) => {
  const template = getTemplateByConnectorId(conn.connectorid)
  if (!template) return
  isEditMode.value = true
  editingConnectionId.value = conn.id
  selectedTemplate.value = template
  newConnectionName.value = conn.name
  clientId.value = ''
  clientSecret.value = ''
  accessToken.value = ''
  isModalVisible.value = true
}

// ─── Modal: Save (contextual) ─────────────────────────────────────────────────
const handleModalSave = async () => {
  if (!selectedTemplate.value || !newConnectionName.value) return

  if (isEditMode.value && editingConnectionId.value) {
    // Save all editable fields — backend merges into existing credential blob
    try {
      await updateConnection(
        editingConnectionId.value,
        newConnectionName.value,
        clientId.value,
        clientSecret.value,
        accessToken.value
      )
      isModalVisible.value = false
      await loadData()
      // Re-check status for this connection after saving
      connectionStatuses[editingConnectionId.value] = 'checking'
      checkConnectionStatus(editingConnectionId.value)
        .then(res => { connectionStatuses[editingConnectionId.value!] = res.valid ? 'valid' : 'invalid' })
        .catch(() => { connectionStatuses[editingConnectionId.value!] = 'invalid' })
    } catch (err) {
      console.error('Failed to update connection:', err)
      alert('Failed to save: ' + err)
    }
  } else {
    initiateOAuth()
  }
}

// ─── OAuth flow ───────────────────────────────────────────────────────────────
const buildOAuthUrl = (connectionId?: string) => {
  const token = localStorage.getItem("sessionToken") || ''
  const frontendUrl = window.location.origin
  if (!selectedTemplate.value) return ''
  let url = `http://localhost:8083/api/connectors/oauth/start?connectorId=${selectedTemplate.value.id}&name=${encodeURIComponent(newConnectionName.value)}&token=${encodeURIComponent(token)}&clientId=${encodeURIComponent(clientId.value)}&clientSecret=${encodeURIComponent(clientSecret.value)}&frontendUrl=${encodeURIComponent(frontendUrl)}`
  if (connectionId) {
    url += `&connectionId=${encodeURIComponent(connectionId)}`
  }
  return url
}

const initiateOAuth = () => {
  if (!selectedTemplate.value || !newConnectionName.value) return
  isModalVisible.value = false
  window.location.href = buildOAuthUrl()
}

const handleReAuth = () => {
  if (!selectedTemplate.value || !newConnectionName.value || !editingConnectionId.value) return
  isModalVisible.value = false
  window.location.href = buildOAuthUrl(editingConnectionId.value)
}

// ─── Delete ───────────────────────────────────────────────────────────────────
const route = useRoute()
const router = useRouter()

const handleDelete = async (id: string) => {
  if (confirm('Are you sure you want to disconnect?')) {
    try {
      await deleteConnection(id)
      await loadData()
    } catch (err) {
      console.error('Failed to delete connection:', err)
    }
  }
}

// ─── Mount ────────────────────────────────────────────────────────────────────
onMounted(async () => {
  await loadData()
  // Start credential checks in the background after data is loaded
  checkAllStatuses()

  const code = route.query.code as string
  const state = route.query.state as string
  if (code && state) {
    try {
      const response = await fetch(`http://localhost:8083/api/connectors/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`)
      if (!response.ok) {
        throw new Error(await response.text())
      }
      router.replace({ query: {} })
      alert('Connection successfully added!')
      await loadData()
      checkAllStatuses()
    } catch (err) {
      console.error('Failed to authenticate connector:', err)
      alert('Failed to authenticate: ' + err)
    }
  }
})
</script>

<style scoped src="./Connectors.styles.css"></style>