# 🌐 RubberOtterPy — Web Dashboard & REST API Reference

The **OtterDeck** Web Dashboard is an embedded single-page application and REST API server for controlling Rubber Otter microcontrollers directly from your web browser over **Bluetooth LE (BLE)** or USB CDC Serial.

---

## 🚀 Launching the Web Dashboard

```bash
rubberotter serve --web-port 8080
```
Open **[http://localhost:8080](http://localhost:8080)** in your web browser.

---

## 🎨 Features & Interface Deck

- 📡 **Device Scanner Card**: Scans BLE devices (`BT05` / `Otter`) and USB CDC Serial ports with 1-click connect.
- ⚙️ **Raw & No-ACK Mode Toggles**: Checkbox options to transmit raw un-framed string commands or skip ACK waiting for custom Arduino sketches.
- 📳 **Haptics & Jiggler Controls**: Slider for vibration motor bursts (ms) and Mouse Jiggler toggle badge.
- 🎵 **Media & Music Control Deck**: Dedicated deck for Play/Pause, Next Track, Prev Track, Volume Up, Volume Down, and Mute.
- 📊 **Presentation Control Deck**: Dedicated presenter clicker deck for Start (F5), Next Slide, Prev Slide, Black Screen (B), White Screen (W), and Exit (Esc).
- 🖱️ **Virtual Mouse & Scroll Deck**: Mouse Clicker (Left/Right) & Scroll Wheel actions.
- ⌨️ **Keyboard Typing & Raw Executor**: Text box for typing strings via USB HID and raw frame testing.
- 📡 **BLE Name Configuration**: Card to update the advertised Bluetooth name on HM-10/BT05 modules.
- 💾 **EEPROM Macro Manager**: Cards for slots `m0`..`m5` with Read, Edit, Reload, and Run actions.
- 📟 **Live Log Console**: Real-time packet log stream with ACK status indicators.

---

## 🔌 Complete REST API Endpoints

| Endpoint | Method | Description | Example Request Body |
| :--- | :--- | :--- | :--- |
| `/api/scan` | `GET` | Scans BLE devices & USB Serial ports | `?timeout=2.5&target=Otter` |
| `/api/status` | `GET` | Returns active connection status & target | — |
| `/api/connect` | `POST` | Connects to specified BLE device or USB port | `{"ble_address": "60F9F128-5B7C-1258-10D5-2694444599B7"}` |
| `/api/disconnect` | `POST` | Disconnects from active device | — |
| `/api/send` | `POST` | Transmits payload command string | `{"cmd": "type \"Hello\n\"", "raw": false, "no_ack": false}` |
| `/api/type` | `POST` | Types text payload string | `{"text": "Hello World"}` |
| `/api/press` | `POST` | Presses a single key | `{"key": "enter"}` |
| `/api/combo` | `POST` | Triggers key combination sequence | `{"keys": ["press", "GUI", "space"]}` |
| `/api/mouse` | `POST` | Controls virtual mouse click / move / wheel | `{"action": "click", "button": "left"}` |
| `/api/jiggler` | `POST` | Toggles/starts/stops Mouse Jiggler | `{"action": "toggle"}` |
| `/api/vibrate` | `POST` | Triggers vibration motor haptic burst | `{"duration": 150}` |
| `/api/ble-name` | `POST` | Configures advertised BLE module name | `{"name": "Otter_Pro"}` |
| `/api/macro/list` | `GET`/`POST` | Lists persistent EEPROM macros | — |
| `/api/macro/run` | `POST` | Runs EEPROM macro slot | `{"slot": "m0"}` |
| `/api/macro/save`| `POST` | Saves command to EEPROM macro slot | `{"slot": "m0", "body": "type \"pass123\n\""}` |
