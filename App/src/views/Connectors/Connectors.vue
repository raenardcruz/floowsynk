<template>
  <div class="connectors-container">
    <div class="header-section">
      <h1 class="page-title">Connectors</h1>

      <p class="page-subtitle">Connect external services and configure integrations using OAuth or API Keys.</p>
    </div>

    <!-- Active Connections -->
    <div class="section-card">
      <div class="section-header section-header-with-search">
        <div class="section-title-group">
          <h2 class="section-title">Active Connections</h2>
          <span class="badge" v-if="connections.length > 0">
            {{ filteredConnections.length }} / {{ connections.length }} Connected
          </span>
        </div>
        <div class="search-box" v-if="connections.length > 0">
          <i class="pi pi-search search-icon"></i>
          <input
            type="text"
            v-model="connectionSearchQuery"
            placeholder="Search connections..."
            class="search-input"
          />
          <button
            v-if="connectionSearchQuery"
            class="clear-search-btn"
            @click="connectionSearchQuery = ''"
            title="Clear search"
          >
            <i class="pi pi-times"></i>
          </button>
        </div>
      </div>

      <div v-if="connections.length === 0" class="empty-state">
        <div class="empty-icon"><i class="pi pi-share-alt"></i></div>
        <h3>No active connections</h3>
        <p>Pick a connector from the gallery below to set up your first integration.</p>
      </div>

      <div v-else-if="filteredConnections.length === 0" class="empty-state">
        <div class="empty-icon"><i class="pi pi-search"></i></div>
        <h3>No matching connections</h3>
        <p>No connections matched "{{ connectionSearchQuery }}". Try searching for another name or connector type.</p>
      </div>

      <div v-else class="connections-grid">
        <div v-for="conn in filteredConnections" :key="conn.id" class="connection-item">
          <div class="connection-meta">
            <span class="connector-icon-wrapper">
              <img v-if="getTemplateIcon(conn.connectorid) && (getTemplateIcon(conn.connectorid).startsWith('/') || getTemplateIcon(conn.connectorid).endsWith('.svg'))" :src="getTemplateIcon(conn.connectorid)" class="connector-img-icon" alt="icon" />
              <i v-else :class="getTemplateIcon(conn.connectorid)"></i>
            </span>
            <div class="connection-details">
              <div class="connection-name-row">
                <span class="connection-name">{{ conn.name }}</span>
                <span
                  v-if="conn.ismodified"
                  class="status-badge status-modified"
                  title="This connection was modified directly in Production and is out of sync with Staging"
                >
                  <i class="pi pi-sync"></i> Out of Sync
                </span>
                <!-- Credential status badge -->
                <span
                  class="status-badge"
                  :class="{
                    'status-checking': connectionStatuses[conn.id] === 'checking',
                    'status-valid':    connectionStatuses[conn.id] === 'valid',
                    'status-invalid':  connectionStatuses[conn.id] === 'invalid',
                    'status-unknown':  !connectionStatuses[conn.id],
                  }"
                  :title="connectionErrors[conn.id] || ''"
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
              <div v-if="connectionStatuses[conn.id] === 'invalid' && connectionErrors[conn.id]" class="connection-error-log">
                <i class="pi pi-exclamation-circle"></i> <span>{{ connectionErrors[conn.id] }}</span>
              </div>
            </div>
          </div>
          <div class="connection-actions">
            <button v-if="conn.ismodified" class="btn btn-warning" @click="handleRevert(conn.id)" title="Revert connection to staging copy">
              <i class="pi pi-refresh"></i> Sync/Revert
            </button>
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
      <div class="section-header section-header-with-search">
        <div class="section-title-group">
          <h2 class="section-title">Connector Gallery</h2>
          <span class="badge" v-if="templates.length > 0">
            {{ filteredTemplates.length }} / {{ templates.length }} Available
          </span>
        </div>
        <div class="search-box" v-if="templates.length > 0">
          <i class="pi pi-search search-icon"></i>
          <input
            type="text"
            v-model="gallerySearchQuery"
            placeholder="Search connector gallery..."
            class="search-input"
          />
          <button
            v-if="gallerySearchQuery"
            class="clear-search-btn"
            @click="gallerySearchQuery = ''"
            title="Clear search"
          >
            <i class="pi pi-times"></i>
          </button>
        </div>
      </div>

      <div v-if="templates.length === 0" class="empty-state">
        <div class="empty-icon"><i class="pi pi-box"></i></div>
        <h3>No connector templates available</h3>
        <p>Check back later or check your backend connection.</p>
      </div>

      <div v-else-if="filteredTemplates.length === 0" class="empty-state">
        <div class="empty-icon"><i class="pi pi-search"></i></div>
        <h3>No matching connectors</h3>
        <p>No connectors matched "{{ gallerySearchQuery }}". Try searching for another service name, description, or auth type.</p>
      </div>

      <div v-else class="templates-grid">
        <div v-for="temp in filteredTemplates" :key="temp.id" class="template-card">
          <div class="template-header">
            <span class="template-icon">
              <img v-if="temp.icon && (temp.icon.startsWith('/') || temp.icon.endsWith('.svg'))" :src="temp.icon" class="connector-img-icon" alt="icon" />
              <i v-else :class="temp.icon || 'pi pi-box'"></i>
            </span>
            <div class="auth-pills-wrapper">
              <span v-for="pill in getAuthPills(temp.authtype)" :key="pill.text" class="badge" :class="pill.badgeClass">
                {{ pill.text }}
              </span>
            </div>
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
      :saveLabel="isEditMode ? 'Save Changes' : (activeAuthTab === 'oauth2' ? 'Connect via OAuth2' : 'Save Connection')"
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
              <div class="auth-pills-wrapper mt-1">
                <span v-for="pill in getAuthPills(selectedTemplate.authtype)" :key="pill.text" class="badge" :class="pill.badgeClass">
                  {{ pill.text }}
                </span>
              </div>
            </div>
          </div>

          <!-- Auth selection tabs if connector supports multiple auth types -->
          <div v-if="getAvailableAuthTabs(selectedTemplate.authtype).length > 1" class="auth-tabs-container mt-3">
            <button
              v-for="tab in getAvailableAuthTabs(selectedTemplate.authtype)"
              :key="tab.id"
              type="button"
              class="auth-tab-btn"
              :class="{ active: activeAuthTab === tab.id }"
              @click="activeAuthTab = tab.id"
            >
              <i :class="tab.icon"></i> {{ tab.label }}
            </button>
          </div>

          <h3 class="modal-section-title"><i class="pi pi-cog"></i> Configuration</h3>
          <div class="form-group">
            <label for="connName">Connection Name</label>
            <TextInput id="connName" v-model="newConnectionName" placeholder="e.g. My Integration Connection" class="w-full mt-2" />
          </div>

          <!-- Dynamic Parameter Fields from Connector JSON filtered by activeAuthTab -->
          <div v-if="filteredFields.length > 0">
            <div v-for="field in filteredFields" :key="field.key" class="form-group mt-4">
              <label :for="field.key">
                {{ field.label }}
                <span v-if="field.required" style="color: #ff5252;">*</span>
              </label>
              <PasswordInput
                v-if="field.type === 'password'"
                :id="field.key"
                v-model="dynamicFields[field.key]"
                :placeholder="field.placeholder"
                class="w-full mt-2"
              />
              <TextInput
                v-else
                :id="field.key"
                v-model="dynamicFields[field.key]"
                :placeholder="field.placeholder"
                class="w-full mt-2"
              />
            </div>
          </div>

          <!-- Fallback OAuth Client ID / Secret fields if no fields match and active tab is OAuth2 -->
          <template v-else-if="activeAuthTab === 'oauth2'">
            <div class="form-group mt-4">
              <label for="clientId">Client ID</label>
              <TextInput id="clientId" v-model="clientId" placeholder="Enter Client ID" class="w-full mt-2" />
            </div>
            <div class="form-group mt-4">
              <label for="clientSecret">Client Secret</label>
              <PasswordInput id="clientSecret" v-model="clientSecret" placeholder="Enter Client Secret" class="w-full mt-2" />
            </div>
          </template>

          <!-- Fallback API Key / Access Token fields if no fields match and active tab is API Key / Token -->
          <template v-else>
            <div class="form-group mt-4">
              <label for="accessToken">API Key / Secret Token</label>
              <PasswordInput id="accessToken" v-model="accessToken" placeholder="Enter API Key or Token" class="w-full mt-2" />
            </div>
          </template>

          <!-- Re-authenticate button only in edit mode for OAuth2 -->
          <div v-if="isEditMode && activeAuthTab === 'oauth2'" class="reauth-section mt-4">
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
              <div
                v-for="act in getConnectorActions(selectedTemplate.id)"
                :key="act.name"
                class="action-card action-card-clickable"
                @click="openSchemaModal(act)"
                title="Click to view Input and Output Schema"
              >
                <div class="action-header">
                  <i :class="act.icon" class="action-icon"></i>
                  <span class="action-name">{{ act.name }}</span>
                  <span class="schema-pill-badge"><i class="pi pi-code"></i> Schema</span>
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

    <!-- Action Schema Popup Modal -->
    <Modal
      :visible="isSchemaModalVisible"
      :title="selectedAction ? `${selectedAction.name} — Schema` : 'Action Schema'"
      :caption="selectedAction ? `${selectedAction.method || 'API'} ${selectedAction.path || ''}` : 'Action Input and Output Specifications'"
      @update:visible="isSchemaModalVisible = $event"
      saveLabel="Close"
      @save="() => isSchemaModalVisible = false"
      width="600px"
      height="auto"
    >
      <div v-if="selectedAction" class="schema-modal-content">
        <!-- Tab selector for Input vs Output -->
        <div class="schema-tab-bar">
          <button
            type="button"
            class="schema-tab-btn"
            :class="{ active: activeSchemaTab === 'input' }"
            @click="activeSchemaTab = 'input'"
          >
            <i class="pi pi-sign-in"></i> Input Schema
          </button>
          <button
            type="button"
            class="schema-tab-btn"
            :class="{ active: activeSchemaTab === 'output' }"
            @click="activeSchemaTab = 'output'"
          >
            <i class="pi pi-sign-out"></i> Output Schema
          </button>
        </div>

        <div class="schema-code-wrapper">
          <div class="schema-code-header">
            <span class="schema-code-title">
              {{ activeSchemaTab === 'input' ? 'JSON Schema / Request Body' : 'Sample JSON Response' }}
            </span>
            <button class="btn-copy-schema" @click="copySchemaContent">
              <i :class="schemaCopied ? 'pi pi-check' : 'pi pi-copy'"></i>
              {{ schemaCopied ? 'Copied!' : 'Copy JSON' }}
            </button>
          </div>
          <pre class="schema-code-block"><code>{{ formattedSchemaJson }}</code></pre>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  getConnectorTemplates,
  getConnections,
  deleteConnection,
  checkConnectionStatus,
  createConnection,
  updateConnection,
  revertConnection,
} from './Connectors.api'
import Modal from '@/components/Composable/UI/Modal'
import { TextInput, PasswordInput } from '@/components/Composable/UI/Inputs'

