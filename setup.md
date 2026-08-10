# Local Setup Guide

This guide explains how to set up and run Floowsynk dependencies (PostgreSQL, Redis, and Kafka) manually using Docker, and configure the Go server to run locally.

## Prerequisite: Docker Containers

Ensure Docker is installed and running on your system. Run the following commands to start the required services.

### 1. PostgreSQL
Run a PostgreSQL 15 container. You only need to launch the container; the application will automatically create the database and tables if they do not exist.

```bash
docker run -d \
  --name local-postgres \
  -p 5432:5432 \
  -e POSTGRES_USER=root \
  -e POSTGRES_PASSWORD=floowsynk \
  postgres:15
```

### 2. Redis
Run a Redis container exposed on port `6379`.

```bash
docker run -d \
  --name local-redis \
  -p 6379:6379 \
  redis:7-alpine
```

### 3. Kafka
Run a single-node Kafka instance using CP-Kafka:

```bash
docker run -d \
  --name local-kafka \
  -p 9092:9092 \
  -p 9093:9093 \
  -e KAFKA_NODE_ID=1 \
  -e KAFKA_PROCESS_ROLES=broker,controller \
  -e KAFKA_LISTENERS=PLAINTEXT://:29092,PLAINTEXT_HOST://:9092,CONTROLLER://:9093 \
  -e KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://localhost:29092,PLAINTEXT_HOST://localhost:9092 \
  -e KAFKA_LISTENER_SECURITY_PROTOCOL_MAP=PLAINTEXT:PLAINTEXT,PLAINTEXT_HOST:PLAINTEXT,CONTROLLER:PLAINTEXT \
  -e KAFKA_CONTROLLER_LISTENER_NAMES=CONTROLLER \
  -e KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR=1 \
  -e KAFKA_GROUP_INITIAL_REBALANCE_DELAY_MS=0 \
  -e KAFKA_CONTROLLER_QUORUM_VOTERS=1@localhost:9093 \
  -e CLUSTER_ID=4L6g3nShT-eMCtK--X86sw \
  confluentinc/cp-kafka:latest
```

---

## Configuration (`.env`)

Floowsynk uses a **single unified environment configuration** located at `Server/.env`. A single backend server handles both Staging and Production workloads seamlessly using separate physical database tables (`workflows_staging` vs `workflows_production`).

Create or update `Server/.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=root
DB_PASSWORD=floowsynk
DB_NAME=floowsynk

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

KAFKA_BROKERS=localhost:9092

# Server Ports
SERVER_GRPC_PORT=8090
SERVER_REST_PORT=8091
SERVER_PLAIN_GRPC_PORT=50051

# Security and Credentials
JOB_TOKEN=6c9e5318-6e7b-452d-9e22-9f35a755bcbd
APP_ADMIN_USERNAME=admin
APP_ADMIN_PASSWORD=floowsynk
JWT_SECRET=secret_key
CRYPTO_KEY=HGD86teHeCb3Gl7Q
```

### Environment Variable Explanations

| Variable | Description |
| --- | --- |
| **`DB_HOST`** | Hostname or IP of the PostgreSQL instance (`localhost` for local run, `host.docker.internal` for Docker). |
| **`DB_PORT`** | Port number PostgreSQL is listening on (`5432`). |
| **`DB_USER`** | Username used to connect to PostgreSQL (`root`). |
| **`DB_PASSWORD`** | Password used to connect to PostgreSQL (`floowsynk`). |
| **`DB_NAME`** | Target database name. |
| **`REDIS_HOST`** | Hostname or IP of the Redis instance (`localhost` or `host.docker.internal`). |
| **`REDIS_PORT`** | Port number Redis is listening on (`6379`). |
| **`REDIS_PASSWORD`** | Authentication password for Redis (empty by default). |
| **`REDIS_DB`** | Logical database index in Redis (`0` by default). |
| **`KAFKA_BROKERS`** | Comma-separated list of Kafka broker addresses (`localhost:9092`). |
| **`SERVER_GRPC_PORT`** | Port number where the gRPC-Web wrapper server runs (`8090`). |
| **`SERVER_REST_PORT`** | Port number for the HTTP REST API server (`8091`). |
| **`SERVER_PLAIN_GRPC_PORT`** | Raw gRPC port used for internal service-to-service communication (`50051`). |
| **`JOB_TOKEN`** | Shared secret key authorizing internal background jobs (e.g. `Interval` job). |
| **`APP_ADMIN_USERNAME`** | Seed administrator account username (`admin`). |
| **`APP_ADMIN_PASSWORD`** | Seed administrator account password (`floowsynk`). |
| **`JWT_SECRET`** | Secret key used to sign and verify user JWT sessions. |
| **`CRYPTO_KEY`** | Encryption key used to encrypt/decrypt sensitive workflow credentials. |

---

## Running the Application

### 1. Build and Run Unified Server
You can run the unified server and background workers locally or via Docker Compose.

#### Option A: Run Locally
The application automatically creates database tables (`workflows_staging`, `workflows_production`, etc.) and seeds initial admin users on boot.

1. **Start the unified backend server:**
   ```bash
   make start-server
   ```
   Or manually:
   ```bash
   cd Server
   go run .
   ```

2. **Start the Kafka consumer job:**
   ```bash
   make job-consumer
   ```
   Or manually:
   ```bash
   go run Jobs/Consumer/main.go
   ```

3. **Start the Interval processor job:**
   ```bash
   make job-interval
   ```
   Or manually:
   ```bash
   go run Jobs/Interval/main.go
   ```

#### Option B: Build and Deploy using Docker Compose
To run the server and jobs inside containerized services using a single Compose configuration:

```bash
make deploy-docker
```
Or manually:
```bash
docker compose up --build -d
```

This command builds and deploys:
- `floowsynk-server` (Unified Backend server listening on `:8090` / `:8091`)
- `floowsynk-consumer` (Kafka replay consumer job)
- `floowsynk-interval` (Timer interval trigger job)
- `floowsynk-app` (Frontend UI at `http://localhost:3000`)

---

### 2. Run Front-end App
Start the Vite development server:

```bash
make start-ui
```
Or manually:
```bash
cd App
npm install
npm run dev
```

---

## Unified Staging & Production Architecture

Floowsynk simplifies environment management by running both **Staging** and **Production** on a single unified server instance.

### URL Routing Structure
- **Production Endpoints**: Base URL (e.g. `http://localhost:8091/api/webhook/<workflow_id>`)
- **Staging Endpoints**: `<baseurl>/staging/<route>` (e.g. `http://localhost:8091/staging/api/webhook/<workflow_id>`)

### Header Environment Switcher
In the frontend header, use the dropdown selector to instantly toggle between **STAGING** and **PRODUCTION**. The app automatically targets the appropriate endpoints and displays environment-isolated data.

### Database Table Isolation
- **Staging tables**: `workflows_staging`, `workflow_versions_staging`, `connections_staging`, `replay_data_staging`
- **Production tables**: `workflows_production`, `workflow_versions_production`, `connections_production`, `replay_data_production`

---

## Publishing Workflows

To publish a workflow from Staging to Production:
1. Select **STAGING** in the header dropdown.
2. Edit and save your workflow.
3. Open the workflow canvas → click the **History** button (clock icon).
4. Select a version snapshot (or current live staging state) and click **Publish**.
5. The workflow snapshot is automatically promoted to `workflows_production` and `connections_production`.
6. Switch the header dropdown to **PRODUCTION** to view your published live workflow!
