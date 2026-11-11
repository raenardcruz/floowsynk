# 🌊 Floowsynk

**Floowsynk** is a high-performance **Workflow Automation & Orchestration Platform** built for mission-critical business automation, data pipelines, and AI agent integration. Powered by an ultra-fast Go engine and an intuitive Vue 3 canvas, Floowsynk delivers enterprise-grade scalability, isolated staging-to-production lifecycle management, sandboxed scripting, and native AI integration via the Model Context Protocol (MCP).

---

## ⚡ Highlights & Key Features

- **🚀 High-Throughput DAG Execution Engine**:
  - Zero-allocation template parsing fast-path and thread-safe LRU template compilation cache.
  - Asynchronous Kafka batch logging (`500-item flusher`), eliminating database and Redis write bottlenecks during high-concurrency spikes.
  - Cycle detection & recursion guards (`MaxStepLimit`), automatic parallel diamond fan-in resolution (`isJoinReady`), and 10MB variable payload size caps.
  - Built-in SSRF protection blocking access to private and metadata IP subnets (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `127.0.0.0/8`, `169.254.0.0/16`).

- **🎨 Modern Workflow Canvas & UX Ergonomics**:
  - **Pin Data**: Freeze intermediate node outputs directly in the sidebar to simulate downstream steps without triggering live third-party APIs or consuming credits.
  - **Sticky Notes & Visual Groups**: Organize canvas architecture with color-coded markdown notes and bounding group containers.
  - **Drag-and-Drop Variable Pills**: Draggable and fuzzy-searchable workflow variables for fast reference insertion into templates and expressions.

- **💻 Sandboxed JavaScript Code Node (Goja VM)**:
  - Secure in-process ECMAScript 5.1+ execution with access to `$input`, `$vars`, `console.log`, and top-level `return` expressions.
  - Strict 5-second execution timeout guard preventing infinite loops (`while(true) {}`) from stalling the engine.

- **🤖 Model Context Protocol (MCP) Server**:
  - Native JSON-RPC 2.0 MCP server allowing AI assistants (Claude Desktop, Cursor, Antigravity, custom LLM agents) to discover, inspect, and trigger workflows.
  - Dual access: HTTP endpoint at `/api/mcp` and Stdio CLI runner (`make mcp-stdio`).

- **🔌 31+ Out-of-the-Box Integrations**:
  - **Modern Stack & AI**: Linear, Supabase, Resend, Sentry, Pinecone, Anthropic (Claude), OpenAI, Google Gemini, RAG Vector Search.
  - **Enterprise & SaaS**: GitHub, GitLab, Slack, Discord, Notion, Jira, Asana, ClickUp, HubSpot, Salesforce, Stripe, Twilio, SendGrid, Google Drive, Google Sheets, Google Calendar, Airtable, PostgreSQL, MongoDB, and more.

- **🛡️ Single-Server Staging & Production Isolation**:
  - Complete data isolation in a single running server instance via physical table separation (`_staging` vs `_production`) and dynamic URL routing (`/staging/*` vs `/*`).
  - One-click workflow promotion and instant rollbacks with version history snapshots.

---

## 🛠 Technology Stack

