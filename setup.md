# 🚀 Floowsynk Local Setup & Operations Guide

This guide covers complete instructions for installing, configuring, testing, and operating Floowsynk in your local development environment or production-like containerized deployment.

---

## 📋 1. Prerequisites

Before setting up Floowsynk, ensure you have the following installed on your host machine:

- **Go (Golang)**: `1.23+` (Go 1.26 recommended)
- **Node.js**: `v20+` & `npm`
- **Docker & Docker Compose**: Docker 24+ with Compose v2
- **Protocol Buffer Compiler (`protoc`)**:
  - Automatically installed via `make setup` on macOS (via Homebrew) or Linux (via `apt-get`).

---

## ⚡ 2. Automated One-Click Setup

The simplest way to install all dependencies, Protobuf plugins, Node packages, and launch Docker infrastructure:

```bash
make setup
```

This single command will:
1. Detect your OS (macOS or Linux) and install `protobuf`.
2. Install Go plugins: `protoc-gen-go` and `protoc-gen-go-grpc`.
3. Install frontend npm dependencies in `App/`.
4. Run `go mod tidy` for backend Go dependencies.
5. Spin up PostgreSQL 15, Redis 7, and Apache Kafka via Docker Compose.

---

## 🐳 3. Manual Container Setup (Alternative to `make setup`)

If you prefer launching containers individually, run the following:

### 3.1 PostgreSQL 15
```bash
docker run -d \
  --name local-postgres \
  -p 5432:5432 \
  -e POSTGRES_USER=root \
  -e POSTGRES_PASSWORD=floowsynk \
  postgres:15
```

### 3.2 Redis 7
```bash
docker run -d \
  --name local-redis \
  -p 6379:6379 \
  redis:7-alpine
```

### 3.3 Apache Kafka (Confluent Platform)
```bash
docker run -d \
  --name local-kafka \
  -p 9092:9092 \
  -p 29092:29092 \
  -p 9093:9093 \
  -e KAFKA_NODE_ID=1 \
  -e KAFKA_PROCESS_ROLES=broker,controller \
  -e KAFKA_LISTENERS=PLAINTEXT://:29092,PLAINTEXT_HOST://:9092,CONTROLLER://:9093 \
  -e KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://host.docker.internal:29092,PLAINTEXT_HOST://localhost:9092 \
  -e KAFKA_LISTENER_SECURITY_PROTOCOL_MAP=PLAINTEXT:PLAINTEXT,PLAINTEXT_HOST:PLAINTEXT,CONTROLLER:PLAINTEXT \
  -e KAFKA_CONTROLLER_LISTENER_NAMES=CONTROLLER \
  -e KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR=1 \
  -e KAFKA_GROUP_INITIAL_REBALANCE_DELAY_MS=0 \
  -e KAFKA_CONTROLLER_QUORUM_VOTERS=1@localhost:9093 \
  -e CLUSTER_ID=4L6g3nShT-eMCtK--X86sw \
  confluentinc/cp-kafka:latest
```

---

## ⚙️ 4. Environment Configuration (`Server/.env`)

Floowsynk uses a single unified configuration file located at `Server/.env`. Both Staging and Production workloads, the main server, and background workers share this file.

Create or update `Server/.env`:

```env
# Database Configuration (PostgreSQL 15)
DB_HOST=localhost
DB_PORT=5432
DB_USER=root
DB_PASSWORD=floowsynk
DB_NAME=floowsynk

# In-Memory Cache (Redis 7)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Message Broker (Apache Kafka)
KAFKA_BROKERS=localhost:9092

# Server Networking & Ports
SERVER_GRPC_PORT=8090
SERVER_REST_PORT=8091
SERVER_PLAIN_GRPC_PORT=50051

# Security & Secrets
JOB_TOKEN=6c9e5318-6e7b-452d-9e22-9f35a755bcbd
APP_ADMIN_USERNAME=admin
APP_ADMIN_PASSWORD=floowsynk
JWT_SECRET=secret_key
CRYPTO_KEY=HGD86teHeCb3Gl7Q
```

