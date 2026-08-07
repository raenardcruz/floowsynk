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
Run a Redis container exposed on port `6380` (as expected by the default configurations).

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

Create or update the `.env` file inside the `Server/` directory (`Server/.env`). Ensure it has the correct connection details matching the manual docker runs:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=root
DB_PASSWORD=floowsynk
DB_NAME=floowsynk

REDIS_HOST=localhost
REDIS_PORT=6380
REDIS_PASSWORD=
REDIS_DB=0

KAFKA_BROKERS=localhost:9092

# Server Ports
SERVER_GRPC_PORT=8082
SERVER_REST_PORT=8083
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
| **`DB_NAME`** | Target database name. The app automatically creates it if it does not exist. |
| **`REDIS_HOST`** | Hostname or IP of the Redis instance (`localhost` or `host.docker.internal`). |
| **`REDIS_PORT`** | Port number Redis is listening on (`6380`). |
| **`REDIS_PASSWORD`** | Authentication password for Redis (empty by default). |
| **`REDIS_DB`** | Logical database index in Redis (`0` by default). |
| **`KAFKA_BROKERS`** | Comma-separated list of Kafka broker addresses (`localhost:9092`). |
| **`SERVER_GRPC_PORT`** | Port number where the gRPC-Web wrapper server runs (`8082`). |
| **`SERVER_REST_PORT`** | Port number for the HTTP REST API server (`8083`). |
| **`SERVER_PLAIN_GRPC_PORT`** | Raw gRPC port used for internal service-to-service communication (`50051`). |
| **`JOB_TOKEN`** | Shared secret key authorizing internal background jobs (e.g. `Interval` job). |
| **`APP_ADMIN_USERNAME`** | Seed administrator account username (`admin`). |
| **`APP_ADMIN_PASSWORD`** | Seed administrator account password (`floowsynk`). |
| **`JWT_SECRET`** | Secret key used to sign and verify user JWT sessions. |
| **`CRYPTO_KEY`** | Encryption key used to encrypt/decrypt workflow sensitive details. |

---

## Running the Application

### 1. Build and Run Server
You can run the server and jobs locally or via Docker Compose.

#### Option A: Run Locally
The application and jobs automatically check for database existence, initialize tables, and create Kafka topics.

1. **Start the backend server:**
   - **Shortcut:**
     ```bash
     make server-staging       # Staging server
     # OR
     make server-production    # Production server
     ```
   - **Manual:**
     ```bash
     cd Server
     go run .
     ```

2. **Start the Kafka consumer job:**
   - **Shortcut:**
     ```bash
     make job-consumer
     ```
   - **Manual:**
     ```bash
     go run Jobs/Consumer/main.go
     ```

3. **Start the Interval processor job:**
   - **Shortcut:**
     ```bash
     make job-interval
     ```
   - **Manual:**
     ```bash
     go run Jobs/Interval/main.go
     ```

#### Option B: Build and Deploy using Docker Compose
To run the server and jobs inside a containerized environment (configured to connect to your manually run Postgres, Redis, and Kafka containers on the host machine):

- **Shortcut:**
  ```bash
  make start-docker
  ```
- **Manual:**
  ```bash
  docker compose -f docker-compose.server.yml up --build -d
  ```
This command builds and deploys:
- `floowsynk-server` (Backend server)
- `floowsynk-consumer` (Kafka replay consumer job)
- `floowsynk-interval` (Timer interval trigger job)

### 2. Run Front-end App
In another terminal, install dependencies and start the Vite development server:

- **Shortcut:**
  ```bash
  make ui-staging      # Staging UI
  # OR
  make ui-production   # Production UI
  ```
- **Manual:**
  ```bash
  cd App
  npm install
  npm run dev
  ```

---

## Environments: Staging & Production

Floowsynk supports two environment modes: **staging** and **production**.

| | Staging | Production |
|---|---|---|
| **Purpose** | Development & testing | Live data |
| **Versioning** | ✅ Full version history with 3-hour window deduplication | ❌ No versioning — always live |
| **Publish** | ✅ Can push any version to production | ❌ Read-only from staging's perspective |
| **UI** | Shows `STAGING` badge + History button on canvas | Shows pulsing `LIVE` badge |
| **DB** | Separate DB (e.g. `floowsynk`) | Separate DB (e.g. `floowsynk_prod`) |

### How Versioning Works

Every time you save a workflow in staging, a version snapshot is created.  
**3-hour window rule:** if you save again within 3 hours of the last save, the same version is updated in place — no new version is created. This prevents flooding on every keystroke save. A new version is only created once more than 3 hours have passed since the last snapshot.

### How Publishing Works

From the staging UI, open any workflow canvas → click the **History** (clock) button → choose a version (or the current live state) → click **Publish**. Floowsynk supports two publish modes:

