# 🌐 RubberOtterPy — Web Dashboard & REST API Reference

The **OtterDeck** Web Dashboard is an embedded single-page application and REST API server for controlling Rubber Otter microcontrollers directly from your web browser over **Bluetooth LE (BLE)** or USB CDC Serial.

👉 **Master Capability & Command Reference**: **[`docs/CAPABILITIES_AND_COMMANDS.md`](file:///Users/atacan/PycharmProjects/RubberOtterPy/docs/CAPABILITIES_AND_COMMANDS.md)**

---

## 🚀 Launching the Web Dashboard

```bash
rubberotter serve --web-port 8080
```
Open **[http://localhost:8080](http://localhost:8080)** in your web browser.

---

## 🎨 Features & Interface Decks

- 📡 **Device Connection Deck**: BLE device (`BT05` / `Otter`) and USB CDC Serial port auto-scan & 1-click connect with button loaders.
- ⚙️ **Raw & No-ACK Mode Toggles**: Checkbox options to transmit raw un-framed string commands or skip ACK waiting for custom Arduino sketches.
- 📳 **Haptics & Jiggler Controls**: Slider for vibration motor bursts (50ms - 1000ms) and Mouse Jiggler toggle badge.
- 🎵 **Media & Music Control Deck**: Dedicated deck for Play/Pause, Next Track, Prev Track, Volume Up, Volume Down, and Mute.
- 📊 **Presentation Control Deck**: Dedicated presenter clicker deck for Start (F5), Next Slide, Prev Slide, Black Screen (B), White Screen (W), and Exit (Esc).
- 🖱️ **Virtual Mouse & Scroll Deck**: Mouse Clicker (Left/Right) & Scroll Wheel actions.
- ⌨️ **Keyboard Text Typing Deck**: Multi-line text box with Quick Example Presets.
- 💻 **Raw Command Executor Deck**: Raw payload input with Quick Command Presets.
- 💾 **EEPROM Persistent Macro Manager**: Cards for slots `m0`..`m5` with Read, Edit, Reload, and Run actions.
- 📟 **Live Log Feed**: Real-time packet execution log console with ACK indicators.

---

## 🔌 REST API Endpoints

| Endpoint | Method | Description | Example Request Body |
| :--- | :--- | :--- | :--- |
| `/api/scan` | `GET` | Scans BLE devices & USB ports | `?timeout=2.5` |
| `/api/status` | `GET` | Returns active connection status | — |
| `/api/connect` | `POST` | Connects to specified BLE or USB target | `{"ble_address": "60F9F128..."}` or `{"port": "/dev/cu.usbmodem1"}` |
| `/api/disconnect` | `POST` | Disconnects active hardware connection | — |
| `/api/send` | `POST` | Transmits framed command payload | `{"cmd": "vibrate 200", "raw": false, "no_ack": false}` |
| `/api/type` | `POST` | Types text payload via USB HID | `{"text": "Hello World\n"}` |
| `/api/press` | `POST` | Presses a single key | `{"key": "MEDIA_PLAY_PAUSE"}` or `{"key": "f5"}` |
| `/api/combo` | `POST` | Triggers key combination sequence | `{"keys": ["GUI", "space"]}` |
| `/api/mouse` | `POST` | Triggers virtual mouse action | `{"action": "click", "button": "left"}` or `{"action": "wheel", "wheel": 1}` |
| `/api/jiggler` | `POST` | Controls background Mouse Jiggler | `{"action": "toggle"}` |
| `/api/vibrate` | `POST` | Triggers vibration motor | `{"duration": 150}` |
| `/api/ble-name` | `POST` | Updates advertised BLE name | `{"name": "Otter_Pro"}` |
| `/api/macro/list`| `GET/POST`| Fetches all EEPROM macro slots | — |
| `/api/macro/run` | `POST` | Runs EEPROM macro slot | `{"slot": "m0"}` |
| `/api/macro/save`| `POST` | Saves command sequence to EEPROM slot | `{"slot": "m0", "body": "vibrate 150 && type \"Hello\\n\""}` |
