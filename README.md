# 🦦 Rubber Otter — Unified Bluetooth HID Ecosystem

[![Firmware CI](https://github.com/AtaCanYmc/RubberOtter/actions/workflows/ci-firmware.yml/badge.svg)](https://github.com/AtaCanYmc/RubberOtter/actions/workflows/ci-firmware.yml)
[![Python SDK CI](https://github.com/AtaCanYmc/RubberOtter/actions/workflows/ci-python.yml/badge.svg)](https://github.com/AtaCanYmc/RubberOtter/actions/workflows/ci-python.yml)
[![Web PWA CI](https://github.com/AtaCanYmc/RubberOtter/actions/workflows/ci-web.yml/badge.svg)](https://github.com/AtaCanYmc/RubberOtter/actions/workflows/ci-web.yml)
[![Deploy PWA](https://github.com/AtaCanYmc/RubberOtter/actions/workflows/cd-github-pages.yml/badge.svg)](https://github.com/AtaCanYmc/RubberOtter/actions/workflows/cd-github-pages.yml)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)

**Rubber Otter** is a complete, modular, and open-source **wireless USB HID automation ecosystem**. It allows you to control a target computer (Windows, macOS, Linux) via keystroke injection, virtual mouse movements, media keys, presentation controls, and persistent EEPROM macros over Bluetooth Low Energy (BLE HM-10) and USB CDC Serial.

---

## 📐 System Architecture

```mermaid
graph TD
    subgraph Clients["1. Client Layer"]
        WEB["🌐 Web PWA (web/)<br/>React 18 + Vite + Tailwind<br/>Direct Web Bluetooth API"]
        PY_SDK["🐍 Python SDK & CLI (python/)<br/>Bleak + PySerial<br/>Scripting & OtterDeck Dashboard"]
    end

    subgraph Transport["2. Transport Layer (Wireless / Serial)"]
        BLE["HM-10 / BT05 BLE Module<br/>GATT Service 0xFFE0 / Char 0xFFE1"]
        UART["Serial1 UART @ 9600 Baud<br/>Hardware Ring Buffer"]
        BLE -->|"Wireless Link"| UART
    end

    subgraph FirmwareLayer["3. Firmware Layer (firmware/)"]
        PARSER["Packet Parser & State Machine<br/>STX/ETX Framed & Single-Byte HEX"]
        EXEC["Command Executor<br/>Macro Store & Jiggler Engine"]
        HID["USB HID Driver Stack<br/>Keyboard.h & Mouse.h"]
        VIB["Haptic Vibration Driver<br/>Pin 2 Pulse"]

        UART --> PARSER
        PARSER --> EXEC
        EXEC --> HID
        EXEC --> VIB
    end

    subgraph TargetPC["4. Target Host Computer"]
        USB["USB CDC HID Device<br/>(Plug & Play - No Drivers)"]
        OS["Host OS (Windows / macOS / Linux)"]
        HID -->|"Emulated USB Keystrokes & Mouse"| USB
        USB --> OS
    end

    WEB -->|"Web Bluetooth"| BLE
    PY_SDK -->|"BLE / USB Serial"| BLE

    style WEB fill:#0f172a,stroke:#06b6d4,stroke-width:2px,color:#f8fafc
    style PY_SDK fill:#1e1b4b,stroke:#818cf8,stroke-width:2px,color:#f8fafc
    style BLE fill:#070a12,stroke:#38bdf8,stroke-width:2px,color:#f8fafc
    style UART fill:#070a12,stroke:#38bdf8,stroke-width:2px,color:#f8fafc
    style FirmwareLayer fill:#064e3b,stroke:#34d399,stroke-width:2px,color:#f8fafc
    style TargetPC fill:#701a75,stroke:#f472b6,stroke-width:2px,color:#f8fafc
```

---

## 🗂️ Monorepo Structure

```text
RubberOtter/
├── firmware/                     # ⚡ C++ / PlatformIO / Arduino Firmware (ATmega32U4)
│   ├── platformio.ini           # PlatformIO multi-environment configuration
│   ├── src/                     # Firmware modular source files (Parser, Executor, Store)
│   ├── tests/                   # Native & Host integration tests
│   └── docs/                    # Firmware-specific technical docs
│
├── python/                       # 🐍 Python SDK, CLI Tool & OtterDeck Dashboard
│   ├── pyproject.toml           # PyPI packaging definition
│   ├── rubberotter/             # Core Python package (client, transports, cli, dashboard)
│   └── tests/                   # Comprehensive unittest suite
│
├── web/                          # 🌐 React 18 + TypeScript + Vite + Tailwind PWA
│   ├── src/                     # PWA components (Media, Trackpad, Remote, Macro Builder)
│   ├── public/                  # PWA icons, manifest, and service worker
│   └── vite.config.ts           # Vite build & PWA configuration
│
├── docs/                         # 📖 Shared Ecosystem Documentation
│   ├── protocol-spec.md         # STX/ETX Framed Binary & Hex Command Specification
│   ├── hardware-wiring.md       # HM-10 BLE & Pro Micro wiring schematics
│   └── architecture.md          # Architectural deep-dive
│
├── .github/workflows/            # 🚀 Unified Matrix CI/CD Workflows
├── Makefile                      # 🛠️ Root developer automation commands
└── release-please-config.json    # 🏷️ Monorepo multi-package semantic versioning
```

---

## 🚀 Quick Starts

### 1. 🌐 Web PWA Client (`web/`)
Run the Progressive Web App directly in any Web Bluetooth compatible browser (Chrome, Edge, Opera on Android/macOS/Windows/Linux):

```bash
cd web
npm install
npm run dev
```
> Or access the hosted live version on GitHub Pages!

### 2. 🐍 Python SDK & CLI (`python/`)
Install the Python package locally or directly into your virtual environment:

```bash
cd python
pip install -e .

# Scan for BLE Rubber Otter devices
rubberotter scan

# Type automated keystrokes
rubberotter type "Hello from Rubber Otter!"

# Launch the embedded OtterDeck local web dashboard
rubberotter dashboard --port 8080
```

#### Python Code Snippet:
```python
from rubberotter import RubberOtter

with RubberOtter() as otter:
    otter.vibrate(100)
    otter.type("Hello World!\n")
    otter.jiggler_toggle()
```

### 3. ⚡ ATmega32U4 Firmware (`firmware/`)
Compile and flash the firmware using [PlatformIO](https://platformio.org/):

```bash
cd firmware

# Flash to Arduino Leonardo / Pro Micro 5V
platformio run -e pro_micro -t upload
```

---

## 🛠️ Developer Commands

Use the root `Makefile` to build and test all components in one go:

```bash
make test           # Run Python unit tests and Web TypeScript validation
make build          # Build Web PWA, Python distribution, and compile firmware
make dev-web        # Start the Web PWA Vite development server
make dev-python     # Install Python package in editable mode
```

---

## 📖 Specifications & Reference

- [📦 Protocol Framing Specification (STX/ETX & Hex Codes)](docs/protocol-spec.md)
- [🔌 Hardware Wiring & Safety Guide](docs/hardware-wiring.md)

---

## 📄 License

This project is licensed under the [Apache 2.0 License](LICENSE).