interface ConnectorFieldProto {
  key: string
  label: string
  type: string
  required: boolean
  placeholder: string
}

interface ConnectorActionProto {
  id: string
  name: string
  description: string
  method: string
  path: string
  inputSchema?: any
  outputSchema?: any
}

interface ConnectorProtoTemplate {
  id: string
  name: string
  description: string
  icon: string
  baseurl: string
  authtype: string
  fields?: ConnectorFieldProto[]
  actions?: ConnectorActionProto[]
  fieldsList?: ConnectorFieldProto[]
  actionsList?: ConnectorActionProto[]
}

interface ConnectionProto {
  id: string
  name: string
  connectorid: string
  authtype: string
  createdat: string
  ismodified?: boolean
}

type ConnectionStatus = 'checking' | 'valid' | 'invalid' | 'unknown'

// ─── Action Schema Modal State ───────────────────────────────
const isSchemaModalVisible = ref(false)
const selectedAction = ref<any>(null)
const activeSchemaTab = ref<'input' | 'output'>('input')
const schemaCopied = ref(false)

const openSchemaModal = (action: any) => {
  selectedAction.value = action
  activeSchemaTab.value = 'input'
  schemaCopied.value = false
  isSchemaModalVisible.value = true
}

const formattedSchemaJson = computed(() => {
  if (!selectedAction.value) return '{}'
  const data = activeSchemaTab.value === 'input'
    ? (selectedAction.value.inputSchema || { type: 'object', properties: {} })
    : (selectedAction.value.outputSchema || { success: true })
  return JSON.stringify(data, null, 2)
})

