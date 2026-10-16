.PHONY: help install run test lint format docker-build docker-run clean

help: ## Show this help message
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

install: ## Install dependencies
	pip install -r requirements.txt

install-dev: ## Install all dependencies including dev tools
	pip install -r requirements-dev.txt

setup-hooks: ## Setup pre-commit hooks
	pip install pre-commit
	pre-commit install
	@echo "✅ Pre-commit hooks installed! Code will be auto-formatted before each commit."

run: ## Run the application
	python main.py

run-reload: ## Run with auto-reload
	uvicorn main:app --reload --host 0.0.0.0 --port 8000

test: ## Run tests
	pytest tests/ -v

test-cov: ## Run tests with coverage
	pytest tests/ -v --cov=. --cov-report=html --cov-report=term
	@echo "Coverage report: htmlcov/index.html"

lint: ## Run linter (flake8)
	flake8 . --count --select=E9,F63,F7,F82 --show-source --statistics
	flake8 . --count --exit-zero --max-complexity=10 --max-line-length=127 --statistics

format: ## Format code with black
	black .

format-check: ## Check code formatting
	black --check .

type-check: ## Run type checker (mypy)
	mypy main.py --ignore-missing-imports

security-check: ## Check dependencies for security issues
	safety check

docker-build: ## Build Docker image
	docker build -t fastapi-chatbot .

docker-run: ## Run Docker container
	docker run -p 8000:8000 fastapi-chatbot

docker-compose-up: ## Start services with docker-compose
	docker-compose up -d

docker-compose-down: ## Stop services with docker-compose
	docker-compose down

docker-compose-logs: ## View docker-compose logs
	docker-compose logs -f

clean: ## Clean up cache and temporary files
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete
	find . -type f -name "*.pyo" -delete
	find . -type d -name "*.egg-info" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".mypy_cache" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name "htmlcov" -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name ".coverage" -delete 2>/dev/null || true
	@echo "Cleaned up cache and temporary files"

ci: format-check lint type-check test ## Run all CI checks locally

all: install format lint type-check test ## Install, format, lint, type-check and test

dev-setup: install-dev setup-hooks ## Setup development environment
	@echo ""
	@echo "✅ Development environment setup complete!"
	@echo ""
	@echo "📝 Next steps:"
	@echo "  1. Run 'make run-reload' to start development server"
	@echo "  2. Code will be auto-formatted before each commit"
	@echo "  3. Use 'make test' to run tests"
	@echo ""
