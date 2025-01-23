.PHONY: start-server build-server install-server

start-server:
	@echo 🚀 ...  Running Back End...
	@cd $(SERVER_DIR) && go run .

build-server:
	@echo 🔧 ...  Building Back End...
	@cd $(SERVER_DIR) && go build .

install-server:
	@echo 💾 ... Installing Back End...
	@cd $(SERVER_DIR) && go mod tidy