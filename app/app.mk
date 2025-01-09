.PHONY: start-ui build-ui install-ui

start-ui:
	@echo 🚀 ...  Running Front End...
	@cd $(APP_DIR) && npm run dev

build-ui:
	@echo 🔧 ...  Building Front End...
	@cd $(APP_DIR) && npm run build

install-ui:
	@echo 💾 ... Installing Front End...
	@cd $(APP_DIR) && npm install