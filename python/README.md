<p align="center">
  <img src="../docs/assets/banner.jpg" alt="RubberOtterPy Banner" width="100%" />
</p>

# 🦦 RubberOtterPy — Python SDK, CLI, MCP Server & AI Agent Tools

[![Python](https://img.shields.io/badge/Python-3.8%2B-blue.svg)](https://www.python.org/)
[![License](https://img.shields.io/badge/License-Apache_2.0-green.svg)](../LICENSE)
[![MCP](https://img.shields.io/badge/Protocol-MCP%202024--11--05-purple.svg)](https://modelcontextprotocol.io/)
[![Bluetooth LE](https://img.shields.io/badge/BLE-HM--10%20%2F%20ESP32-blueviolet.svg)](https://en.wikipedia.org/wiki/Bluetooth_Low_Energy)

**RubberOtterPy** is a modular, production-grade Python package that provides an **async/sync Python SDK**, a feature-rich **CLI tool**, a **Model Context Protocol (MCP) Server**, an **AI Agent Tool Registry**, and an embedded **Web Dashboard (`OtterDeck`)** for discovering, controlling, and managing Rubber Otter microcontrollers (SparkFun Pro Micro / Arduino Leonardo / ATmega32U4) over **Bluetooth LE (HM-10 / ESP32)** and USB CDC Serial.

---

## 📌 Table of Contents

- [🚀 Quick Start](#-quick-start)
- [🤖 Model Context Protocol (MCP) Server](#-model-context-protocol-mcp-server)
- [🧠 AI Agent Tool Registry (OpenAI / Claude / LangChain)](#-ai-agent-tool-registry-openai--claude--langchain)
- [✨ Key Capabilities](#-key-capabilities)
- [🐍 Python SDK Examples](#-python-sdk-examples)
- [🛠️ CLI Subcommands Guide](#%EF%B8%8F-cli-subcommands-guide)
- [🌐 Web Dashboard (`OtterDeck`)](#-web-dashboard-otterdeck)
- [🧪 Running Unit Tests](#-running-unit-tests)
- [📖 Documentation Links](#-documentation-links)
- [🇹🇷 Türkçe Açıklama](#-türkçe-açıklama)

---

## 🚀 Quick Start

### Installation

```bash
cd python
pip install -e .
```

---

## 🤖 Model Context Protocol (MCP) Server

Rubber Otter includes a native **JSON-RPC 2.0 stdio MCP Server** compatible with **Claude Desktop**, **Cursor**, **Windsurf**, **Antigravity**, and autonomous LLM agents.

### Start the MCP Server
```bash
# Run server over stdio
rubberotter mcp

# Generate Claude Desktop configuration
rubberotter mcp --config-claude

# Generate Cursor / Windsurf configuration
rubberotter mcp --config-cursor

# List all 13 available MCP tools
rubberotter mcp --list-tools
```

### Claude Desktop Configuration Example
Add the following snippet to `~/Library/Application Support/Claude/claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "rubberotter": {
      "command": "python",
      "args": ["-m", "rubberotter.mcp.server"]
    }
  }
}
```

---

## 🧠 AI Agent Tool Registry (OpenAI / Claude / LangChain)

Use Rubber Otter tools directly within autonomous AI agents:

```python
from rubberotter.ai.tools import RubberOtterToolRegistry

registry = RubberOtterToolRegistry()

# 1. Export schemas for OpenAI Function Calling
openai_tools = [t.to_openai_tool() for t in registry.list_tools()]

# 2. Export schemas for Anthropic Claude Tools
claude_tools = [t.to_anthropic_tool() for t in registry.list_tools()]

# 3. Direct Tool Execution
result = registry.execute("rubberotter_type", {"text": "echo 'Hello from AI Agent!'", "auto_enter": True})
print(result)
```

---

## ✨ Key Capabilities

| Category | Features & Commands | Description |
| :--- | :--- | :--- |
| **Transport** | `BLE Direct`, `USB Serial`, `--raw`, `--no-ack` | Direct wireless BLE connection over HM-10/ESP32 GATT or USB CDC Serial. Supports un-framed text payloads and no-ACK modes. |
| **AI / MCP** | `rubberotter mcp`, `AI Tool Registry` | 13 typed AI tools conforming to Model Context Protocol (MCP) and function calling schemas. |
| **Haptics** | `vibrate <ms>` | Triggers vibration motor haptic bursts (50ms - 1000ms). |
| **Keyboard** | `type "<text>"`, `press <key>`, `combo <keys>` | USB HID Keyboard emulation with unescaping (`\n`, `\t`) and key shortcuts (Spotlight, Lock Screen, Copy/Paste). |
| **Mouse** | `mouse left/right`, `mouse move`, `mouse wheel` | Virtual mouse clicker, relative movement, and scroll wheel. |
| **Jiggler** | `jiggler start/stop/toggle` | Background non-blocking USB Mouse Jiggler mode. |
| **Media** | `Play/Pause`, `Next/Prev`, `Vol Up/Down`, `Mute` | Dedicated media and volume controls. |
| **Clicker** | `Start (F5)`, `Next/Prev Slide`, `Black/White Screen` | Dedicated presenter clicker deck. |
| **Macros** | `macro list`, `macro save`, `macro run` | Persistent EEPROM macro slot storage (`m0`..`m5`). |

---

## 🐍 Python SDK Examples

### Synchronous Client (`RubberOtter`)

```python
from rubberotter import RubberOtter

# Connects via BLE auto-detection to nearby Rubber Otter device
with RubberOtter() as otter:
    # 1. Type text via USB HID Keyboard
    otter.type("Hello from RubberOtterPy!\n")

    # 2. Delay execution on MCU
    otter.delay(200)

    # 3. Trigger vibration motor haptics (150ms)
    otter.vibrate(150)

    # 4. Control virtual mouse clicker & scroll wheel
    otter.mouse_click("left")
    otter.mouse_move(wheel=1)

    # 5. Toggle background Mouse Jiggler
    otter.jiggler_toggle()

    # 6. Save & Run persistent EEPROM macro
    otter.macro_save("m0", 'vibrate 150 && type "pass123\n"')
    otter.macro_run("m0")
```

### Asynchronous Client (`AsyncRubberOtter`)

```python
import asyncio
from rubberotter import AsyncRubberOtter

async def main():
    async with AsyncRubberOtter(use_ble=True) as otter:
        res = await otter.type_async("Async typing payload over BLE\n")
        print("ACK Response:", res)
        await otter.vibrate_async(200)

asyncio.run(main())
```

---

## 🛠️ CLI Subcommands Guide

Execute via `rubberotter` or `python3 -m rubberotter`:

```bash
# Discover BLE devices & USB Serial ports
rubberotter scan

# Start MCP Server for AI Assistants (Claude, Cursor)
rubberotter mcp
rubberotter mcp --config-claude
rubberotter mcp --list-tools

# Direct BLE command (auto-detects BLE device or use --ble-address / -b)
rubberotter vibrate 200

# Send typing and framed commands over BLE
rubberotter type "Hello World\n"
rubberotter send "delay 100"

# Control Mouse Jiggler & Vibration
rubberotter jiggler toggle
rubberotter vibrate 200

# EEPROM Macro Management
rubberotter macro list
rubberotter macro save m0 'type "pass123\n"'
rubberotter macro run m0

# Launch Web Dashboard Server
rubberotter serve --web-port 8080
```

---

## 🌐 Web Dashboard (`OtterDeck`)

Launch the embedded single page web application:

```bash
rubberotter serve --web-port 8080
```
Open **[http://127.0.0.1:8080](http://127.0.0.1:8080)** in your web browser.

---

## 🧪 Running Unit Tests

```bash
python -m unittest discover -s tests -p "test_*.py"
```

---

## 📖 Documentation Links

- 🤖 **[Model Context Protocol (MCP) & AI Agent Guide](../docs/MCP_AND_AI_TOOLS.md)**
- 📱 **[Mobile Packaging Guide (iOS & Android)](../docs/MOBILE_PACKAGING.md)**
- 📦 **[Protocol Framing Specification](../docs/protocol-spec.md)**
- 🔌 **[Hardware Wiring & Schematics](../docs/hardware-wiring.md)**

---

## 🇹🇷 Türkçe Açıklama

**RubberOtterPy**, ATmega32U4 mikrodenetleyicisi üzerindeki Rubber Otter donanımını **Bluetooth LE (HM-10 / ESP32)** ve USB Seri Port üzerinden kablosuz yönetmenizi sağlayan, **Model Context Protocol (MCP)** ve **Yapay Zeka Ajan Araçları** ile güçlendirilmiş bir Python paketidir.

### Neler Yapılabilir?
1. **Model Context Protocol (MCP) Sunucusu:** Claude Desktop, Cursor, Antigravity ve Windsurf gibi yapay zeka araçlarına doğrudan bağlanarak yapay zekanın bilgisayarınızı kablosuz yönetmesini sağlar (`rubberotter mcp`).
2. **Yapay Zeka Ajan Araçları (OpenAI / Claude / LangChain):** Otonom ajanlar için 13 adet hazır şemalandırılmış ve doğrulanmış araç seti sunar.
3. **Kablosuz Bluetooth LE (BLE) Bağlantısı:** USB kablosu takılı olmasa bile cihazla doğrudan GATT üzerinden haberleşir.
4. **Titreme & Haptik Geri Bildirim:** `vibrate 200` ile Pin 2 üzerindeki titreşim motorunu milisaniye bazında çalıştırır.
5. **USB HID Klavye & Fare Emülasyonu:** Ekrana metin yazar (`type`), özel kısayolları çalıştırır, sanal fare tıklaması ve kaydırma yapar.
6. **Mouse Jiggler Modu:** Bilgisayarın uykuya geçmesini önleyen arka plan fare hareketini açar/kapatır (`jiggler toggle`).
7. **Web Dashboard (`OtterDeck`):** `rubberotter serve` komutuyla başlatılan gelişmiş tarayıcı arayüzü ve REST API desteği.
