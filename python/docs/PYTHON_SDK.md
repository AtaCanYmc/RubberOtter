# 🐍 RubberOtterPy — Python SDK API Reference Manual

The `rubberotter` Python SDK allows developers to integrate Rubber Otter hardware control directly into Python scripts, desktop tools, and web services over **Bluetooth Low Energy (BLE)** or USB CDC Serial.

👉 **Master Capability & Command Reference**: **[`docs/CAPABILITIES_AND_COMMANDS.md`](file:///Users/atacan/PycharmProjects/RubberOtterPy/docs/CAPABILITIES_AND_COMMANDS.md)**

---

## 📌 Table of Contents

- [Installation](#installation)
- [Synchronous Client (`RubberOtter`)](#synchronous-client-rubberotter)
  - [Basic Context Manager Usage](#basic-context-manager-usage)
  - [BLE & Serial Options](#ble--serial-options)
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

### Basic Context Manager Usage

```python
from rubberotter import RubberOtter

# By default, connects via BLE auto-detection to nearby Rubber Otter device
with RubberOtter() as otter:
    # 1. Type text via USB HID Keyboard
    otter.type("Hello from Python SDK!\n")
    
    # 2. Delay execution on MCU
    otter.delay(200)
    
    # 3. Trigger vibration motor haptic burst (150 ms)
    otter.vibrate(150)
    
    # 4. Virtual Mouse Click & Scroll Wheel
    otter.mouse_click("left")
    otter.mouse_move(wheel=1)
    
    # 5. Toggle background Mouse Jiggler
    otter.jiggler_toggle()
    
    # 6. Save & execute EEPROM macro
    otter.macro_save("m0", 'vibrate 150 && type "pass123\n"')
    otter.macro_run("m0")
```

---

### BLE & Serial Options

```python
# Connect to specific BLE MAC address / UUID
with RubberOtter(ble_address="60F9F128-5B7C-1258-10D5-2694444599B7", use_ble=True) as otter:
    otter.vibrate(200)

# Send raw un-framed string commands without waiting for ACK (for custom MCU sketches)
with RubberOtter(raw=True, no_ack=True) as otter:
    otter.send("vibrate 200")

# Connect explicitly over USB Serial port
with RubberOtter(port="/dev/cu.usbmodemHIDFG1", use_ble=False) as otter:
    otter.vibrate(200)
```

---

### Inline Function API Reference

#### `type(text: str) -> dict`
Types specified text string using USB HID Keyboard emulation. Automatically unescapes `\n`, `\t`, `\"`, `\\`.

```python
otter.type("Hello World\n")
otter.type("whoami && uname -a\n")
```

#### `delay(ms: int) -> dict`
Instructs microcontroller to delay execution for `ms` milliseconds.

```python
otter.delay(500)
```

#### `press(key: str) -> dict`
Presses a single key (e.g., `"enter"`, `"tab"`, `"backspace"`, `"escape"`, `"space"`, `"up"`, `"down"`, `"left"`, `"right"`, `"f5"`, `"MEDIA_PLAY_PAUSE"`).

```python
otter.press("enter")
otter.press("f5")                 # Start Presentation
otter.press("MEDIA_PLAY_PAUSE")   # Play/Pause Media
otter.press("VOLUME_UP")          # Increase Volume
```

#### `combo(*keys: str) -> dict`
Triggers a key combination sequence.

```python
otter.combo("press GUI space")    # Open macOS Spotlight
otter.combo("press GUI l")        # Lock Screen
otter.combo("press ALT TAB")      # Window Switcher
otter.combo("press CTRL c")       # Cancel Terminal Command
```

#### `mouse_click(button: str = "left") -> dict`
Clicks mouse button (`"left"`, `"right"`, `"middle"`).

```python
otter.mouse_click("left")
otter.mouse_click("right")
```

#### `mouse_move(dx: int = 0, dy: int = 0, wheel: int = 0) -> dict`
Moves mouse cursor relative (`dx`, `dy`) or scrolls wheel (`wheel`).

```python
otter.mouse_move(dx=10, dy=-5)
otter.mouse_move(wheel=1)   # Scroll up
otter.mouse_move(wheel=-1)  # Scroll down
```

#### `jiggler_toggle() -> dict` / `jiggler_start()` / `jiggler_stop()`
Controls non-blocking background Mouse Jiggler mode.

```python
otter.jiggler_toggle()
otter.jiggler_start()
otter.jiggler_stop()
```

#### `vibrate(ms: int = 100) -> dict`
Triggers vibration motor burst for `ms` milliseconds.

```python
otter.vibrate(200)
```

#### `macro_save(slot: str, body_command: str) -> dict`
Saves command sequence into EEPROM macro slot (`"m0"`..`"m5"`).

```python
otter.macro_save("m0", 'vibrate 150 && type "pass123\n"')
```

#### `macro_run(slot: str) -> dict`
Executes persistent EEPROM macro (`"m0"`..`"m5"`).

```python
otter.macro_run("m0")
```

#### `set_ble_name(name: str) -> dict`
Configures new advertised Bluetooth name on HM-10/BT05 BLE module.

```python
otter.set_ble_name("Otter_Pro")
```

---

## Asynchronous Client (`AsyncRubberOtter`)

For asynchronous frameworks (FastAPI, asyncio, Tornado):

```python
import asyncio
from rubberotter import AsyncRubberOtter

async def main():
    async with AsyncRubberOtter(use_ble=True) as otter:
        res = await otter.type_async("Hello Async over BLE!\n")
        print("ACK Response:", res)
        
        await otter.vibrate_async(200)
        await otter.jiggler_toggle_async()

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
