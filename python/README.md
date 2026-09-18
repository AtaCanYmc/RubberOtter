[← Back to Root Repository](../README.md)

# Rubber Otter Python SDK and CLI

Python client library, command-line interface, Model Context Protocol (MCP) server, and OtterDeck local web controller for the Rubber Otter USB HID ecosystem.

## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Model Context Protocol (MCP) Server](#model-context-protocol-mcp-server)
- [AI Agent Tool Registry](#ai-agent-tool-registry)
- [Python SDK Reference](#python-sdk-reference)
- [CLI Command Reference](#cli-command-reference)
- [OtterDeck Web Dashboard](#otterdeck-web-dashboard)
- [Testing](#testing)
- [Türkçe Özet](#türkçe-özet)

## Overview

`rubberotter` communicates with Rubber Otter microcontrollers across two primary transport mechanisms:
1. **Bluetooth Low Energy (BLE)**: Connects to HM-10 or ESP32 peripherals using Bleak. Auto-discovers devices by advertising name and GATT service UUID `0xFFE0`.
2. **USB CDC Serial**: Connects directly to MCU serial endpoints using PySerial.

The library encapsulates packet framing, sequence counting, checksum generation, and ACK validation.

## Installation

Install directly in editable development mode:

```bash
cd python
pip install -e .
```

Or install dependencies from `requirements.txt`:

```bash
pip install -r requirements.txt
```

### Runtime Requirements
- Python 3.10 or higher.
- `bleak >= 0.20.0`
- `pyserial >= 3.5`
- `flask >= 3.0.0`

## Quick Start

```bash
# Scan for nearby BLE devices and USB ports
rubberotter scan

# Type text via USB HID
rubberotter type "Hello from Rubber Otter\n"

# Trigger a 150ms vibration pulse
rubberotter vibrate 150

# Toggle background mouse jiggler
rubberotter jiggler toggle
```

## Model Context Protocol (MCP) Server

Rubber Otter implements a JSON-RPC 2.0 stdio Model Context Protocol (MCP) server for integration with AI assistants such as Claude Desktop, Cursor, and Antigravity.

### Running the Server

```bash
# Start the stdio MCP server
rubberotter mcp

# Inspect registered MCP tools
rubberotter mcp --list-tools

# Output Claude Desktop configuration snippet
rubberotter mcp --config-claude

# Output Cursor configuration snippet
rubberotter mcp --config-cursor
```

### Claude Desktop Integration

Add the following block to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "rubberotter": {
      "command": "rubberotter",
      "args": ["mcp"]
    }
  }
}
```

## AI Agent Tool Registry

Export tool schemas directly to OpenAI function calling format or Anthropic tool definitions:

```python
from rubberotter.ai.tools import RubberOtterToolRegistry

registry = RubberOtterToolRegistry()

# Export schemas for OpenAI Function Calling
openai_tools = [tool.to_openai_tool() for tool in registry.list_tools()]

# Export schemas for Anthropic Claude Tools
claude_tools = [tool.to_anthropic_tool() for tool in registry.list_tools()]

# Execute tool programmatically
result = registry.execute("rubberotter_type", {"text": "make test\n", "auto_enter": True})
print(result)
```

## Python SDK Reference

### Synchronous Client (`RubberOtter`)

```python
from rubberotter import RubberOtter

# Auto-discovers BLE device or USB serial port
with RubberOtter() as otter:
    otter.vibrate(150)
    otter.type("git status\n")
    otter.delay(100)
    otter.mouse_click("left")
    otter.jiggler_toggle()
    otter.macro_save("m0", 'vibrate 100 && type "echo done\n"')
    otter.macro_run("m0")
```

### Asynchronous Client (`AsyncRubberOtter`)

```python
import asyncio
from rubberotter import AsyncRubberOtter

async def run():
    async with AsyncRubberOtter(use_ble=True) as otter:
        ack = await otter.type_async("Async execution\n")
        print("ACK Response:", ack)
        await otter.vibrate_async(200)

asyncio.run(run())
```

## CLI Command Reference

| Command | Arguments | Description |
| :--- | :--- | :--- |
| `rubberotter scan` | `[--json]` | Scans for USB serial ports and BLE peripherals. |
| `rubberotter type` | `"<text>"` | Sends keystroke injection payload. |
| `rubberotter send` | `"<command>"` | Sends a raw framed protocol command string. |
| `rubberotter vibrate` | `<ms>` | Triggers vibration motor for duration in milliseconds. |
| `rubberotter jiggler` | `on \| off \| toggle` | Controls background mouse jiggler mode. |
| `rubberotter macro` | `list \| run \| save` | Manages EEPROM non-volatile macro slots. |
| `rubberotter serve` | `[--web-port 8080]` | Launches local OtterDeck web control panel. |
| `rubberotter mcp` | `[--list-tools]` | Starts Model Context Protocol stdio server. |

## OtterDeck Web Dashboard

The package embeds a lightweight Flask dashboard for controlling the device through a local web interface:

```bash
rubberotter serve --web-port 8080
```

Access the interface at `http://127.0.0.1:8080`.

## Testing

Run the Python unit test suite:

```bash
python3 -m unittest discover -s tests -p "test_*.py"
```

## Türkçe Özet

Rubber Otter Python paketi, ATmega32U4 tabanlı Rubber Otter donanımını Bluetooth LE (HM-10 / ESP32) ve USB Seri Port üzerinden yönetmek için tasarlanmış istemci kütüphanesi, terminal aracı ve Model Context Protocol (MCP) sunucusudur.

Temel Yetenekler:
1. **Model Context Protocol (MCP)**: Claude Desktop, Cursor ve yapay zeka ajanlarının işletim sistemi üzerinde doğrudan fare/klavye komutları yürütmesini sağlar.
2. **Yapay Zeka Araç Kaydı**: OpenAI ve Anthropic formatında otomatik araç şemaları üretir.
3. **Senkron ve Asenkron API**: Python betikleri için `RubberOtter` ve `AsyncRubberOtter` istemcileri sunar.
4. **OtterDeck Arayüzü**: Dahili Flask sunucusu ile web üzerinden anlık test ve yönetim imkanı verir.
