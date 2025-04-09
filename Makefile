.PHONY: all start build install clean proto start-jobs docker-setup
# Define directories
APP_DIR = app
SERVER_DIR = Server
PROTO_DIR = './proto'

all: start

start:
	@echo 🚀 ... Starting all services...
	@make -j2 start-ui start-server start-jobs

start-jobs:
	@echo 🚀 ... Starting job processor...
	@cd Jobs && go run interval_processor.go

build:
	@echo 🔧 ... Building all services...
	@make -j2 build-ui build-server

install: docker-setup
	@echo 💾 ... Installing all dependencies and setting up Docker...
	@make -j3 install-ui install-server

clean:
	@echo 🧹 ... Cleaning up all services...
	@make -j2 db-clean

proto:
	@echo 📦 ... Generating proto files started...
	rm -f $(SERVER_DIR)/proto/*_pb*
	rm -f $(APP_DIR)/src/proto/*_pb*
	mkdir -p $(SERVER_DIR)/proto
	mkdir -p $(APP_DIR)/src/proto
	protoc -I=$(PROTO_DIR) \
        --js_out=import_style=commonjs,binary:./$(APP_DIR)/src/proto \
        --grpc-web_out=import_style=commonjs+dts,mode=grpcwebtext:./$(APP_DIR)/src/proto \
        --go_out=./$(SERVER_DIR)/proto \
        --go_opt=paths=source_relative \
        --go-grpc_out=./$(SERVER_DIR)/proto \
        --go-grpc_opt=paths=source_relative \
        --experimental_allow_proto3_optional floowsynk.proto
	rm -rf $(APP_DIR)/node_modules
	cd $(APP_DIR) && npm install -D ./src/proto && npm install
	cd ..
	cd ${SERVER_DIR} && go mod tidy
	cd ..
	@echo 📦 ... Generating proto files Completed...

# Docker setup target
docker-setup:
	@echo 🐳 ... Setting up Docker...
	docker-compose up -d

include $(APP_DIR)/app.mk
include $(SERVER_DIR)/server.mk
include $(SERVER_DIR)/db/db.mk