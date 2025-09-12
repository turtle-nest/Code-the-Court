# ------------------------------
# SocioJustice / Code the Court
# Root Makefile
# ------------------------------

# Paths (override with: make <target> FRONTEND_DIR=webapp BACKEND_DIR=api)
FRONTEND_DIR ?= frontend
BACKEND_DIR  ?= backend

# Tools (override if needed: make <target> NPM=yarn)
NPM            ?= npm
DOCKER_COMPOSE ?= docker compose

# Healthcheck URL for the API
HEALTH_URL ?= http://localhost:3000/health

# Make defaults
.SILENT:
.DEFAULT_GOAL := help
MAKEFLAGS += --no-builtin-rules --warn-undefined-variables
.SHELLFLAGS := -eu -o pipefail -c

# Declare phony targets
.PHONY: help install dev build start test lint format clean \
		docker-up docker-down docker-logs docker-ps health check-tools

## Show this help
help:
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make <target>\n\nTargets:\n"} \
	/^[a-zA-Z0-9_-]+:.*?##/ { printf "  %-18s %s\n", $$1, $$2 } ' $(MAKEFILE_LIST)

## Verify required tools (node, npm, docker)
check-tools:
	@command -v node  >/dev/null || { echo "❌ node not found"; exit 1; }
	@command -v $(NPM) >/dev/null || { echo "❌ $(NPM) not found"; exit 1; }
	@command -v docker >/dev/null || { echo "ℹ️ docker not found (ok if you skip docker targets)"; exit 0; }
	@docker compose version >/dev/null 2>&1 || { echo "ℹ️ 'docker compose' not available"; exit 0; }
	echo "✅ Tools OK"

## Install deps (backend + frontend)
install:
	@echo "📦 Installing backend deps..."
	@$(NPM) --prefix $(BACKEND_DIR) ci 2>/dev/null || $(NPM) --prefix $(BACKEND_DIR) install
	@echo "📦 Installing frontend deps..."
	@$(NPM) --prefix $(FRONTEND_DIR) ci 2>/dev/null || $(NPM) --prefix $(FRONTEND_DIR) install
	echo "✅ Install done"

## Dev mode: run backend + frontend concurrently (Ctrl+C to stop)
dev:
	@echo "🚀 Starting dev servers (backend + frontend)..."
	@$(NPM) --prefix $(BACKEND_DIR) run dev & \
	$(NPM) --prefix $(FRONTEND_DIR) run dev & \
	wait

## Build frontend (and backend if applicable)
build:
	@echo "🏗️ Building frontend..."
	@$(NPM) --prefix $(FRONTEND_DIR) run build
	@echo "🏗️ Building backend (if script exists)..."
	@$(NPM) --prefix $(BACKEND_DIR) run build || true
	echo "✅ Build done"

## Start production mode (API + frontend preview if Vite)
start:
	@echo "▶️ Starting backend..."
	@$(NPM) --prefix $(BACKEND_DIR) start & \
	echo "▶️ Starting frontend preview..." && \
	$(NPM) --prefix $(FRONTEND_DIR) run preview & \
	wait

## Run tests (both sides, if scripts exist)
test:
	@$(NPM) --prefix $(BACKEND_DIR) test || true
	@$(NPM) --prefix $(FRONTEND_DIR) test || true

## Lint (if scripts exist)
lint:
	@$(NPM) --prefix $(BACKEND_DIR) run lint || true
	@$(NPM) --prefix $(FRONTEND_DIR) run lint || true

## Format code (if scripts exist)
format:
	@$(NPM) --prefix $(BACKEND_DIR) run format || true
	@$(NPM) --prefix $(FRONTEND_DIR) run format || true

## Clean build artifacts and node_modules
clean:
	@echo "🧹 Cleaning..."
	@rm -rf $(FRONTEND_DIR)/dist $(BACKEND_DIR)/dist
	@rm -rf $(FRONTEND_DIR)/node_modules $(BACKEND_DIR)/node_modules
	echo "✅ Clean done"

## Docker: up (dev profile), build, detach
docker-up:
	@$(DOCKER_COMPOSE) --profile dev up --build -d

## Docker: down
docker-down:
	@$(DOCKER_COMPOSE) down

## Docker: logs (follow)
docker-logs:
	@$(DOCKER_COMPOSE) logs -f

## Docker: ps
docker-ps:
	@$(DOCKER_COMPOSE) ps

## API healthcheck (expects /health route)
health:
	@curl -fsS $(HEALTH_URL) >/dev/null && echo "💚 API healthy at $(HEALTH_URL)" || (echo "❌ Health check failed"; exit 1)
