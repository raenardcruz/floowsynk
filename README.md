# 🌊 Floowsynk

Floowsynk is a high-performance **Workflow Automation & Orchestration Platform** designed to streamline complex business processes. It combines a powerful Go backend with a modern Vue.js frontend to provide a seamless experience for building, monitoring, and managing automated workflows.

---

## 🛠 Technology Stack

Floowsynk is built with a modern, scalable stack focusing on performance and developer experience:

### **Frontend**
- **Framework**: [Vue.js 3](https://vuejs.org/) (Composition API)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **UI Library**: [PrimeVue](https://primevue.org/)
- **Orchestration Canvas**: [Vue Flow](https://vueflow.dev/)
- **Styling**: Vanilla CSS & PrimeVue Themes
- **Language**: [TypeScript](https://www.typescriptlang.org/)

### **Backend**
- **Language**: [Go (Golang) 1.23+](https://go.dev/)
- **Primary API**: [gRPC](https://grpc.io/) & [gRPC-Web](https://github.com/improbable-eng/grpc-web)
- **REST Gateway**: [net/http](https://pkg.go.dev/net/http) (Webhook support)
- **Database (ORM)**: [GORM](https://gorm.io/) with **PostgreSQL 15**
- **Caching**: [Redis](https://redis.io/)
- **Event Streaming**: [Apache Kafka](https://kafka.apache.org/)

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

## 🐳 Deployment (Docker Compose)

For a production-like environment or a quick deployment, you can run the entire stack using Docker Compose:

1. **Build and Start**:
   ```bash
   docker compose up --build -d
   ```

2. **Accessing the App**:
   - **Frontend UI**: [http://localhost:3000](http://localhost:3000)
   - **REST API**: [http://localhost:8082](http://localhost:8082)
   - **gRPC API**: [http://localhost:8083](http://localhost:8083)

3. **Stop & Cleanup**:
   ```bash
   docker compose down -v
   ```

---

## ⚙️ Environment Configuration

Environment variables are managed via `.env` files located in the `Server/` directory.

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
