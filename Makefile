.PHONY: help install test build dev-web dev-python build-firmware clean

help:
	@echo "🦦 Rubber Otter Monorepo Management"
	@echo ""
	@echo "Available commands:"
	@echo "  make install        - Install dependencies for Web and Python packages"
	@echo "  make test           - Run unit tests across Python SDK and Web TypeScript check"
	@echo "  make build          - Build Web PWA bundle, Python package, and PlatformIO firmware"
	@echo "  make dev-web        - Run Web PWA development server (Vite)"
	@echo "  make dev-python     - Install Python package in editable mode"
	@echo "  make build-firmware - Compile PlatformIO firmware for ATmega32U4"
	@echo "  make clean          - Remove build artifacts and temporary caches"

install:
	@echo "📦 Installing Web dependencies..."
	cd web && npm install
	@echo "🐍 Installing Python dependencies..."
	cd python && pip install -r requirements.txt && pip install -e .

test:
	@echo "🧪 Running Python tests..."
	cd python && python3 -m unittest discover -s tests -p "test_*.py"
	@echo "🔍 Running Web TypeScript validation..."
	cd web && npx tsc --noEmit

build:
	@echo "🌐 Building Web PWA bundle..."
	cd web && npm run build
	@echo "📦 Building Python distribution package..."
	cd python && python3 -m build
	@echo "⚡ Building Firmware (if PlatformIO is installed)..."
	@if command -v platformio >/dev/null 2>&1; then \
		cd firmware && platformio run; \
	else \
		echo "⚠️ PlatformIO not found, skipping firmware compilation."; \
	fi

dev-web:
	cd web && npm run dev

dev-python:
	cd python && pip install -e .

build-firmware:
	cd firmware && platformio run

clean:
	rm -rf web/dist web/node_modules python/dist python/build python/*.egg-info firmware/.pio
