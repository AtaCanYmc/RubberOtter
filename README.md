# 🦦 RubberOtterPy — Comprehensive Python SDK, CLI & Web Dashboard

[![Python](https://img.shields.io/badge/Python-3.8%2B-blue.svg)](https://www.python.org/)
[![License](https://img.shields.io/badge/License-Apache_2.0-green.svg)](LICENSE)
[![PlatformIO](https://img.shields.io/badge/MCU-ATmega32U4-orange.svg)](https://platformio.org/)

**RubberOtterPy** is a modular, production-grade Python package that provides an **inline Python SDK**, a feature-rich **CLI tool**, and an embedded **Single Page Web Dashboard (`OtterDeck`)** for discovering, controlling, and managing Rubber Otter microcontrollers (SparkFun Pro Micro / Arduino Leonardo) over USB CDC Serial and Bluetooth LE (BLE HM-10 / BT05).

---

## 📌 Table of Contents

- [🚀 Quick Start](#-quick-start)
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
cd /Users/atacan/PycharmProjects/RubberOtterPy
pip install -e .
```

---

## 🐍 Python SDK Examples

### Synchronous Context Manager & Inline API

```python
from rubberotter import RubberOtter

# Auto-detects USB port and opens connection
with RubberOtter() as otter:
    # 1. Type text via USB HID Keyboard
    otter.type("Hello from RubberOtterPy!\n")

    # 2. Delay execution on MCU
    otter.delay(200)

    # 3. Trigger vibration motor haptics (150ms)
    otter.vibrate(150)

    # 4. Toggle background Mouse Jiggler
    otter.jiggler_toggle()

    # 5. Save & Run persistent EEPROM macro
    otter.macro_save("m0", 'type "unlock_pass\n"')
    otter.macro_run("m0")
```

### Asynchronous Client (`AsyncRubberOtter`)

```python
import asyncio
from rubberotter import AsyncRubberOtter

async def main():
    async with AsyncRubberOtter() as otter:
        res = await otter.type_async("Async typing payload\n")
        print("ACK Response:", res)

asyncio.run(main())
```

---

## 🛠️ CLI Subcommands Guide

Execute via `rubberotter` or `python3 -m rubberotter`:

```bash
# Discover USB Serial ports & BLE devices
rubberotter scan
rubberotter scan --json

# Send framed commands
rubberotter send "delay 100"
rubberotter type "Hello World\n"

# Control Mouse Jiggler & Vibration
rubberotter jiggler toggle
rubberotter vibrate 200

# EEPROM Macro Management
rubberotter macro list
rubberotter macro save m0 'type "pass123\n"'
rubberotter macro run m0

# REPL Interactive Prompt
rubberotter shell

# Launch Web Dashboard Server
rubberotter serve --web-port 8080
```

---

## 🌐 Web Dashboard (`OtterDeck`)

Launch the embedded web dashboard:

```bash
rubberotter serve --web-port 8080
```
Open **[http://127.0.0.1:8080](http://127.0.0.1:8080)** in your web browser.

### Key Web Features
- 🔌 **Device Connection Deck**: USB CDC Serial port auto-scan & 1-click connect.
- ⚡ **Haptic & Quick Shortcut Deck**: Vibration motor slider, Mouse Jiggler toggle badge, common key action shortcuts.
- ⌨️ **Typing & Payload Deck**: Text box for typing strings and raw packet test frame sender.
- 💾 **EEPROM Macro Manager**: Visual cards for macro slots (`m0`..`m5`) with Read, Edit, and Run buttons.
- 📟 **Live Log Feed**: Real-time packet execution log console with ACK indicators.

---

## 🧪 Running Unit Tests

```bash
python3 -m unittest discover -s tests -p "test_*.py"
```

---

## 📖 Documentation Links

- 🐍 **[Python SDK API Reference](file:///Users/atacan/PycharmProjects/RubberOtterPy/docs/PYTHON_SDK.md)**
- 🛠️ **[CLI User Manual](file:///Users/atacan/PycharmProjects/RubberOtterPy/docs/CLI_GUIDE.md)**
- 🌐 **[Web Dashboard & REST API Manual](file:///Users/atacan/PycharmProjects/RubberOtterPy/docs/WEB_APP.md)**

---

## 🇹🇷 Türkçe Açıklama

**RubberOtterPy**, ATmega32U4 (SparkFun Pro Micro / Arduino Leonardo) mikrodenetleyicileri üzerindeki Rubber Otter donanımını USB Seri Port ve Bluetooth LE (HM-10 / BT05) üzerinden yönetmenizi sağlayan kapsamlı bir Python paketidir.

### Temel Özellikler
1. **Python SDK**: `RubberOtter` ve `AsyncRubberOtter` sınıfları ile Python kodunuzun içinden tek satırla klavye yazma (`otter.type()`), titreşim motoru tetikleme (`otter.vibrate()`), Mouse Jiggler açıp kapatma (`otter.jiggler_toggle()`) ve EEPROM makro yönetimi (`otter.macro_save()`, `otter.macro_run()`).
2. **CLI Araçları**: Terminalden tek komutla tarama yapma (`rubberotter scan`), komut gönderme (`rubberotter send`), interaktif kabuk (`rubberotter shell`) ve web uygulamasını başlatma (`rubberotter serve`).
3. **Web Dashboard (`OtterDeck`)**: Tarayıcınızdan canlı cihaz taraması yapabileceğiniz, sanal klavye ve makro yönetimi sunan, canlı log konsoluna sahip modern Web Uygulaması.
