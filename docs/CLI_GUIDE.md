# 🛠️ RubberOtterPy — CLI User Guide & Command Manual

The `rubberotter` CLI utility provides command-line control for hardware scanning, packet transmission over **Bluetooth LE (BLE)** or USB Serial, EEPROM macro management, raw/no-ack payload options, interactive REPL console, and starting the Web Dashboard.

👉 **Master Capability & Command Reference**: **[`docs/CAPABILITIES_AND_COMMANDS.md`](file:///Users/atacan/PycharmProjects/RubberOtterPy/docs/CAPABILITIES_AND_COMMANDS.md)**

---

## 📌 Connection & Transport Modes

By default, `rubberotter` operates in **Bluetooth LE (BLE) mode**, auto-detecting and communicating directly with nearby Rubber Otter BLE devices (`BT05` / `Otter` / `HM-10`).

```bash
# 1. Automatic BLE Discovery & Connection (Default)
rubberotter vibrate 200

# 2. Target Specific Bluetooth LE Address (-b or --ble-address)
rubberotter -b 60F9F128-5B7C-1258-10D5-2694444599B7 vibrate 200

# 3. Raw Payload Mode (--raw) — Un-framed strings for custom Arduino sketches
rubberotter send "vibrate 200" --raw --no-ack

# 4. No-ACK Mode (--no-ack) — Transmit payload without waiting for ACK response
rubberotter type "Hello" --no-ack

# 5. Explicit USB Serial Mode (--port)
rubberotter --port /dev/cu.usbmodemHIDFG1 vibrate 200
```

---

## 📋 Complete Subcommands Reference

### 1. `scan`
Discovers nearby Bluetooth LE devices and connected USB Serial ports.

```bash
# Scan all BLE devices & USB ports
rubberotter scan

# Scan only BLE devices with custom timeout
rubberotter scan --mode ble --scan-timeout 3.0

# Output machine-readable JSON format
rubberotter scan --json
```

---

### 2. `send`
Transmits raw command payloads or custom string frames over BLE or Serial.

```bash
# Send framed command
rubberotter send "delay 100"

# Send chained command
rubberotter send "vibrate 150 && type \"Hello\\n\""

# Send un-framed raw string command without waiting for ACK
rubberotter send "vibrate 200" --raw --no-ack
```

---

### 3. `type`
Types text payload via USB HID Keyboard emulation (unescapes `\n`, `\t`, `\"`).

```bash
# Type simple string
rubberotter type "Hello World\n"

# Type terminal command and execute
rubberotter type "curl -s https://example.com | bash\n"
```

---

### 4. `vibrate`
Triggers vibration motor haptic burst for duration in milliseconds.

```bash
rubberotter vibrate 200
rubberotter vibrate 500
```

---

### 5. `jiggler`
Controls background non-blocking Mouse Jiggler mode.

```bash
# Toggle Jiggler ON/OFF
rubberotter jiggler toggle

# Explicit Start or Stop
rubberotter jiggler start
rubberotter jiggler stop
```

---

### 6. `macro`
Manages persistent EEPROM macro slots (`m0`..`m5`) stored on the microcontroller.

```bash
# List all EEPROM macro slots
rubberotter macro list

# Save command sequence into slot m0
rubberotter macro save m0 'vibrate 150 && type "Password123\n"'

# Execute macro slot m0
rubberotter macro run m0
```

---

### 7. `ble-name`
Configures new advertised Bluetooth LE name on HM-10/BT05 modules.

```bash
rubberotter ble-name "Otter_Pro"
```

---

### 8. `shell`
Launches an interactive REPL command prompt with auto-completion over BLE or Serial.

```bash
rubberotter shell
```

In the interactive shell:
```text
otter> vibrate 200
 ✔ ACK (seq=1)
otter> type "Hello World"
 ✔ ACK (seq=2)
otter> press GUI space
 ✔ ACK (seq=3)
otter> exit
```

---

### 9. `serve`
Launches the Rubber Otter Web Dashboard server (`OtterDeck`).

```bash
rubberotter serve --host 127.0.0.1 --web-port 8080
```
Open **[http://127.0.0.1:8080](http://127.0.0.1:8080)** in your web browser.