- **Same-machine mode** (default): staging server writes directly to the production DB with `environment='production'`. No extra configuration needed.
- **Remote server mode**: staging server makes an HTTP POST to the production server's REST API. Requires `PROD_SERVER_URL` and `PROD_API_TOKEN` to be set.

---

## Running Staging & Production Simultaneously on One Machine

### Step 1 — Create the production `.env` files

**Server — create `Server/.env.production`:**

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=root
DB_PASSWORD=floowsynk
DB_NAME=floowsynk_prod       # separate DB from staging

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=1                    # separate Redis DB index

KAFKA_BROKERS=localhost:9092

# Different ports to avoid conflicts with staging
SERVER_GRPC_PORT=8084
SERVER_REST_PORT=8085
SERVER_PLAIN_GRPC_PORT=50052

# Security and Credentials
JOB_TOKEN=6c9e5318-6e7b-452d-9e22-9f35a755bcbd
APP_ADMIN_USERNAME=admin
APP_ADMIN_PASSWORD=floowsynk
JWT_SECRET=secret_key
CRYPTO_KEY=HGD86teHeCb3Gl7Q

# Environment
APP_ENVIRONMENT=production

# Token staging uses when pushing to this server
PROD_API_TOKEN=my-secret-prod-token
```

**App — create `App/.env.production`:**

```env
VITE_SERVER=http://localhost:8084
VITE_APP_ENVIRONMENT=production
```

### Step 2 — Point staging at the production server

In `Server/.env`, set:

```env
APP_ENVIRONMENT=staging

# Where to publish workflows (points to your local production server)
PROD_SERVER_URL=http://localhost:8085
PROD_API_TOKEN=my-secret-prod-token
```

> **Tip:** If you want the simplest setup, leave `PROD_SERVER_URL` blank. In that mode, publishing writes directly to the same Postgres instance using `environment='production'` as a tag — no second server needed. The app's `VITE_APP_ENVIRONMENT` controls which data is shown.

### Step 3 — Run all four processes

Open four terminal tabs:

**Terminal 1 — Staging Server** (uses `Server/.env` by default)
- **Shortcut:**
  ```bash
  make server-staging
  ```
- **Manual:**
  ```bash
  cd Server
  go run .
  # Runs on :8082 (gRPC) / :8083 (REST)
  # APP_ENVIRONMENT=staging
  ```

**Terminal 2 — Production Server** (loads `Server/.env.production` via `ENV_FILE`)
- **Shortcut:**
  ```bash
  make server-production
  ```
- **Manual:**
  ```bash
  cd Server
  ENV_FILE=.env.production go run .
  # Runs on :8084 (gRPC) / :8085 (REST)
  # APP_ENVIRONMENT=production
  ```

**Terminal 3 — Staging App** (uses `App/.env`)
- **Shortcut:**
  ```bash
  make ui-staging
  ```
- **Manual:**
  ```bash
  cd App
  npm run dev
  # Opens at http://localhost:5173
  # Shows STAGING badge
  ```

**Terminal 4 — Production App** (uses `App/.env.production`)
- **Shortcut:**
  ```bash
  make ui-production
  ```
- **Manual:**
  ```bash
  cd App
  npx vite --mode production
  # Opens at http://localhost:5174
  # Shows LIVE badge — no version history UI
  ```

### Step 4 — Publish a workflow from staging to production

1. Open the staging app at `http://localhost:5173`
2. Edit and save a workflow (versions are automatically created)
3. Open the workflow canvas → click the **History** button (clock icon, top-right)
4. In the Version History panel:
   - Click **Publish Current** to push the live state, or
   - Click **Publish** on a specific version to push that snapshot
5. Confirm the dialog
6. Open the production app at `http://localhost:5174` — the workflow now appears as live data

### Environment Variable Reference (new fields)

| Variable | File | Description |
|---|---|---|
| `APP_ENVIRONMENT` | `Server/.env` | `staging` or `production`. Controls versioning, query scoping, and publish gating. Defaults to `staging`. |
| `PROD_SERVER_URL` | `Server/.env` | Base URL of the production REST server (e.g. `http://localhost:8085`). Leave blank for same-DB publish mode. |
| `PROD_API_TOKEN` | `Server/.env` | Shared secret the staging server sends as `Authorization` header when pushing to the production server. Must match the production server's `PROD_API_TOKEN`. |
| `VITE_APP_ENVIRONMENT` | `App/.env` | `staging` or `production`. Controls environment badge visibility and whether the version history UI is shown. |
| `ENV_FILE` | shell env | Path to a custom `.env` file for the Go server. Defaults to `.env`. Use `ENV_FILE=.env.production go run .` to boot a second instance. |

---

## Running Environments with Docker

Two dedicated compose files are provided — one per environment. Each bundles the **backend server**, **Kafka consumer job**, **interval trigger job**, and the **frontend app** together.

