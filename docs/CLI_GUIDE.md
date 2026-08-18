# 🛠️ RubberOtterPy — CLI User Guide & Command Manual

The `rubberotter` CLI utility provides command-line control for hardware scanning, packet transmission over **Bluetooth LE (BLE)** or USB Serial, EEPROM macro management, REPL interactive console, and starting the Web Dashboard.

---

## 📌 Connection & Usage Overview

By default, `rubberotter` operates in **Bluetooth LE (BLE) mode**, auto-detecting and communicating directly with nearby Rubber Otter BLE devices (`BT05` / `Otter` / `HM-10`).

```bash
# Direct BLE command (auto-detects nearby Rubber Otter BLE device)
rubberotter vibrate 200

# Specify target BLE MAC address or UUID
rubberotter --ble-address 60F9F128-5B7C-1258-10D5-2694444599B7 vibrate 200
# or short option
rubberotter -b 60F9F128-5B7C-1258-10D5-2694444599B7 type "Hello World\n"

# Explicit USB Serial mode (if USB connected)
rubberotter --port /dev/cu.usbmodem14101 vibrate 200
```

---

## Subcommands Reference

### 1. `scan`
Discovers nearby Bluetooth LE devices and connected USB Serial ports.

```bash
rubberotter scan
rubberotter scan --mode ble
rubberotter scan --json
```

### 2. `send`
Transmits raw framed command payloads over BLE.

```bash
rubberotter send "delay 100"
rubberotter send -b 60F9F128-5B7C-1258-10D5-2694444599B7 "jiggler toggle"
```

### 3. `type`
Types text payload via USB HID Keyboard.

```bash
rubberotter type "Hello World\n"
```

### 4. `macro`
Manages EEPROM persistent macro slots (`m0`..`m5`).

```bash
rubberotter macro list
rubberotter macro save m0 'type "pass123\n"'
rubberotter macro run m0
```

### 5. `jiggler`
Controls non-blocking Mouse Jiggler mode.

```bash
rubberotter jiggler toggle
rubberotter jiggler start
rubberotter jiggler stop
```

### 6. `vibrate`
Triggers vibration motor haptic burst (in ms).

```bash
rubberotter vibrate 200
```

### 7. `shell`
Launches interactive REPL console over BLE with auto-completion.

```bash
rubberotter shell
rubberotter shell -b 60F9F128-5B7C-1258-10D5-2694444599B7
```

### 8. `serve`
Launches Rubber Otter Web Dashboard Server.

```bash
rubberotter serve --host 127.0.0.1 --web-port 8080
```