const copySchemaContent = async () => {
  try {
    await navigator.clipboard.writeText(formattedSchemaJson.value)
    schemaCopied.value = true
    setTimeout(() => {
      schemaCopied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy schema:', err)
  }
}

const getConnectorActions = (id: string) => {
  const match = templates.value.find(t => t.id === id)
  if (!match) return []
  const actionsArr = match.actions || match.actionsList || []
  return actionsArr.map((a: any) => ({
    id: a.id,
    name: a.name,
    description: a.description,
    method: a.method,
    path: a.path,
    inputSchema: a.inputSchema,
    outputSchema: a.outputSchema,
    icon: a.method === 'POST' ? 'pi pi-plus-circle' : a.method === 'PUT' || a.method === 'PATCH' ? 'pi pi-pencil' : a.method === 'DELETE' ? 'pi pi-trash' : 'pi pi-list'
  }))
}

const getConnectorInstructions = (id: string): string => {
  const origin = window.location.origin
  const callbackUrl = `${origin}/connectors`
  switch (id) {
    case 'github':
      return `
1. Navigate to GitHub Settings > **Developer Settings** > [OAuth Apps](https://github.com/settings/developers) and click **Register a new application**.
2. Set the **Homepage URL** to \`${origin}\`.
3. Set the **Authorization callback URL** to \`${callbackUrl}\`.
4. Register the application, copy the generated **Client ID**, generate a new **Client Secret**, and paste them below.
      `
    case 'slack':
      return `
1. Go to the [Slack API Dashboard](https://api.slack.com/apps) and click **Create New App** (From scratch).
2. Navigate to **OAuth & Permissions**, add the Redirect URL \`${callbackUrl}\`, and click **Save URL**.
3. Under **Scopes** > **Bot Token Scopes**, add required scopes (\`chat:write\`, \`channels:read\`, \`users:read\`).
4. Under **Basic Information** > **App Credentials**, copy the **Client ID** and **Client Secret**, and paste them below.
      `
    case 'asana':
      return `
1. Log in to Asana and go to the [Asana Developer Console](https://app.asana.com/-/developer_console).
2. Click **+ New App** or **New access token**.
3. Set the Redirect URL to \`${callbackUrl}\`.
4. Copy the generated **Client ID** and **Client Secret** (or Personal Access Token) and paste them below.
      `
    case 'discord':
      return `
1. Open the [Discord Developer Portal](https://discord.com/developers/applications) and create a New Application.
2. Under **OAuth2**, add Redirect URI \`${callbackUrl}\`.
3. Under **Bot**, click Reset Token to generate a Bot Token or copy **Client ID** and **Client Secret** for OAuth2.
      `
    case 'gitlab':
      return `
1. Go to your GitLab User Settings > **Applications** (or Personal Access Tokens).
2. Add Redirect URI \`${callbackUrl}\` and select \`api\` and \`read_user\` scopes.
3. Save the application, copy the **Application ID** (Client ID) and **Secret**, and paste them below.
      `
    case 'google_drive':
      return `
1. Open [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials).
2. Create an **OAuth 2.0 Client ID** (Web application).
3. Add Authorized Redirect URI \`${callbackUrl}\`.
4. Copy the **Client ID** and **Client Secret** and paste them below.
      `
    case 'hubspot':
      return `
1. Go to [HubSpot Developer Account](https://developers.hubspot.com/) > Apps > Create app.
2. Under **Auth Settings**, add Redirect URL \`${callbackUrl}\`.
3. Select required CRM scopes (\`crm.objects.contacts.write\`, \`crm.objects.deals.write\`).
4. Copy **Client ID** and **Client Secret** and paste them below.
      `
    case 'jira':
      return `
1. Open [Atlassian Developer Console](https://developer.atlassian.com/console/myapps/).
2. Create an OAuth 2.0 3LO Integration app and add Callback URL \`${callbackUrl}\`.
3. Enable Jira platform REST API permissions (\`read:jira-work\`, \`write:jira-work\`).
4. Copy **Client ID** and **Client Secret** and paste them below.
      `
    case 'notion':
      return `
1. Go to [Notion Integrations](https://www.notion.so/my-integrations) and create a New Integration.
2. Configure OAuth or Internal Integration settings with Redirect URI \`${callbackUrl}\`.
3. Copy the **Client ID** and **Client Secret** (or Integration Secret) and paste them below.
      `
    case 'trello':
      return `
1. Visit the [Trello App Key Portal](https://trello.com/app-key).
2. Copy your 32-character **API Key** and generate a User API Token.
3. Paste credentials below to connect your Trello workspace.
      `
    case 'twilio':
      return `
1. Log in to [Twilio Console Dashboard](https://console.twilio.com/).
2. Copy your **Account SID** (AC...) and secret **Auth Token**.
3. Enter your Twilio credentials below to enable SMS and voice calling.
      `
    case 'sendgrid':
      return `
1. Log in to your [SendGrid Dashboard](https://app.sendgrid.com/).
2. Navigate to **Settings** > **API Keys**.
3. Click **Create API Key**, choose Full Access or Restricted Access (Mail Send), and click **Create & View**.
4. Copy the generated secret API key (\`SG.xxxxxxxx\`) and paste it below.
      `
    default:
      return ''
  }
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
const connectionSearchQuery = ref('')
const gallerySearchQuery = ref('')
const connectionStatuses = reactive<Record<string, ConnectionStatus>>({})
const connectionErrors = reactive<Record<string, string>>({})
const isModalVisible = ref(false)
const isEditMode = ref(false)
const editingConnectionId = ref<string | null>(null)
const selectedTemplate = ref<ConnectorProtoTemplate | null>(null)
const newConnectionName = ref('')
const clientId = ref('')
const clientSecret = ref('')
const accessToken = ref('')
const dynamicFields = reactive<Record<string, string>>({})
const activeAuthTab = ref<'oauth2' | 'apikey'>('oauth2')

// Filter active connections by name, connector ID, or auth type
const filteredConnections = computed(() => {
  const q = connectionSearchQuery.value.trim().toLowerCase()
  if (!q) return connections.value
  return connections.value.filter(conn => {
    return (
      (conn.name && conn.name.toLowerCase().includes(q)) ||
      (conn.connectorid && conn.connectorid.toLowerCase().includes(q)) ||
      (conn.authtype && conn.authtype.toLowerCase().includes(q))
    )
  })
})

// Filter connector gallery templates by name, description, ID, or auth type
const filteredTemplates = computed(() => {
  const q = gallerySearchQuery.value.trim().toLowerCase()
  if (!q) return templates.value
  return templates.value.filter(temp => {
    return (
      (temp.name && temp.name.toLowerCase().includes(q)) ||
      (temp.description && temp.description.toLowerCase().includes(q)) ||
      (temp.id && temp.id.toLowerCase().includes(q)) ||
      (temp.authtype && temp.authtype.toLowerCase().includes(q))
    )
  })
})

// ─── Helpers for Multi-Auth Pills & Tabs ─────────────────────────────────────
const getAuthPills = (authtypeStr?: string) => {
  if (!authtypeStr) return [{ text: 'API KEY', badgeClass: 'badge-apikey' }]
  const rawTypes = authtypeStr.toLowerCase().split(/[,/|]+/).map(s => s.trim()).filter(Boolean)
  return rawTypes.map(t => {
    if (t.includes('oauth')) {
      return { text: 'OAuth2', badgeClass: 'badge-oauth' }
    } else if (t.includes('pat')) {
      return { text: 'PAT', badgeClass: 'badge-pat' }
    } else {
      return { text: t.toUpperCase().includes('API') ? t.toUpperCase() : `${t.toUpperCase()} KEY`, badgeClass: 'badge-apikey' }
    }
  })
}

const getAvailableAuthTabs = (authtypeStr?: string): Array<{ id: 'oauth2' | 'apikey'; label: string; icon: string }> => {
  if (!authtypeStr) return [{ id: 'apikey', label: 'API Key', icon: 'pi pi-key' }]
  const rawTypes = authtypeStr.toLowerCase().split(/[,/|]+/).map(s => s.trim()).filter(Boolean)
  const tabs: Array<{ id: 'oauth2' | 'apikey'; label: string; icon: string }> = []
  
  if (rawTypes.some(t => t.includes('oauth'))) {
    tabs.push({ id: 'oauth2', label: 'OAuth2', icon: 'pi pi-lock' })
  }
  if (rawTypes.some(t => t.includes('key') || t.includes('token') || t.includes('pat') || t.includes('api') || t.includes('secret'))) {
    tabs.push({ id: 'apikey', label: 'API Key / Token', icon: 'pi pi-key' })
  }
  if (tabs.length === 0) {
    tabs.push({ id: 'oauth2', label: 'OAuth2', icon: 'pi pi-lock' })
  }
  return tabs
}

// Filter dynamic parameter fields based on selected auth tab
const filteredFields = computed(() => {
  if (!selectedTemplate.value) return []
  const fields = selectedTemplate.value.fields || selectedTemplate.value.fieldsList || []
  if (activeAuthTab.value === 'oauth2') {
    // Show fields relevant to OAuth2 (e.g. client_id, client_secret)
    return fields.filter((f: any) => {
      const key = f.key.toLowerCase()
      return key.includes('client') || key.includes('app_id') || key.includes('oauth')
    })
  } else {
    // Show fields relevant to API Key / PAT / Token (e.g. access_token, api_key, secret, token)
    return fields.filter((f: any) => {
      const key = f.key.toLowerCase()
      return key.includes('token') || key.includes('key') || key.includes('secret') || key.includes('pat') || key.includes('auth') || key.includes('sid')
    })
  }
})

// ─── Load ─────────────────────────────────────────────────────────────────────
const loadData = async () => {
  try {
    const templatesRes = await getConnectorTemplates()
    if (Array.isArray(templatesRes)) {
      templates.value = templatesRes
    } else {
      const templatesListObj = (templatesRes as any).toObject()
      templates.value = (templatesListObj.templatesList as unknown as ConnectorProtoTemplate[]) || []
    }

    const connectionsRes = await getConnections()
    const connectionsListObj = connectionsRes.toObject()
    const rawConns = (connectionsListObj.connectionsList as unknown as any[]) || []
    connections.value = rawConns.map(c => ({
      id: c.id,
      name: c.name,
      connectorid: c.connectorid || c.connectorId || '',
      authtype: c.authtype || c.authType || '',
      createdat: c.createdat || c.createdAt || '',
      ismodified: c.ismodified ?? c.isModified ?? false
    }))
  } catch (err) {
    console.error('Failed to load data:', err)
  }
}

const handleRevert = async (id: string) => {
  if (!confirm('Revert this connection to its staging copy? Any direct modifications in production will be removed.')) return
  try {
    await revertConnection(id)
    await loadData()
    alert('Connection successfully reverted to staging copy.')
  } catch (err: any) {
    alert('Failed to revert connection: ' + (err as Error).message)
  }
}

const checkAllStatuses = async () => {
  for (const conn of connections.value) {
    connectionStatuses[conn.id] = 'checking'
    connectionErrors[conn.id] = ''
    checkConnectionStatus(conn.id)
      .then(res => {
        connectionStatuses[conn.id] = res.valid ? 'valid' : 'invalid'
        connectionErrors[conn.id] = res.valid ? '' : (res.error || 'Connection verification failed')
      })
      .catch(err => {
        connectionStatuses[conn.id] = 'invalid'
        connectionErrors[conn.id] = err?.message || 'Connection check failed'
      })
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
  const availableTabs = getAvailableAuthTabs(template.authtype)
  activeAuthTab.value = availableTabs[0].id
  newConnectionName.value = `${template.name} Connection`
  clientId.value = ''
  clientSecret.value = ''
  accessToken.value = ''
  Object.keys(dynamicFields).forEach(k => delete dynamicFields[k])
  const templateFields = template.fields || template.fieldsList || []
  templateFields.forEach((f: any) => {
    dynamicFields[f.key] = ''
  })
  isModalVisible.value = true
}

// ─── Modal: Edit mode ─────────────────────────────────────────────────────────
const openEditModal = (conn: ConnectionProto) => {
  const template = getTemplateByConnectorId(conn.connectorid)
  if (!template) return
  isEditMode.value = true
  editingConnectionId.value = conn.id
  selectedTemplate.value = template
  const availableTabs = getAvailableAuthTabs(template.authtype)
  activeAuthTab.value = conn.authtype && conn.authtype.toLowerCase().includes('oauth') ? 'oauth2' : availableTabs[0].id
  newConnectionName.value = conn.name
  clientId.value = ''
  clientSecret.value = ''
  accessToken.value = ''
  Object.keys(dynamicFields).forEach(k => delete dynamicFields[k])
  const editTemplateFields = template.fields || template.fieldsList || []
  editTemplateFields.forEach((f: any) => {
    dynamicFields[f.key] = ''
  })
  isModalVisible.value = true
}

// ─── Modal: Save (contextual) ─────────────────────────────────────────────────
const handleModalSave = async () => {
  if (!selectedTemplate.value || !newConnectionName.value) return

  if (isEditMode.value && editingConnectionId.value) {
    // Save all editable fields — backend merges into existing credential blob
    try {
      const fieldsToSave: Record<string, string> = { ...dynamicFields }
      if (clientId.value) fieldsToSave['client_id'] = clientId.value
      if (clientSecret.value) fieldsToSave['client_secret'] = clientSecret.value
      if (accessToken.value) fieldsToSave['access_token'] = accessToken.value

      await updateConnection(
        editingConnectionId.value,
        newConnectionName.value,
        clientId.value,
        clientSecret.value,
        accessToken.value,
        fieldsToSave
      )
      isModalVisible.value = false
      await loadData()
      // Re-check status for this connection after saving
      connectionStatuses[editingConnectionId.value] = 'checking'
      connectionErrors[editingConnectionId.value] = ''
      checkConnectionStatus(editingConnectionId.value)
        .then(res => {
          connectionStatuses[editingConnectionId.value!] = res.valid ? 'valid' : 'invalid'
          connectionErrors[editingConnectionId.value!] = res.valid ? '' : (res.error || 'Connection verification failed')
        })
        .catch(err => {
          connectionStatuses[editingConnectionId.value!] = 'invalid'
          connectionErrors[editingConnectionId.value!] = err?.message || 'Connection check failed'
        })
    } catch (err) {
      console.error('Failed to update connection:', err)
      alert('Failed to save: ' + err)
    }
  } else {
    if (activeAuthTab.value === 'oauth2') {
      initiateOAuth()
    } else {
      try {
        const fieldsToSave: Record<string, string> = { ...dynamicFields }
        if (accessToken.value) fieldsToSave['access_token'] = accessToken.value

        const res = await createConnection(
          selectedTemplate.value.id,
          newConnectionName.value,
          activeAuthTab.value,
          fieldsToSave
        )
        isModalVisible.value = false
        await loadData()
        if (res.id) {
          connectionStatuses[res.id] = 'checking'
          connectionErrors[res.id] = ''
          checkConnectionStatus(res.id)
            .then(statusRes => {
              connectionStatuses[res.id] = statusRes.valid ? 'valid' : 'invalid'
              connectionErrors[res.id] = statusRes.valid ? '' : (statusRes.error || 'Connection verification failed')
            })
            .catch(err => {
              connectionStatuses[res.id] = 'invalid'
              connectionErrors[res.id] = err?.message || 'Connection check failed'
            })
        }
      } catch (err) {
        console.error('Failed to create connection:', err)
        alert('Failed to save connection: ' + err)
      }
    }
  }
}

// ─── OAuth flow ───────────────────────────────────────────────────────────────
const buildOAuthUrl = (connectionId?: string) => {
  const token = localStorage.getItem("sessionToken") || ''
  const frontendUrl = window.location.origin
  if (!selectedTemplate.value) return ''
  const cId = dynamicFields['client_id'] || clientId.value
  const cSec = dynamicFields['client_secret'] || clientSecret.value
  let url = `http://localhost:8083/api/connectors/oauth/start?connectorId=${selectedTemplate.value.id}&name=${encodeURIComponent(newConnectionName.value)}&token=${encodeURIComponent(token)}&clientId=${encodeURIComponent(cId)}&clientSecret=${encodeURIComponent(cSec)}&frontendUrl=${encodeURIComponent(frontendUrl)}`
  
  // Attach any extra dynamic parameters (e.g. account_sid, auth_token, bot_token, access_token, api_key)
  Object.keys(dynamicFields).forEach(key => {
    if (key !== 'client_id' && key !== 'client_secret' && dynamicFields[key]) {
      url += `&${encodeURIComponent(key)}=${encodeURIComponent(dynamicFields[key])}`
    }
  })

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