### Variable Reference

| Variable | Default | Purpose |
| :--- | :--- | :--- |
| `DB_HOST` | `localhost` | PostgreSQL host (`host.docker.internal` in container). |
| `DB_PORT` | `5432` | PostgreSQL port. |
| `DB_USER` / `DB_PASSWORD` | `root` / `floowsynk` | Database access credentials. |
| `DB_NAME` | `floowsynk` | Target database name (auto-migrated on startup). |
| `REDIS_HOST` / `REDIS_PORT` | `localhost:6379` | Redis instance for session state and fast caching. |
| `KAFKA_BROKERS` | `localhost:9092` | Broker address for decoupled Replay log batching. |
| `SERVER_GRPC_PORT` | `8090` | gRPC-Web port for frontend canvas communication. |
| `SERVER_REST_PORT` | `8091` | REST gateway for Webhooks, OAuth2, and `/api/mcp`. |
| `SERVER_PLAIN_GRPC_PORT` | `50051` | Plain gRPC port for internal worker jobs. |
| `JOB_TOKEN` | *UUID* | Shared authentication secret authorizing worker jobs. |
| `APP_ADMIN_USERNAME` / `_PASSWORD` | `admin` / `floowsynk` | Default initial admin account. |
| `JWT_SECRET` | *string* | Secret key for signing user session tokens. |
| `CRYPTO_KEY` | *16/32 char* | AES-GCM key encrypting stored connector credentials. |

---

## 🏃 5. Running the Application

### Option A: Running Services Locally

Start the services across separate terminal tabs:

```bash
# 1. Start Docker Infrastructure
make start-docker

# 2. Start Unified Backend Server
make start-server
# (Server listens on gRPC :8090, REST :8091, Plain gRPC :50051)

# 3. Start Frontend Development UI
make start-ui
# (App opens at http://localhost:3000)

# 4. Start Background Kafka Consumer (Replay Log Flusher)
make job-consumer

# 5. Start Scheduled Interval Job (Optional, for recurring workflows)
make job-interval
```

### Option B: Full Container Deployment via Docker Compose

To run the entire platform containerized:

```bash
make deploy-docker
```

Or manually:
```bash
docker compose up --build -d
```

Services started:
- `floowsynk-server`: Unified Go backend
- `floowsynk-consumer`: Kafka Replay consumer
- `floowsynk-interval`: Timer interval trigger runner
- `floowsynk-app`: Nginx-served frontend bundle on `http://localhost:3000`

---

## 🧪 6. Testing & Quality Verification

Run all unit and integration tests across the Go backend:
```bash
make test
```

This verifies:
- Workflow DAG execution, cycle detection, parallel diamond fan-in resolution.
- LRU template compilation caching & zero-allocation fast-paths.
- Sandboxed JavaScript Code Node (Goja VM) and execution timeout enforcement.
- Model Context Protocol (MCP) tool registrations and JSON-RPC dispatching.
- Safe HTTP Client & SSRF protection against private subnets.
- 31+ Connector template validations, credential checks, and response transformers.

Verify frontend TypeScript and Vue SFC builds:
```bash
npm --prefix App run build
```

---

## 🤖 7. Model Context Protocol (MCP) Setup

Floowsynk includes a native **Model Context Protocol (MCP)** server, enabling AI tools (such as Claude Desktop, Cursor, and Antigravity) to manage and trigger workflows autonomously.

### 7.1 Stdio Mode (Recommended for Local AI IDEs)
You can connect AI desktop clients directly to the Stdio runner without exposing network ports.

