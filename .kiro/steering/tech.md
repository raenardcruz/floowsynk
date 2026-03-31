# Technology Stack & Build System

## Frontend Stack
- **Framework**: Vue.js 3 with Composition API
- **Language**: TypeScript
- **Build Tool**: Vite
- **UI Library**: PrimeVue with custom components
- **State Management**: Vue 3 reactivity system
- **Routing**: Vue Router 4
- **Editor**: Monaco Editor for code editing
- **Flow Diagrams**: Vue Flow for workflow visualization
- **HTTP Client**: Axios
- **gRPC**: grpc-web for browser-server communication

## Backend Stack
- **Language**: Go 1.23+
- **Framework**: Standard library with gRPC
- **Database**: PostgreSQL with GORM ORM
- **Cache**: Redis
- **Message Queue**: Apache Kafka (Sarama client)
- **Authentication**: JWT tokens
- **Protocol**: gRPC with Protocol Buffers
- **Web Server**: grpc-web wrapper for HTTP/gRPC bridge

## Infrastructure
- **Containerization**: Docker & Docker Compose
- **Database**: PostgreSQL 15
- **Cache**: Redis (latest)
- **Message Broker**: Confluent Kafka

## Common Commands

### Setup & Dependencies
```bash
make setup          # Install all dependencies and setup environment
make proto          # Generate Protocol Buffer files for Go and TypeScript
```

### Development
```bash
make start-server   # Start Go backend server (port 8080)
make start-ui       # Start Vue.js frontend (port 3000)
make job-interval   # Start interval job processor
make job-consumer   # Start Kafka consumer job processor
```

### Docker
```bash
make start-docker   # Start all Docker services (PostgreSQL, Redis, Kafka)
make stop-docker    # Stop and clean up Docker containers
```

### Build
```bash
make build          # Build both frontend and backend for production
```

## Development Ports
- Frontend: http://localhost:3000
- Backend gRPC-Web: http://localhost:8080
- Backend REST API: http://localhost:8081
- Plain gRPC: localhost:50051
- PostgreSQL: localhost:5432
- Redis: localhost:6379
- Kafka: localhost:9092