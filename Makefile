.PHONY: all build start-server start-ui job-interval job-consumer job-clearcache proto start-docker stop-docker setup
# Define directories
APP_DIR = App
SERVER_DIR = Server
PROTO_DIR = './proto'
PROTO_FILES = workflow login
PROTO_GEN_DIR = './CodeGen'

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
	@echo 🔧 ... Installing required dependencies...
	# Install protoc
	@sudo apt-get update && sudo apt-get install -y protobuf-compiler
	# Install protoc-gen-go and protoc-gen-go-grpc
	@go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
	@go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest
	# Install Node.js dependencies
	@echo 🔧 ... Installing Node.js dependencies...
	@cd app && npm install
	# Install Go modules
	@echo 🔧 ... Installing Go modules...
	@go mod tidy
	# Docker setup
	@echo 🐳 ... Setting up Docker...
	docker-compose up -d
	# Verify installations
	@protoc --version
	@echo 🔧 ... All dependencies installed successfully.