#### Claude Desktop Setup
Add the following to your `claude_desktop_config.json`:
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "floowsynk": {
      "command": "go",
      "args": ["run", "Server/mcp/cmd/main.go"],
      "cwd": "/absolute/path/to/floowsynk"
    }
  }
}
```

#### Cursor IDE Setup
In `.cursor/mcp.json`:
```json
{
  "mcpServers": {
    "floowsynk": {
      "command": "go",
      "args": ["run", "Server/mcp/cmd/main.go"],
      "cwd": "${workspaceFolder}"
    }
  }
}
```

### 7.2 HTTP JSON-RPC Mode
Alternatively, remote AI agents can send standard JSON-RPC 2.0 requests to:
```
POST http://localhost:8091/api/mcp
```

### Available MCP Tools:
- `floowsynk_list_workflows`: Discover available workflows and execution states.
- `floowsynk_get_workflow`: Inspect node layouts, connection types, and trigger parameters.
- `floowsynk_execute_workflow`: Execute a workflow synchronously with custom input arguments.
- `floowsynk_list_connectors`: Enumerate available third-party connectors and templates.

---

## 🎨 8. Canvas Features & Development Ergonomics

### 8.1 Isolated "Pin Data" Mocking
- Select any node on the canvas.
- In the right sidebar, expand the **Pinned Mock Output** panel.
- Click **Pin Data** and provide a JSON mock payload (or click **Use Last Run**).
- When running the workflow, the engine immediately yields this mock data to downstream nodes, allowing you to iterate on complex downstream logic without triggering paid APIs or side effects.

### 8.2 Sandboxed JavaScript Code Node
- Add a **Code (JavaScript)** node from Group 1 (Utility) or Group 3 (Data Transformation).
- Write custom scripts using modern JavaScript (ES5.1+).
- Access input via `$input` or `input`, workflow variables via `$vars`, and output logs via `console.log(...)`.
- Return any primitive, object, or array:
  ```javascript
  const items = Array.isArray($input) ? $input : [$input];
  return items.map(item => ({
    ...item,
    processedAt: new Date().toISOString()
  }));
  ```

### 8.3 Canvas Documentation (Sticky Notes & Visual Groups)
- Add **Sticky Notes** for architecture annotations and team to-dos.
- Add **Visual Group** boxes to visually segment microservices, integrations, and subsystem zones on the canvas.

---

## 🛡️ 9. Staging & Production Deployment Lifecycle

Floowsynk's **single unified server architecture** enforces strict database isolation between staging experiments and live production workloads:

1. **Routing**:
   - Production webhooks & triggers: `http://localhost:8091/api/webhook/<workflow_id>`
   - Staging webhooks & triggers: `http://localhost:8091/staging/api/webhook/<workflow_id>`
2. **Table Separation**:
   - `workflows_staging`, `connections_staging`, `replay_data_staging`
   - `workflows_production`, `connections_production`, `replay_data_production`
3. **Promotion Workflow**:
   - Build and test in **STAGING** mode.
   - Open the workflow canvas → click **History (Clock icon)**.
   - Select a snapshot and click **Publish**.
   - The workflow snapshot is automatically promoted to production tables.
   - Switch the top header dropdown to **PRODUCTION** to view your live deployed workflow!

---

## ❓ 10. Common Troubleshooting

| Issue | Cause | Resolution |
| :--- | :--- | :--- |
| `Failed to connect to database: dial tcp [::1]:5432: connect: connection refused` | PostgreSQL container is not running | Run `make start-docker` or verify with `docker ps`. |
| `Warning: Failed to initialize broker. Continuing without Kafka.` | Kafka container not running or starting up | Replay logging will safely fall back to synchronous direct database writes. Start Kafka via `make start-docker`. |
| `protoc: command not found` | Protobuf compiler not installed in PATH | Run `make setup` or install via `brew install protobuf` (macOS) / `apt-get install protobuf-compiler` (Linux). |
| `execution timeout: script exceeded maximum allowed execution time` | JavaScript Code node took >5s | Check your code for infinite loops or expensive recursions. |
