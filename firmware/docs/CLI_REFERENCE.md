# 🦦 Rubber Otter CLI Reference Manual (`otter` / `scripts/cli.py`)

The **Rubber Otter CLI** is a feature-rich, production-grade management tool for discovering, controlling, and configuring ATmega32U4 Rubber Otter devices (SparkFun Pro Micro / Arduino Leonardo) over USB Serial ports and Bluetooth Low Energy (BLE HM-10 / BT05).

---

## 📌 Table of Contents

- [Features](#features)
- [Installation & Requirements](#installation--requirements)
- [Global Command Options](#global-command-options)
- [Subcommands](#subcommands)
  - [1. `scan`](#1-scan)
  - [2. `send`](#2-send)
  - [3. `type`](#3-type)
  - [4. `macro`](#4-macro)
  - [5. `jiggler`](#5-jiggler)
  - [6. `vibrate`](#6-vibrate)
  - [7. `ble-name`](#7-ble-name)
  - [8. `shell`](#8-shell)
- [JSON API & Automation](#json-api--automation)
- [Unit Testing](#unit-testing)

---

## Features

- 🔌 **Auto-Discovery**: Automatically detects connected USB CDC Serial ports and nearby HM-10 / BT05 BLE modules.
- 📦 **Binary Framing**: Encapsulates raw payload strings in STX/ETX framed packets with XOR checksum validation.
- 💾 **EEPROM Macro Management**: Save, run, and list persistent payloads (`m0`..`m5`) on the target MCU.
- 🐭 **Mouse & Jiggler Controls**: Execute mouse movement, clicks, and non-blocking mouse jiggler mode.
- 📳 **Haptic Feedback**: Trigger vibration motor bursts directly over CLI commands.
- 💬 **Interactive REPL Shell**: Autocomplete commands with history support via `otter shell`.
- 🤖 **JSON Output Mode**: Export clean JSON structures for integration into web interfaces or CI pipelines.

---

## Installation & Requirements

Python 3.8+ is required. Install optional dependencies for full hardware detection and BLE scanning:

```bash
pip3 install pyserial bleak
```

Make the CLI tool executable:
```bash
chmod +x scripts/cli.py
```

---

## Global Command Options

These flags can be placed either before or after subcommands:

| Flag | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `--port` | `string` | *Auto-detected* | Target USB Serial device path (e.g. `/dev/cu.usbmodemHIDFG1` or `COM3`). |
| `--baud` | `int` | `9600` | Serial communication baud rate. |
| `--seq` | `int` | `1` | Frame sequence tracking number (0–255). |
| `--timeout` | `float` | `1.0` | Timeout waiting for ACK response (seconds). |
| `--retries` | `int` | `2` | Number of retry attempts on packet timeout. |
| `--json` | `flag` | `False` | Output pure JSON payload format. |

---

## Subcommands

### 1. `scan`
Scans for connected USB Serial devices and nearby BLE modules.

```bash
# Standard interactive scan
python3 scripts/cli.py scan

# Scan USB Serial ports only
python3 scripts/cli.py scan --mode serial

# Scan for BLE devices with a custom 2s timeout
python3 scripts/cli.py scan --mode ble --scan-timeout 2.0

# Export JSON scan report
python3 scripts/cli.py scan --json
```

### 2. `send`
Transmits a framed command string directly to the microcontroller.

```bash
# Send delay command
python3 scripts/cli.py send "delay 100"

# Send key combo (e.g. Command + Space on Mac)
python3 scripts/cli.py send "press GUI space"
```

### 3. `type`
Types an arbitrary text string using USB HID Keyboard emulation.

```bash
python3 scripts/cli.py type "Hello from Rubber Otter CLI!\n"
```

### 4. `macro`
Manages EEPROM persistent macro slots (`m0`..`m5`).

```bash
# List persistent macros stored in EEPROM
python3 scripts/cli.py macro list

# Save command sequence into macro slot m0
python3 scripts/cli.py macro save m0 '{type "unlock_pass\n"}'

# Execute macro slot m0
python3 scripts/cli.py macro run m0
```

### 5. `jiggler`
Controls non-blocking Mouse Jiggler mode.

```bash
python3 scripts/cli.py jiggler toggle
python3 scripts/cli.py jiggler start
python3 scripts/cli.py jiggler stop
```

### 6. `vibrate`
Triggers the vibration motor for specified milliseconds.

```bash
python3 scripts/cli.py vibrate 200
```

### 7. `ble-name`
Configures a new advertised Bluetooth name on the HM-10 module.

```bash
python3 scripts/cli.py ble-name "Otter_Pro"
```

### 8. `shell`
Launches an interactive REPL shell with tab completion and live ACK responses.

```bash
python3 scripts/cli.py shell
```

```text
============================================================
 🦦 Rubber Otter Interactive Console
 Connected Port: /dev/cu.usbmodemHIDFG1
 Type commands directly or 'help' for options. Type 'exit' to quit.
============================================================
otter> type "Hello World\n"
 ✔ ACK (seq=1)
otter> vibrate 100
 ✔ ACK (seq=2)
otter> exit
Goodbye!
```

---

## JSON API & Automation

When `--json` is enabled, all output logs are suppressed and only structured JSON is printed to stdout:

```json
$ python3 scripts/cli.py send --json "delay 50"
{
  "version": 1,
  "seq": 1,
  "status": 1,
  "code": 0,
  "success": true,
  "attempt": 1,
  "port": "/dev/cu.usbmodemHIDFG1"
}
```

---

## Unit Testing

Run the automated test suite to verify framing, sequence wrapping, XOR checksums, and ACK parsing:

```bash
python3 -m unittest discover -s tests -p "test_*.py"
```
