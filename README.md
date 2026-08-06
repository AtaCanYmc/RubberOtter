# Master-Key Bluetooth HID Bridge (RubberOtterWeb)

[![CI Pipeline](https://github.com/USERNAME/RubberOtterWeb/actions/workflows/ci.yml/badge.svg)](https://github.com/USERNAME/RubberOtterWeb/actions/workflows/ci.yml)
[![Deploy PWA](https://github.com/USERNAME/RubberOtterWeb/actions/workflows/cd-github-pages.yml/badge.svg)](https://github.com/USERNAME/RubberOtterWeb/actions/workflows/cd-github-pages.yml)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![Built with React & Vite](https://img.shields.io/badge/Stack-Vite%20%7C%20React%2018%20%7C%20TS-cyan)](https://vitejs.dev)

A modern, responsive **Progressive Web Application (PWA)** built with **Vite, React, TypeScript, and Tailwind CSS** that connects to an **HM-10 BLE module** over the Web Bluetooth API (`navigator.bluetooth`) to control a target host PC via USB HID (keyboard & mouse emulation).

---

## 📐 Control Flow & Architecture

```mermaid
graph TD
    subgraph Frontend["PWA Web Application (RubberOtterWeb)"]
        UI["Web App UI (Vite + React + Tailwind)"]
        BT_MGR["BluetoothManager / MockBleDriver"]
        ENC["Packet Encoder (0x11 - 0x85)"]
        
        UI -->|"User Action (Click/Touch)"| ENC
        ENC -->|"Encode Bytes [0x80, dx, dy]"| BT_MGR
    end

    subgraph Transport["Wireless & Serial Transport"]
        GATT["Web Bluetooth API (navigator.bluetooth)"]
        BLE["HM-10 BLE Module (Service: 0xffe0, Char: 0xffe1)"]
        UART["Serial1 UART @ 9600 Baud (TX1/RX1)"]
        
        BT_MGR -->|"GATT Write Characteristic"| GATT
        GATT -->|"BLE Wireless Signal"| BLE
        BLE -->|"Hardware Serial Payload"| UART
    end

    subgraph Backend["Arduino Firmware (ATmega32U4)"]
        ARDUINO["Arduino Pro Micro Microcontroller"]
        DECODER["Command Decoder Loop (switch-case)"]
        HID_LIB["USB HID Stack (<Keyboard.h> & <Mouse.h>)"]
        JIGGLER["Background Mouse Jiggler (millis timer)"]

        UART -->|"Serial1.read()"| ARDUINO
        ARDUINO --> DECODER
        DECODER -->|"HID Action"| HID_LIB
        JIGGLER -.->|"Periodic Micro-movement"| HID_LIB
    end

    subgraph Target["Target Host PC"]
        USB["USB Port (CDC HID Device)"]
        HOST["Target PC OS (Windows / Mac / Linux)"]

        HID_LIB -->|"USB HID Signal"| USB
        USB -->|"Emulated Keypress & Mouse Move"| HOST
    end

    style Frontend fill:#0f172a,stroke:#06b6d4,stroke-width:2px,color:#f8fafc
    style Transport fill:#070a12,stroke:#38bdf8,stroke-width:2px,color:#f8fafc
    style Backend fill:#1e1b4b,stroke:#818cf8,stroke-width:2px,color:#f8fafc
    style Target fill:#064e3b,stroke:#34d399,stroke-width:2px,color:#f8fafc
```

---

## ✨ Features

- 🎵 **Media Remote**: Big tactile buttons for Play/Pause, Next/Prev Track, Volume Up/Down, and Mute with animated audio spectrum bars.
- 📊 **Presentation Remote**: Slide advance controls (Left/Right Arrows), Fullscreen toggle (`F5`), Blank screen (`B`), and an integrated presentation stopwatch timer.
- 🔒 **Security & Utilities**: Workstation Lock (`Win + L`), Mouse Jiggler toggle switch with customizable interval timers, Task Manager shortcut (`Ctrl+Shift+Esc`), and Show Desktop (`Win+D`).
- 🎮 **Gaming & Custom Macros**: Built-in CS Armor & Helmet Buy macro (`0x41`) + Interactive Custom Macro Builder saved in `localStorage`.
- 🖱️ **Virtual Trackpad**: Interactive touch surface supporting multi-touch gestures (single tap for Left Click `0x81`, 2-finger tap for Right Click `0x82`), cursor tracking, scroll controls (`0x84`, `0x85`), and sensitivity slider (1.0x - 5.0x).
- 🤖 **In-Browser Hardware Simulator**: Toggleable Mock Driver allowing full app testing without needing a physical HM-10 module connected.
- 📜 **GATT Packet Terminal**: Live stream of all transmitted packets with timestamp, log category (`tx`, `info`, `warn`, `error`), Hex payload view, and copy logs functionality.
- 🔊 **Tactile Feedback**: Synthesized Web Audio API mechanical click sounds & mobile Web Haptics (`navigator.vibrate`).

---

## 🗺️ Single-Byte Protocol Map

| Mode | Command Action | Hex Code | Host HID Execution |
| :--- | :--- | :--- | :--- |
| **Media** | Play / Pause | `0x11` | Media Play/Pause key |
| | Next Track | `0x12` | Media Next Track |
| | Previous Track | `0x13` | Media Previous Track |
| | Volume Up | `0x14` | Media Volume Up |
| | Volume Down | `0x15` | Media Volume Down |
| | Mute Toggle | `0x16` | Media Mute |
| **Presentation** | Next Slide | `0x21` | Right Arrow (`KEY_RIGHT_ARROW`) |
| | Previous Slide | `0x22` | Left Arrow (`KEY_LEFT_ARROW`) |
| | Fullscreen | `0x23` | F5 (`KEY_F5`) |
| **Security** | Lock Screen | `0x31` | Windows + L (`KEY_LEFT_GUI` + `l`) |
| | Mouse Jiggler | `0x32` | Toggle non-blocking periodic mouse micro-movement |
| | Task Manager | `0x33` | Ctrl + Shift + Esc |
| | Show Desktop | `0x34` | Windows + D |
| **Gaming** | CS Buy Macro | `0x41` | Press `'b'` -> delay -> `'4'` -> delay -> `'2'` |
| **Trackpad** | Move Packet | `0x80` | `[0x80, deltaX, deltaY]` relative move |
| | Left Click | `0x81` | `Mouse.click(MOUSE_LEFT)` |
| | Right Click | `0x82` | `Mouse.click(MOUSE_RIGHT)` |
| | Middle Click | `0x83` | `Mouse.click(MOUSE_MIDDLE)` |
| | Scroll Up | `0x84` | `Mouse.move(0, 0, 1)` |
| | Scroll Down | `0x85` | `Mouse.move(0, 0, -1)` |

---

## ⚡ Quick Start

### 1. Installation
```bash
git clone https://github.com/USERNAME/RubberOtterWeb.git
cd RubberOtterWeb
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open `http://localhost:3000` in Chrome, Edge, or Bluefy on iOS.

### 3. Production Build
```bash
npm run build
```

---

## 🔌 Hardware Wiring Diagram

```mermaid
graph LR
    subgraph HM10["HM-10 BLE Module"]
        HM_TX["TX Pin"]
        HM_RX["RX Pin"]
        HM_VCC["VCC (3.3V / 5V)"]
        HM_GND["GND"]
    end

    subgraph Divider["Voltage Divider (5V -> 3.3V Logic)"]
        R1["Resistor 1kΩ"]
        R2["Resistor 2kΩ / GND"]
        HM_RX <--- R1
        R1 <--- R2
    end

    subgraph Micro["Arduino Pro Micro (ATmega32U4)"]
        ARD_RX1["Pin 0 (RX1)"]
        ARD_TX1["Pin 1 (TX1)"]
        ARD_VCC["VCC (5V)"]
        ARD_GND["GND"]
        ARD_USB["Micro-USB Port"]
    end

    subgraph PC["Target Host PC"]
        HOST_USB["USB Type-A / Type-C Port"]
    end

    HM_TX -->|"UART Serial Direct"| ARD_RX1
    ARD_TX1 -->|"5V TX Signal"| R1
    ARD_VCC -->|"Power Line"| HM_VCC
    ARD_GND -->|"Common Ground"| HM_GND
    R2 -->|"Ground Connection"| ARD_GND

    ARD_USB ===|"USB HID Cable"| HOST_USB

    style HM10 fill:#0f172a,stroke:#06b6d4,stroke-width:2px,color:#f8fafc
    style Divider fill:#312e81,stroke:#a5b4fc,stroke-width:2px,color:#f8fafc
    style Micro fill:#1e1b4b,stroke:#818cf8,stroke-width:2px,color:#f8fafc
    style PC fill:#064e3b,stroke:#34d399,stroke-width:2px,color:#f8fafc
```

---

## 📜 License

This project is licensed under the [Apache License 2.0](LICENSE).
