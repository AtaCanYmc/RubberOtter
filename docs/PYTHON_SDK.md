# 🐍 RubberOtterPy — Python SDK API Reference Manual

The `rubberotter` Python SDK allows developers to integrate Rubber Otter ATmega32U4 hardware control directly into Python scripts, desktop tools, and web services.

---

## 📌 Table of Contents

- [Installation](#installation)
- [Synchronous Client (`RubberOtter`)](#synchronous-client-rubberotter)
  - [Basic Usage](#basic-usage)
  - [Inline Function API Reference](#inline-function-api-reference)
- [Asynchronous Client (`AsyncRubberOtter`)](#asynchronous-client-asyncrubberotter)
- [Device Scanner API](#device-scanner-api)
- [Protocol Framing & Parsers](#protocol-framing--parsers)

---

## Installation

```bash
pip install -e .
```

---

## Synchronous Client (`RubberOtter`)

### Basic Usage

Use the context manager `with RubberOtter() as otter:` to automatically open and close the serial connection to your Rubber Otter microcontroller:

```python
from rubberotter import RubberOtter

with RubberOtter() as otter:
    # Type text string via USB HID
    otter.type("Hello from Python SDK!\n")
    
    # Trigger vibration motor haptic burst (150 ms)
    otter.vibrate(150)
    
    # Toggle non-blocking mouse jiggler
    otter.jiggler_toggle()
```

### Inline Function API Reference

#### `type(text: str) -> dict`
Types specified text string using USB HID Keyboard emulation.

```python
otter.type("Hello World\n")
```

#### `delay(ms: int) -> dict`
Instructs microcontroller to delay execution for `ms` milliseconds.

```python
otter.delay(500)
```

#### `press(key: str) -> dict`
Presses a single key (e.g., `"enter"`, `"tab"`, `"backspace"`, `"gui"`).

```python
otter.press("enter")
```

#### `combo(*keys: str) -> dict`
Triggers a key combination sequence (e.g., `combo("GUI", "space")` or `combo("press GUI l")`).

```python
otter.combo("press GUI space")
```

#### `mouse_click(button: str = "left") -> dict`
Clicks mouse button (`"left"`, `"right"`, `"middle"`).

```python
otter.mouse_click("left")
```

#### `mouse_move(dx: int = 0, dy: int = 0, wheel: int = 0) -> dict`
Moves mouse cursor relative (`dx`, `dy`) or scrolls wheel (`wheel`).

```python
otter.mouse_move(dx=10, dy=-5)
otter.mouse_move(wheel=1)  # scroll up
```

#### `jiggler_toggle() -> dict` / `jiggler_start()` / `jiggler_stop()`
Controls non-blocking background Mouse Jiggler mode.

```python
otter.jiggler_toggle()
```

#### `vibrate(ms: int = 100) -> dict`
Triggers vibration motor burst for `ms` milliseconds.

```python
otter.vibrate(200)
```

#### `macro_save(slot: str, body_command: str) -> dict`
Saves command sequence into EEPROM macro slot (`"m0"`..`"m5"`).

```python
otter.macro_save("m0", 'type "pass123\n"')
```

#### `macro_run(slot: str) -> dict`
Executes persistent EEPROM macro (`"m0"`..`"m5"`).

```python
otter.macro_run("m0")
```

#### `set_ble_name(name: str) -> dict`
Configures new advertised Bluetooth name on HM-10 BLE module.

```python
otter.set_ble_name("Otter_Pro")
```

---

## Asynchronous Client (`AsyncRubberOtter`)

For async frameworks (FastAPI, asyncio, Tornado):

```python
import asyncio
from rubberotter import AsyncRubberOtter

async def main():
    otter = AsyncRubberOtter()
    otter.connect()
    res = await otter.type_async("Hello Async!\n")
    print("ACK:", res)
    otter.disconnect()

asyncio.run(main())
```

---

## Device Scanner API

Scan connected USB CDC Serial ports and nearby Bluetooth LE (BLE) devices:

```python
from rubberotter import scan_serial_ports, scan_ble_devices, scan_all

# Scan USB Serial ports
ports = scan_serial_ports()
print("USB Ports:", ports)

# Scan BLE devices (timeout in seconds)
ble_res = scan_ble_devices(target_name="Otter", timeout=3.0)
print("BLE Devices:", ble_res["devices"])

# Scan both
all_devices = scan_all()
```
