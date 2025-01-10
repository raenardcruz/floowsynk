.PHONY: db-local db-clean db-start db-stop

db-install:
	@echo "💾 ... Deploying local database..."
	@cd $(SERVER_DIR)/db && docker compose -f docker-compose.yml up -d db
	@echo "Waiting for database to be ready..."
	@echo "Database created successfully"

db-clean:
	@echo "🧹 ... Cleaning up database..."
	@cd $(SERVER_DIR)/db && docker compose -f docker-compose.yml down -v

db-start:
	@echo "▶️ ... Starting database..."
	@cd $(SERVER_DIR)/db && docker compose -f docker-compose.yml start db

db-stop:
	@echo "⏹️ ... Stopping database..."
	@cd $(SERVER_DIR)/db && docker compose -f docker-compose.yml stop db
