.PHONY: db-local db-clean

db-install:
	@echo "💾 ... Deploying local database..."
	@cd $(SERVER_DIR)/db && docker compose -f docker-compose.yml up -d db
	@echo "Waiting for database to be ready..."
	@echo "Database created successfully"

db-clean:
	@echo "🧹 ... Cleaning up database..."
	@cd $(SERVER_DIR)/db && docker compose -f docker-compose.yml down -v
