# 🦦 RubberOtter Firmware — Command Execution & Hardware Capabilities Reference

This document covers all firmware commands, payload structures, pin configurations, and execution routines compiled in `RubberOtter.ino` for ATmega32U4 microcontrollers (SparkFun Pro Micro / Arduino Leonardo).

---

## 📌 Pin Layout & Hardware Configuration

- **SoftwareSerial RX (`Pin 8`)**: Connects to HM-10 / BT05 **TX**
- **SoftwareSerial TX (`Pin 9`)**: Connects to HM-10 / BT05 **RX** (via 1kΩ / 2kΩ voltage divider)
- **Vibration Motor (`Pin 2`)**: Connected to N-Channel MOSFET / Transistor Gate driver
- **Hardware UART (`Pin 0 RX1` / `Pin 1 TX1`)**: Alternate HardwareSerial1 setup when `USE_SOFTSERIAL` is omitted.

---

## 📋 Firmware Command Set

### 1. `type "<text_payload>"`
Parses string payload, unescapes `\n` (Return), `\t` (Tab), `\"` (Quote), `\\` (Backslash), and types characters using `Keyboard.write()`.

### 2. `press <key>`
Executes single keypress or combination.
- **Navigation Keys**: `enter`, `tab`, `backspace`, `escape`, `space`, `delete`, `up`, `down`, `left`, `right`, `home`, `end`, `pageup`, `pagedown`
- **Function Keys**: `f1` through `f12`
- **Modifiers**: `gui` / `cmd` / `win`, `ctrl`, `alt`, `shift`
- **Media Keys**: `MEDIA_PLAY_PAUSE`, `MEDIA_NEXT_TRACK`, `MEDIA_PREV_TRACK`, `MEDIA_STOP`, `VOLUME_UP`, `VOLUME_DOWN`, `VOLUME_MUTE`

### 3. `mouse <action>`
Emulates USB HID Mouse.
- `mouse left`: Left mouse click
- `mouse right`: Right mouse click
- `mouse middle`: Middle mouse click
- `mouse move <dx> <dy>`: Relative cursor move in pixels
- `mouse wheel <val>`: Scroll wheel movement (`1` up, `-1` down)

### 4. `jiggler <action>`
Toggles background non-blocking Mouse Jiggler loop.
- `jiggler start`: Enables 5-second interval mouse motion
- `jiggler stop`: Disables mouse motion
- `jiggler toggle`: Toggles Jiggler state ON / OFF

### 5. `vibrate <duration_ms>`
Drives `Pin 2` (`VIB_PIN`) HIGH for `<duration_ms>` milliseconds, then pulls LOW.

### 6. `macro <subcommand>`
Non-volatile EEPROM storage routines for slots `m0`..`m5`.
- `macro list`: Prints list of all 6 stored macro slots
- `macro save <slot> "<commands>"`: Writes command sequence into EEPROM slot
- `macro run <slot>`: Reads and executes stored command sequence

### 7. `delay <duration_ms>`
Non-blocking or block delay for specified milliseconds.

### 8. `ble name "<new_name>"`
Sends `AT+NAME<new_name>` over software/hardware serial to HM-10/BT05 module to configure advertised Bluetooth name.

---

## ⚡ Command Chaining Syntax

Separate multiple commands using `&&` or `;`:
```text
vibrate 150 && type "Hello Otter\n"
press GUI space && delay 200 && type "terminal\n"
jiggler start; vibrate 300
```
