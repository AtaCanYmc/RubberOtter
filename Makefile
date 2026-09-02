.PHONY: help venv install test build dev-web dev-python build-firmware mobile-sync mobile-android mobile-ios clean

PYTHON ?= python3
VENV ?= python/.venv
VENV_PYTHON = $(VENV)/bin/python
VENV_PIP = $(VENV)/bin/pip

help:
	@echo "🦦 Rubber Otter Monorepo Management"
	@echo ""
	@echo "Available commands:"
	@echo "  make install        - Set up virtual environment and install Web & Python dependencies"
	@echo "  make test           - Run unit tests across Python SDK and Web TypeScript check"
	@echo "  make build          - Build Web PWA bundle, Python package, and PlatformIO firmware"
	@echo "  make dev-web        - Run Web PWA development server (Vite)"
	@echo "  make dev-python     - Install Python package in editable mode"
	@echo "  make build-firmware - Compile PlatformIO firmware for ATmega32U4"
	@echo "  make mobile-sync    - Build Web app and sync to native iOS & Android Capacitor projects"
	@echo "  make mobile-android - Open Android native project in Android Studio"
	@echo "  make mobile-ios     - Open iOS native project in Xcode"
	@echo "  make clean          - Remove build artifacts and temporary caches"

venv:
	@if [ ! -d "$(VENV)" ]; then \
		echo "🌱 Creating Python virtual environment in $(VENV)..."; \
		$(PYTHON) -m venv $(VENV); \
	fi

install: venv
	@echo "📦 Installing Web dependencies..."
	cd web && npm install
	@echo "🐍 Installing Python dependencies in $(VENV)..."
	$(VENV_PIP) install --upgrade pip setuptools wheel
	$(VENV_PIP) install -r python/requirements.txt
	$(VENV_PIP) install -e ./python

test: venv
	@echo "🧪 Running Python tests..."
	$(VENV_PYTHON) -m unittest discover -s python/tests -p "test_*.py"
	@echo "🔍 Running Web TypeScript validation..."
	cd web && npx tsc --noEmit

build: venv
	@echo "🌐 Building Web PWA bundle..."
	cd web && npm run build
	@echo "📦 Building Python distribution package..."
	$(VENV_PYTHON) -m pip install build twine
	cd python && ../$(VENV_PYTHON) -m build
	@echo "⚡ Building Firmware (if PlatformIO is installed)..."
	@if command -v platformio >/dev/null 2>&1; then \
		cd firmware && platformio run; \
	else \
		echo "⚠️ PlatformIO not found, skipping firmware compilation."; \
	fi

mobile-sync:
	@echo "📱 Syncing Web distribution to Native iOS & Android..."
	cd web && npm run cap:sync

mobile-android:
	@echo "🤖 Opening Android project in Android Studio..."
	cd web && npm run cap:open:android

mobile-ios:
	@echo "🍎 Opening iOS project in Xcode..."
	cd web && npm run cap:open:ios

dev-web:
	cd web && npm run dev

dev-python: venv
	$(VENV_PIP) install -e ./python

build-firmware:
	cd firmware && platformio run

clean:
	rm -rf web/dist web/node_modules python/dist python/build python/*.egg-info firmware/.pio $(VENV)
