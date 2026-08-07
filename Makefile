# ==============================================================================
# Configuration & Variables
# ==============================================================================

# OS Detection
UNAME_S := $(shell uname -s)

# Directories & Path Configurations
APP_DIR        = App
SERVER_DIR     = Server
PROTO_DIR      = './proto'
PROTO_FILES    = workflow login
PROTO_GEN_DIR  = './CodeGen'

# Declare all phony targets to prevent collision with files of the same name
.PHONY: all setup proto build \
        start-server server-staging server-production \
        start-ui ui-staging ui-production \
        job-interval job-consumer job-clearcache \
        deploy-docker-staging deploy-docker-production \
        stop-docker-staging stop-docker-production \
        down-docker-staging down-docker-production

# Default target
all: build

# ==============================================================================
# Environment Setup & Dependency Installation
# ==============================================================================

# System setup: Installs required tools (Protobuf, protoc plugins, Node dependencies, Go modules, Docker)
# Supports setup.json flags to skip specific steps if defined.
setup:
	@echo "🔧 Installing required dependencies..."
	@# Read JSON flags if setup.json exists
	@SKIP_DOCKER=$$(if [ -f setup.json ] && command -v jq >/dev/null 2>&1; then jq -r '.skip_docker' setup.json; else echo "false"; fi); \
	SKIP_PROTOBUF=$$(if [ -f setup.json ] && command -v jq >/dev/null 2>&1; then jq -r '.skip_protobuf' setup.json; else echo "false"; fi); \
	SKIP_NPM=$$(if [ -f setup.json ] && command -v jq >/dev/null 2>&1; then jq -r '.skip_npm' setup.json; else echo "false"; fi); \
	SKIP_GO=$$(if [ -f setup.json ] && command -v jq >/dev/null 2>&1; then jq -r '.skip_go' setup.json; else echo "false"; fi); \
	if [ "$$SKIP_PROTOBUF" != "true" ]; then \
		if [ "$(UNAME_S)" = "Darwin" ]; then \
			if ! command -v brew >/dev/null 2>&1; then \
				echo "❌ Homebrew not found. Please install it first: https://brew.sh/"; \
				exit 1; \
			fi; \
			echo "🍎 macOS detected. Using Homebrew for Protobuf..."; \
			brew update && brew install protobuf; \
		elif [ "$(UNAME_S)" = "Linux" ]; then \
			echo "🐧 Linux detected. Using apt-get for Protobuf..."; \
			sudo apt-get update && sudo apt-get install -y protobuf-compiler; \
		else \
			echo "❌ Unsupported OS: $(UNAME_S)"; \
			exit 1; \
		fi; \
		echo "📦 Installing protoc-gen-go and protoc-gen-go-grpc..."; \
		go install google.golang.org/protobuf/cmd/protoc-gen-go@latest; \
		go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest; \
	else \
		echo "⏩ Skipping Protobuf installation as requested."; \
	fi; \
	if [ "$$SKIP_NPM" != "true" ]; then \
		echo "🔧 Installing Node.js dependencies..."; \
		cd App && npm install; \
	else \
		echo "⏩ Skipping Node.js dependencies installation as requested."; \
	fi; \
	if [ "$$SKIP_GO" != "true" ]; then \
		echo "🔧 Installing Go modules..."; \
		go mod tidy; \
	else \
		echo "⏩ Skipping Go modules installation as requested."; \
	fi; \
	if [ "$$SKIP_DOCKER" != "true" ]; then \
		echo "🐳 Setting up Docker..."; \
		docker compose up -d; \
	else \
		echo "⏩ Skipping Docker setup as requested."; \
	fi
	@protoc --version
	@echo "✅ Setup process completed."

# ==============================================================================
# Build & Code Generation
# ==============================================================================

