.PHONY: help venv install test build dev-python build-firmware clean

PYTHON ?= python3
VENV ?= python/.venv
VENV_PYTHON = $(VENV)/bin/python
VENV_PIP = $(VENV)/bin/pip

help:
	@echo "RubberOtter Hardware & Python SDK Management"
	@echo ""
	@echo "Available commands:"
	@echo "  make install        - Set up Python virtual environment and install dependencies"
	@echo "  make test           - Run Python SDK/CLI/MCP unit tests"
	@echo "  make build          - Build Python distribution package and PlatformIO firmware"
	@echo "  make dev-python     - Install Python package in editable mode"
	@echo "  make build-firmware - Compile PlatformIO firmware for ATmega32U4"
	@echo "  make clean          - Remove build artifacts and temporary caches"

venv:
	@if [ ! -d "$(VENV)" ]; then \
		$(PYTHON) -m venv $(VENV); \
	fi

install: venv
	$(VENV_PIP) install --upgrade pip setuptools wheel
	$(VENV_PIP) install -r python/requirements.txt
	$(VENV_PIP) install -e ./python

test: venv
	$(VENV_PYTHON) -m unittest discover -s python/tests -p "test_*.py"

dev-python: venv
	$(VENV_PIP) install -e ./python

build-firmware:
	cd firmware && platformio run

build: venv
	$(VENV_PYTHON) -m pip install build twine
	cd python && ../$(VENV_PYTHON) -m build
	@if command -v platformio >/dev/null 2>&1; then \
		cd firmware && platformio run; \
	else \
		echo "PlatformIO CLI not found. Skipping firmware build."; \
	fi

clean:
	rm -rf dist python/build python/dist python/*.egg-info firmware/.pio/build
