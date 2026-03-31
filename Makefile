.PHONY: all build start-server start-ui job-interval job-consumer job-clearcache start-docker stop-docker setup

# OS Detection
UNAME_S := $(shell uname -s)
# Define directories
APP_DIR = App
SERVER_DIR = Server

build:
	@echo "🔧 Building all services..."
	@cd $(SERVER_DIR) && go build -o floowsynk_server .
	@cd $(APP_DIR) && npm run build
	@echo "✅ Build completed."

start-server:
	@echo "🚀 Starting server..."
	@cd $(SERVER_DIR) && go run .
	@echo "✅ Server is running."

start-ui:
	@echo "🚀 Starting UI..."
	@cd $(APP_DIR) && npm run dev
	@echo "✅ UI is live."

job-interval:
	@echo "🚀 Starting job interval processor..."
	@cd Jobs/Interval && go run .
	@echo "✅ Job processor started"

job-consumer:
	@echo "🚀 Starting job consumer..."
	@cd Jobs/Consumer && go run .
	@echo "✅ Job consumer started"

job-clearcache:
	@echo "🚀 Starting job cache cleaner..."
	@cd Jobs/ClearCache && go run .
	@echo "✅ Job cache cleaner started"



# Docker setup target
start-docker:
	@echo "🐳 Setting up Docker..."
	docker compose up -d
	@echo "✅ Docker containers are up and running."

stop-docker:
	@echo "🐳 Stopping Docker..."
	docker compose down -v
	@echo "✅ Docker containers stopped and cleaned up."

setup:
	@echo "🔧 Installing required dependencies..."
	@# Read JSON flags if setup.json exists
	@SKIP_DOCKER=$$(if [ -f setup.json ] && command -v jq >/dev/null 2>&1; then jq -r '.skip_docker' setup.json; else echo "false"; fi); \
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
	@echo "✅ Setup process completed."