.PHONY: help venv install test build build-web build-android build-ios build-mobile build-all dev-web dev-python build-firmware mobile-sync mobile-android mobile-ios clean

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
	@echo "  make build          - Build Web bundle, Python package, and PlatformIO firmware"
	@echo "  make build-web      - Build Web PWA -> dist/web/ & web/dist/"
	@echo "  make build-android  - Build Android APK -> dist/android/ & android/dist/"
	@echo "  make build-ios      - Build iOS App -> dist/ios/ & ios/dist/"
	@echo "  make build-mobile   - Build both Android APK and iOS native App"
	@echo "  make build-all      - Build all components (Web, Android, iOS, Python, Firmware)"
	@echo "  make dev-web        - Run Web PWA development server (Vite)"
	@echo "  make dev-python     - Install Python package in editable mode"
	@echo "  make build-firmware - Compile PlatformIO firmware for ATmega32U4"
	@echo "  make mobile-sync    - Build Web app and sync to native iOS & Android projects"
	@echo "  make mobile-android - Open Android Studio project directly"
	@echo "  make mobile-ios     - Open Xcode iOS project directly"
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

build-web:
	@echo "🌐 Building Web PWA bundle..."
	cd web && npm run build
	@mkdir -p dist/web
	cp -R web/dist/* dist/web/
	@echo "✅ Web build completed -> dist/web/ & web/dist/"

build-android:
	@echo "🤖 Syncing and building Android app..."
	cd web && npm run cap:sync
	@if command -v java >/dev/null 2>&1; then \
		cd android && ./gradlew assembleDebug && \
		mkdir -p ../dist/android dist && \
		cp app/build/outputs/apk/debug/app-debug.apk ../dist/android/RubberOtter-debug.apk && \
		cp app/build/outputs/apk/debug/app-debug.apk dist/RubberOtter-debug.apk && \
		echo "✅ Android build completed -> dist/android/RubberOtter-debug.apk & android/dist/"; \
	else \
		echo "⚠️ Java runtime not detected in CLI. Open project via 'make mobile-android' or install JDK to compile APK."; \
	fi

build-ios:
	@echo "🍎 Syncing and building iOS native app..."
	cd web && npm run cap:sync
	xcodebuild -project ios/App/App.xcodeproj -scheme App -configuration Release -destination 'generic/platform=iOS' -derivedDataPath ios/build build CODE_SIGNING_ALLOWED=NO CODE_SIGNING_REQUIRED=NO
	@mkdir -p dist/ios ios/dist
	cp -R ios/build/Build/Products/Release-iphoneos/App.app dist/ios/RubberOtter.app
	cp -R ios/build/Build/Products/Release-iphoneos/App.app ios/dist/RubberOtter.app
	@echo "✅ iOS build completed -> dist/ios/RubberOtter.app & ios/dist/RubberOtter.app"

build-mobile: build-android build-ios

build: venv build-web
	@echo "📦 Building Python distribution package..."
	$(VENV_PYTHON) -m pip install build twine
	cd python && ../$(VENV_PYTHON) -m build
	@echo "⚡ Building Firmware (if PlatformIO is installed)..."
	@if command -v platformio >/dev/null 2>&1; then \
		cd firmware && platformio run; \
	else \
		echo "⚠️ PlatformIO not found, skipping firmware compilation."; \
	fi

build-all: build build-mobile
	@echo "🎉 All builds completed successfully!"

mobile-sync:
	@echo "📱 Syncing Web distribution to Native iOS & Android..."
	cd web && npm run cap:sync

mobile-android:
	@echo "🤖 Opening Android project in Android Studio..."
	open -a "Android Studio" android 2>/dev/null || (cd web && npx cap open android)

mobile-ios:
	@echo "🍎 Opening iOS project in Xcode..."
	open ios/App/App.xcodeproj 2>/dev/null || (cd web && npx cap open ios)

dev-web:
	cd web && npm run dev

dev-python: venv
	$(VENV_PIP) install -e ./python

build-firmware:
	cd firmware && platformio run

clean:
	rm -rf dist web/dist web/node_modules python/dist python/build python/*.egg-info firmware/.pio $(VENV) android/.gradle android/app/build android/dist ios/build ios/dist
