# FloowSynk Product Overview

FloowSynk is a workflow management platform designed to streamline and automate business processes. It provides a user-friendly interface for creating, managing, and monitoring workflows with integration capabilities for external services.

## Core Features
- Visual workflow builder with drag-and-drop interface
- Real-time workflow execution and monitoring
- Integration with external services via webhooks and APIs
- User authentication and authorization
- Workflow history and replay functionality
- Background job processing for scalable execution

## Architecture
- Frontend: Vue.js SPA with TypeScript
- Backend: Go microservices with gRPC/REST APIs
- Database: PostgreSQL with GORM ORM
- Message Queue: Apache Kafka for job processing
- Cache: Redis for session and temporary data storage
- Protocol: gRPC with Protocol Buffers for service communication