# Generate gRPC and Protobuf files for Go and Web/UI
proto:
	@echo "📦 Generating proto files started..."
	rm -f $(PROTO_GEN_DIR)/go/*/*_pb*
	rm -f $(PROTO_GEN_DIR)/ui/*/*_pb*
	mkdir -p $(PROTO_GEN_DIR)/go
	mkdir -p $(PROTO_GEN_DIR)/ui
	@for F in $(PROTO_FILES); do \
		echo "📦 Generating proto file $$F...$(DIR)"; \
		mkdir -p $(PROTO_GEN_DIR)/go/$$F;\
		mkdir -p $(PROTO_GEN_DIR)/ui/$$F; \
		protoc -I=$(PROTO_DIR) \
			--js_out=import_style=commonjs,binary:$(PROTO_GEN_DIR)/ui/$$F \
			--grpc-web_out=import_style=commonjs+dts,mode=grpcwebtext:$(PROTO_GEN_DIR)/ui/$$F \
			--go_out=$(PROTO_GEN_DIR)/go/$$F \
			--go_opt=paths=source_relative \
			--go-grpc_out=$(PROTO_GEN_DIR)/go/$$F \
			--go-grpc_opt=paths=source_relative \
			--experimental_allow_proto3_optional $$F.proto; \
	done
	rm -rf $(APP_DIR)/node_modules
	cd $(APP_DIR) && npm install -D ../CodeGen/ui && npm install
	cd ..
	cd ./ && go mod tidy
	cd ..
	@echo "✅ Proto files generated successfully."

# Build both Go backend binary and React/Vite frontend bundle
build:
	@echo "🔧 Building all services..."
	@cd $(SERVER_DIR) && go build -o floowsynk_server .
	@cd $(APP_DIR) && npm run build
	@echo "✅ Build completed."

# ==============================================================================
# Backend Server Commands
# ==============================================================================

# Run backend server locally (Development)
start-server:
	@echo "🚀 Starting server..."
	@cd $(SERVER_DIR) && go run .
	@echo "✅ Server is running."

# Run backend server in Staging environment mode
server-staging:
	@echo "🚀 Starting Staging server..."
	@cd $(SERVER_DIR) && go run .
	@echo "✅ Staging Server is running."

# Run backend server in Production environment mode
server-production:
	@echo "🚀 Starting Production server..."
	@cd $(SERVER_DIR) && ENV_FILE=.env.production go run .
	@echo "✅ Production Server is running."

# ==============================================================================
# Frontend UI Commands
# ==============================================================================

# Run Vite dev server for frontend UI (Development)
start-ui:
	@echo "🚀 Starting UI..."
	@cd $(APP_DIR) && npm run dev
	@echo "✅ UI is live."

# Run frontend UI in Staging environment mode
ui-staging:
	@echo "🚀 Starting Staging UI..."
	@cd $(APP_DIR) && npm run dev
	@echo "✅ Staging UI is live."

# Run frontend UI preview/serve in Production environment mode
ui-production:
	@echo "🚀 Starting Production UI..."
	@cd $(APP_DIR) && npx vite --mode production
	@echo "✅ Production UI is live."

# ==============================================================================
# Background Job Processors
# ==============================================================================

# Run the interval-based job processor
job-interval:
	@echo "🚀 Starting job interval processor..."
	@cd Jobs/Interval && go run .
	@echo "✅ Job processor started"

# Run the queue job consumer service
job-consumer:
	@echo "🚀 Starting job consumer..."
	@cd Jobs/Consumer && go run .
	@echo "✅ Job consumer started"

# Run the job cache cleaner service
job-clearcache:
	@echo "🚀 Starting job cache cleaner..."
	@cd Jobs/ClearCache && go run .
	@echo "✅ Job cache cleaner started"

# ==============================================================================
# Docker & Container Deployment Commands
# ==============================================================================

# Deploy staging containers using Docker Compose
deploy-docker-staging:
	@echo "🐳 Deploying Staging environment via Docker..."
	docker compose -f docker-compose.staging.yml up --build -d
	@echo "✅ Staging environment deployed."

# Deploy production containers using Docker Compose
deploy-docker-production:
	@echo "🐳 Deploying Production environment via Docker..."
	docker compose -f docker-compose.production.yml up --build -d
	@echo "✅ Production environment deployed."

# Stop staging Docker containers
stop-docker-staging:
	@echo "🐳 Stopping Staging environment Docker containers..."
	docker compose -f docker-compose.staging.yml down
	@echo "✅ Staging Docker containers stopped."

# Stop production Docker containers
stop-docker-production:
	@echo "🐳 Stopping Production environment Docker containers..."
	docker compose -f docker-compose.production.yml down
	@echo "✅ Production Docker containers stopped."

# Aliases for stopping docker containers
down-docker-staging: stop-docker-staging
down-docker-production: stop-docker-production