### **Frontend**
- **Framework**: [Vue.js 3](https://vuejs.org/) (Composition API, `<script setup>`)
- **Build Tool**: [Vite](https://vitejs.dev/) with TypeScript
- **UI Components**: [PrimeVue](https://primevue.org/) tailored design system
- **Canvas Engine**: [Vue Flow](https://vueflow.dev/) for interactive node graphs
- **Code Editor**: [Monaco Editor](https://microsoft.github.io/monaco-editor/) for JavaScript and template authoring

### **Backend**
- **Language**: [Go (Golang) 1.23+ / 1.26](https://go.dev/)
- **Primary API**: [gRPC](https://grpc.io/) & [gRPC-Web](https://github.com/improbable-eng/grpc-web)
- **REST Gateway**: Webhook receiver, cURL exporter, OAuth2 flow handlers, and `/api/mcp`
- **Scripting Sandbox**: [Goja](https://github.com/dop251/goja) ECMAScript runtime
- **Database (ORM)**: [GORM](https://gorm.io/) with **PostgreSQL 15**
- **Cache**: [Redis 7](https://redis.io/)
- **Streaming & Log Ingestion**: [Apache Kafka](https://kafka.apache.org/)

---

## 🏗 Project Architecture

```
floowsynk/
├── App/                 # Vue 3 + Vite frontend application
│   └── src/views/Workflow/
│       ├── Canvas/      # Vue Flow interactive canvas & controls
│       ├── Nodes/       # Node definitions, sticky notes, visual groups
│       └── Sidebar/     # Node field editors, Pin Data, variable pill bar
├── Server/              # Unified Go backend server
│   ├── workflow/        # Graph engine, node processors, connectors & templates
│   ├── mcp/             # Model Context Protocol (MCP) JSON-RPC 2.0 server & CLI
│   ├── connectors/      # Connector JSON templates & auth schemas
│   ├── matheval/        # Safe arithmetic and boolean expression evaluator
│   └── crypto/          # AES encryption for stored third-party credentials
├── Jobs/                # Asynchronous background workers
│   ├── Consumer/        # Kafka consumer for batched replay data insertion
│   ├── Interval/        # Schedule interval trigger processor
│   └── ClearCache/      # Internal workflow cache cleaner
├── Broker/              # Apache Kafka producer & topic definitions
├── Database/            # PostgreSQL GORM models, migrations, and seeding
├── proto/               # Protocol Buffer definitions (workflow.proto, login.proto)
└── CodeGen/             # Generated gRPC code (Go & TypeScript)
```

---

## 🧩 Node Catalog

| Category | Node Types | Purpose |
| :--- | :--- | :--- |
| **Triggers & Input** | `webhook`, `interval`, `rag` | Receive external HTTP webhooks, run cron/intervals, query RAG vector knowledge bases |
| **Logic & Control** | `condition`, `while`, `loop`, `foreach`, `subprocess` | Dynamic branching, iterative processing, child workflow delegation |
| **Data Transformation** | `setVariable`, `text`, `math`, `map`, `replace`, `findAll`, `count`, `getGuid` | Transform payloads, evaluate expressions, extract regex patterns, generate UUIDs |
| **Custom Scripting** | `code` (JavaScript) | Sandboxed JavaScript computation with `$input`, `$vars`, and timeout protection |
| **Connectivity** | `api`, `connector` (31+ services) | REST API requests and native pre-authenticated connectors |
| **Canvas & Notes** | `stickyNote`, `visualGroup` | Workflow documentation, color notes, and bounding subsystem containers |
| **Output & Visualization** | `response`, `log` | Webhook HTTP responses and live replay audit logs |

---

## 🤖 Model Context Protocol (MCP) Integration

Floowsynk exposes its workflow orchestration engine to external AI agents via the standard [Model Context Protocol (MCP)](https://modelcontextprotocol.io/).

### Supported MCP Tools
1. `floowsynk_list_workflows`: List workflows with node counts, status, and environment.
2. `floowsynk_get_workflow`: Inspect node structure, parameters, and triggers by workflow ID.
3. `floowsynk_execute_workflow`: Trigger workflow execution with a custom JSON input payload.
4. `floowsynk_list_connectors`: Discover active connectors and action templates.

### Connecting Claude Desktop or Cursor (Stdio Mode)
Add the following to your MCP client configuration (e.g. `claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "floowsynk": {
      "command": "go",
      "args": ["run", "Server/mcp/cmd/main.go"],
      "cwd": "/path/to/floowsynk"
    }
  }
}
```

Or connect via the HTTP JSON-RPC endpoint at:
`http://localhost:8091/api/mcp`

---

## 🚀 Getting Started (Local Development)

### 1. Prerequisites
- **Go 1.23+**
- **Node.js (v20+) & npm**
- **Docker & Docker Compose**
- **Protobuf Compiler (`protoc`)** (installed automatically via `make setup`)

### 2. Quick Setup
Run the unified setup command to configure dependencies, install protoc plugins, and spin up Docker containers:
```bash
make setup
```

### 3. Launching Services
Run the following in separate terminal tabs:

```bash
# 1. Start Docker dependencies (PostgreSQL, Redis, Kafka)
make start-docker

# 2. Start the unified Go backend (gRPC :8090, REST :8091, Plain gRPC :50051)
make start-server

# 3. Start the frontend UI (Vite dev server at http://localhost:3000)
make start-ui

# 4. Start the Kafka background log consumer
make job-consumer

# 5. Start the Interval job runner (optional for scheduled workflows)
make job-interval
```

### 4. Running Test Suites
Run all backend test suites (workflows, template caching, Goja sandbox, MCP server, connectors, math eval):
```bash
make test
```

Build and test frontend TypeScript/Vue compilation:
```bash
npm --prefix App run build
```

---

## 🐳 Unified Staging & Production Architecture

Floowsynk operates a **single unified server architecture** configured through `Server/.env`:

1. **Routing**:
   - Production routes: `http://localhost:8091/api/webhook/<workflow_id>`
   - Staging routes: `http://localhost:8091/staging/api/webhook/<workflow_id>`
2. **Database Isolation**:
   - Staging tables: `workflows_staging`, `connections_staging`, `replay_data_staging`
   - Production tables: `workflows_production`, `connections_production`, `replay_data_production`
3. **Publishing**:
   - Build and test workflows in **STAGING** mode.
   - Use the **History (Clock)** modal to create snapshots and click **Publish** to promote the workflow to live production.

---

## 🤝 Contributing

Contributions are welcome! Please ensure all Go unit tests (`make test`) and frontend builds (`npm --prefix App run build`) pass before opening a pull request.

---

*Built with ❤️ by the Floowsynk Team.*
