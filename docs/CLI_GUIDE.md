# 🛠️ RubberOtterPy — CLI User Guide & Command Manual

The `rubberotter` CLI utility provides command-line control for hardware scanning, packet transmission, EEPROM macro management, REPL interactive console, and starting the Web Dashboard.

---

## 📌 Usage Overview

```bash
rubberotter [subcommand] [options]
# or
python3 -m rubberotter [subcommand] [options]
```

---

## Subcommands Reference

### 1. `scan`
Discovers connected USB Serial ports and Bluetooth LE devices.

```bash
rubberotter scan
rubberotter scan --mode serial
rubberotter scan --json
```

### 2. `send`
Transmits raw framed command payloads.

```bash
rubberotter send "delay 100"
rubberotter send --json "jiggler toggle"
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
Launches interactive REPL console with auto-completion.

```bash
rubberotter shell
```

### 8. `serve`
Launches Rubber Otter Web Dashboard Server.

```bash
rubberotter serve --host 127.0.0.1 --web-port 8080
```
