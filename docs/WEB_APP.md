# 🌐 RubberOtterPy — Web Dashboard & REST API Reference

The **OtterDeck** Web Dashboard is an embedded single-page application and REST API server for controlling Rubber Otter microcontrollers directly from your web browser.

---

## 🚀 Launching the Web Dashboard

```bash
rubberotter serve --web-port 8080
```
Open **[http://localhost:8080](http://localhost:8080)** in your web browser.

---

## 🎨 Features & Interface Deck

- 🔌 **Live Device Scanner Card**: Lists detected USB Serial ports & BLE devices with auto-connect.
- ⚡ **Haptics & Quick Action Buttons**: Slider for vibration motor bursts (ms), Mouse Jiggler toggle badge, common key shortcuts (Enter, Tab, Backspace, Cmd+Space).
- ⌨️ **Keyboard Typing & Raw Executor**: Text box for typing strings via USB HID and raw frame testing.
- 💾 **EEPROM Macro Manager**: Cards for slots `m0`..`m5` with Read, Edit, and Run actions.
- 📟 **Live Log Console**: Real-time packet log stream with ACK status indicators.

---

## 🔌 REST API Endpoints

| Endpoint | Method | Description | Example Request Body |
| :--- | :--- | :--- | :--- |
| `/api/scan` | `GET` | Scans USB ports & BLE devices | — |
| `/api/status` | `GET` | Returns active connection status | — |
| `/api/connect` | `POST` | Connects to specified USB port | `{"port": "/dev/cu.usbmodemHIDFG1"}` |
| `/api/send` | `POST` | Transmits framed payload command | `{"cmd": "type \"Hello\n\""}` |
| `/api/jiggler` | `POST` | Toggles/starts/stops mouse jiggler | `{"action": "toggle"}` |
| `/api/vibrate` | `POST` | Triggers vibration motor | `{"duration": 150}` |
| `/api/macro/run` | `POST` | Runs EEPROM macro slot | `{"slot": "m0"}` |
| `/api/macro/save`| `POST` | Saves command to EEPROM macro slot| `{"slot": "m0", "body": "delay 10"}` |
