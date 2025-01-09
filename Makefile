.PHONY: all start build install clean
# Define directories
APP_DIR = app
SERVER_DIR = Server

all: start

start:
	@echo 🚀 ... Starting all services...
	@make -j2 start-ui start-server

build:
	@echo 🔧 ... Building all services...
	@make -j2 build-ui build-server

install:
	@echo 💾 ... Installing all services...
	@make -j2 install-ui install- db-install

clean:
	@echo 🧹 ... Cleaning up all services...
	@make -j2 db-clean

include $(APP_DIR)/app.mk
include $(SERVER_DIR)/server.mk
include $(SERVER_DIR)/db/db.mk