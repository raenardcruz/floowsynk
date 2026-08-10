# 🌊 Floowsynk

Floowsynk is a high-performance **Workflow Automation & Orchestration Platform** designed to streamline complex business processes. It combines a powerful Go backend with a modern Vue.js frontend to provide a seamless experience for building, monitoring, and managing automated workflows.

---

## 🛠 Technology Stack

Floowsynk is built with a modern, scalable stack focusing on performance and developer experience:

### **Frontend**
- **Framework**: [Vue.js 3](https://vuejs.org/) (Composition API) — Provides a reactive, component-based UI for the workflow builder.
- **Build Tool**: [Vite](https://vitejs.dev/) — Fast development server and optimized production builds.
- **UI Library**: [PrimeVue](https://primevue.org/) — Comprehensive suite of UI components for dashboard and settings.
- **Orchestration Canvas**: [Vue Flow](https://vueflow.dev/) — Interactive graph engine for designing workflow nodes and edges.
- **Styling**: Vanilla CSS & PrimeVue Themes — Tailored, premium design system.
- **Language**: [TypeScript](https://www.typescriptlang.org/) — Type-safe frontend logic.

### **Backend**
- **Language**: [Go (Golang) 1.23+](https://go.dev/) — High-concurrency engine for executing workflow steps and managing state.
- **API (Primary)**: [gRPC](https://grpc.io/) & [gRPC-Web](https://github.com/improbable-eng/grpc-web) — Type-safe, high-performance communication between the dashboard (UI) and the backend.
- **REST Gateway**: [net/http](https://pkg.go.dev/net/http) — Specialized REST endpoints for **Webhooks**, allowing external systems to trigger workflows via standard HTTP POST.
- **Database (ORM)**: [GORM](https://gorm.io/) with **PostgreSQL 15** — Persistent storage for:
    - **Users**: Account profiles and authentication details.
    - **Workflows**: JSON-serialized workflow definitions, steps, and versions.
    - **Replay Data**: Comprehensive historical records of every workflow execution (Run History).
    - **Features**: Application-wide feature flags and configurations.
- **Caching**: [Redis](https://redis.io/) — Low-latency storage for temporary workflow states, performance caching, and session management.
- **Event Streaming**: [Apache Kafka](https://kafka.apache.org/) — Message broker used to queue workflow jobs; enables decoupled, scalable processing via the `Jobs/` workers.

---

## 🛠 Protobuf & gRPC Requirements

To modify and regenerate the API layer, you must have the **Protocol Buffer Compiler (`protoc`)** installed along with the following specific plugins:

| Requirement | Purpose |
| :--- | :--- |
| **`protoc` (v3+)** | The core protobuf compiler. |
| **`protoc-gen-go`** | Generates Go message structures from `.proto` files. |
| **`protoc-gen-go-grpc`** | Generates Go gRPC service interfaces and clients. |
| **`protoc-gen-grpc-web`** | Generates gRPC-Web client code for the TypeScript frontend. |

> [!NOTE]
> These are automatically configured when running `make setup` on macOS (via Homebrew) or Linux (via apt-get).

### **Infrastructure & DevOps**
- **Containerization**: [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)
- **Automation**: `Makefile` for streamlined local development

---

## 🏗 Project Architecture

The repository is organized into distinct, specialized components:

| Component | Description |
| :--- | :--- |
| **`App/`** | Vue 3 frontend application (Dashboard, Canvas, Tools). |
| **`Server/`** | Go backend serving gRPC and REST APIs. |
| **`Jobs/`** | Background workers (Kafka Consumers, Interval Processors, Cache Cleaners). |
| **`Broker/`** | Kafka integration and messaging logic. |
| **`Database/`** | GORM models, migrations, and database connection logic. |
| **`proto/`** | Protocol Buffer definitions for API contracts. |
| **`CodeGen/`** | Auto-generated gRPC code for both Go and TypeScript. |

---

## 🚀 Getting Started (Local Development)

Follow these steps to set up Floowsynk in your local environment.

### **1. Prerequisites**
Ensure you have the following installed:
- **Go 1.23+**
- **Node.js (v20+) & npm**
- **Docker & Docker Compose**
- **Protobuf Compiler (`protoc`)** (Automatically installed via `make setup` on macOS/Linux)

### **2. One-Click Setup**
Run the following command to install all dependencies and initialize the database containers:
```bash
make setup
```

### **3. Running the Services**

You can start the different components using separate `make` commands. It is recommended to run them in multiple terminal windows/tabs:

- **Start Infrastructure** (Postgres, Redis, Kafka):
  ```bash
  make start-docker
  ```

- **Start Backend API**:
  ```bash
  make start-server
  ```

- **Start Frontend UI**:
  ```bash
  make start-ui
  ```

- **Start Workers** (Required for workflow execution):
  ```bash
  # Start the job consumer (Kafka-driven)
  make job-consumer

  # Start the interval processor (Time-driven)
  make job-interval
  ```

---

## 🐳 Deployment & Environment Architecture

Floowsynk uses a **single unified server architecture** and a single configuration file (`Server/.env`) to run both Staging and Production workloads seamlessly:

1. **URL Routing**:
   - **Production Endpoints**: `<baseurl>/<route>` (e.g. `http://localhost:8091/api/webhook/<id>`)
   - **Staging Endpoints**: `<baseurl>/staging/<route>` (e.g. `http://localhost:8091/staging/api/webhook/<id>`)
2. **Database Isolation**:
   - Staging data is stored in `workflows_staging`, `connections_staging`, `workflow_versions_staging`, `replay_data_staging`.
   - Production data is stored in `workflows_production`, `connections_production`, `workflow_versions_production`, `replay_data_production`.
3. **Environment Switcher**:
   - The UI header features a dropdown selector to switch between STAGING and PRODUCTION instantly.

---

## ⚙️ Environment Configuration

All environment variables are managed via a single configuration file located at `Server/.env`.

> [!TIP]
> Make sure to configure your `DB_USER`, `DB_PASSWORD`, and `KAFKA_BROKERS` accordingly if you are not using the default Docker setup.

---

## 💡 Development Tips

- **Generate Protos**: If you modify `.proto` files, run `make proto` to update the generated code in both frontend and backend.
- **Troubleshooting**: If you encounter connection issues with Kafka or Postgres, verify the container status with `docker ps`.
- **Cleaning Cache**: Use `make job-clearcache` to purge internal workflow caches.

---

## 🤝 Contributing

Contributions are welcome! Please ensure that you update tests and documentation when adding new features or fixing bugs.

---

*Built with ❤️ by the Floowsynk Team.*