| Compose file | Environment | Backend ports | App URL |
|---|---|---|---|
| [`docker-compose.staging.yml`](docker-compose.staging.yml) | Staging | `8082` (gRPC) / `8083` (REST) | `http://localhost:3000` |
| [`docker-compose.production.yml`](docker-compose.production.yml) | Production | `8084` (gRPC) / `8085` (REST) | `http://localhost:3001` |

> **Prerequisite:** Make sure your infrastructure containers (Postgres, Redis, Kafka) are already running. See the [Docker Containers](#prerequisite-docker-containers) section at the top of this guide.

---

### Run Staging Only

- **Shortcut:**
  ```bash
  make deploy-docker-staging
  ```
- **Manual:**
  ```bash
  docker compose -f docker-compose.staging.yml up --build -d
  ```

This starts:
- `floowsynk-server-staging` — backend on `:8082` / `:8083`
- `floowsynk-consumer-staging` — Kafka replay consumer
- `floowsynk-interval-staging` — interval workflow trigger
- `floowsynk-app-staging` — frontend at **http://localhost:3000** (shows `STAGING` badge, version history enabled)

To stop:
- **Shortcut:**
  ```bash
  make stop-docker-staging    # or make down-docker-staging
  ```
- **Manual:**
  ```bash
  docker compose -f docker-compose.staging.yml down
  ```

---

### Run Production Only

**First**, ensure `Server/.env.production` exists (see [Step 1](#step-1--create-the-production-env-files) above).

- **Shortcut:**
  ```bash
  make deploy-docker-production
  ```
- **Manual:**
  ```bash
  docker compose -f docker-compose.production.yml up --build -d
  ```

This starts:
- `floowsynk-server-production` — backend on `:8084` / `:8085`
- `floowsynk-consumer-production` — Kafka replay consumer
- `floowsynk-interval-production` — interval workflow trigger
- `floowsynk-app-production` — frontend at **http://localhost:3001** (shows pulsing `LIVE` badge, no version history UI)

To stop:
- **Shortcut:**
  ```bash
  make stop-docker-production    # or make down-docker-production
  ```
- **Manual:**
  ```bash
  docker compose -f docker-compose.production.yml down
  ```

---

### Run Both Staging and Production Simultaneously

Both compose files use different container names and port mappings so they can run side-by-side on the same machine without conflict.

**Step 1 — Ensure both `.env` files exist:**
- `Server/.env` — staging config (`APP_ENVIRONMENT=staging`, ports `8082`/`8083`)
- `Server/.env.production` — production config (`APP_ENVIRONMENT=production`, ports `8084`/`8085`)

**Step 2 — Wire staging to push to production (optional, for remote-server publish mode):**

In `Server/.env` set:
```env
PROD_SERVER_URL=http://host.docker.internal:8085
PROD_API_TOKEN=my-secret-prod-token
```

> `host.docker.internal` is used because the staging container needs to reach the production container via the host network. On Linux, this requires `extra_hosts: host.docker.internal:host-gateway` (already included in the compose files).

**Step 3 — Start both stacks:**

- **Shortcut:**
  ```bash
  make deploy-docker-staging
  make deploy-docker-production
  ```
- **Manual:**
  ```bash
  # Start staging stack
  docker compose -f docker-compose.staging.yml up --build -d

  # Start production stack
  docker compose -f docker-compose.production.yml up --build -d
  ```

**Step 4 — Access each environment:**

| Environment | App URL | What you see |
|---|---|---|
| Staging | http://localhost:3000 | `STAGING` badge, History button on canvas, full version panel |
| Production | http://localhost:3001 | Pulsing `LIVE` badge, no version UI |

**Step 5 — Publish from staging to production:**

1. Open **http://localhost:3000** (staging app)
2. Edit and save a workflow — versions are created automatically
3. Click the **History** (clock) button on the canvas toolbar
4. Choose a version → click **Publish** (or **Publish Current**)
5. Confirm — the staging container calls the production server at `host.docker.internal:8085`
6. Open **http://localhost:3001** (production app) — the workflow is now live

---

### View Logs

```bash
# Staging logs (all services)
docker compose -f docker-compose.staging.yml logs -f

# Production logs (all services)
docker compose -f docker-compose.production.yml logs -f

# Single service
docker logs floowsynk-server-staging -f
docker logs floowsynk-server-production -f
```

### Rebuild After Code Changes

```bash
# Rebuild and restart staging
docker compose -f docker-compose.staging.yml up --build -d

# Rebuild and restart production
docker compose -f docker-compose.production.yml up --build -d
```

### Stop and Clean Up

```bash
# Stop both stacks and remove containers
docker compose -f docker-compose.staging.yml down
docker compose -f docker-compose.production.yml down

# Remove images too (full clean)
docker compose -f docker-compose.staging.yml down --rmi all
docker compose -f docker-compose.production.yml down --rmi all
```

