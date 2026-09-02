<p align="center">
  <img src="../docs/assets/banner.jpg" alt="RubberOtterWeb Banner" width="100%" />
</p>

# 🦦 RubberOtterWeb — Precision Bluetooth HID Workstation & Mobile App

[![CI Pipeline](https://github.com/AtaCanYmc/RubberOtter/actions/workflows/ci-web.yml/badge.svg)](https://github.com/AtaCanYmc/RubberOtter/actions/workflows/ci-web.yml)
[![Deploy PWA](https://github.com/AtaCanYmc/RubberOtter/actions/workflows/cd-github-pages.yml/badge.svg)](https://github.com/AtaCanYmc/RubberOtter/actions/workflows/cd-github-pages.yml)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](../LICENSE)
[![Built with React & Vite](https://img.shields.io/badge/Stack-Vite%20%7C%20React%2018%20%7C%20TS-cyan)](https://vitejs.dev)
[![Capacitor Native](https://img.shields.io/badge/Mobile-Capacitor%206%2B%20(iOS%20%26%20Android)-blue)](https://capacitorjs.com)

**RubberOtterWeb** is a high-performance **Progressive Web Application (PWA)** and **Native Mobile App (iOS & Android)** built with **Vite, React 18, TypeScript, Tailwind CSS, and Ionic Capacitor 6+**.

It interfaces directly with the **Rubber Otter ATmega32U4 microcontroller** over Bluetooth Low Energy (HM-10 / ESP32 GATT Service `0xFFE0`) to wirelessly control host PCs (Windows, macOS, Linux) via plug-and-play USB HID keyboard and mouse emulation.

---

## 🌟 Key Features

- 🎯 **Header-Integrated Navigation**: Modern single-pane desktop tab switching seamlessly built into the sticky header + ergonomic mobile bottom touch bar.
- 📱 **Native Mobile Packaging (Capacitor 6+)**:
  - **Apple iOS**: Native **CoreBluetooth** engine (bypassing Safari WKWebView limitations) + **Apple Taptic Engine** haptics.
  - **Google Android**: Native Android BLE + Vibrator service.
- 🌍 **5 Language Localizations**: Instant zero-reload switching between **English (🇬🇧)**, **Türkçe (🇹🇷)**, **Deutsch (🇩🇪)**, **Français (🇫🇷)**, and **Español (🇪🇸)**.
- 🌓 **Adaptive Dual-Theme Engine**: Obsidian Dark (`#09090b`), Clean White (`#ffffff`), and system auto-sync with edge-to-edge mobile status bar theming.
- ⌨️ **Keystroke Injector**: Fast typing stream injector, auto-enter toggle, snippet presets (Spotlight, Notepad, System Info), and duration estimation.
- 🎵 **Media Control Deck**: Big tactile buttons for Play/Pause, Next/Prev Track, Volume Up/Down, and Mute with animated audio spectrum bars.
- 📊 **Presentation Controller**: Slide navigation clicker (Left/Right Arrows), Fullscreen toggle (`F5`), Blank screen (`B`), and an integrated presentation stopwatch timer.
- 🔒 **Security & Workstation Lock**: Workstation lock (`Win+L` / `Ctrl+Cmd+Q`), non-blocking mouse jiggler toggle, Task Manager shortcut (`Ctrl+Shift+Esc` / `Cmd+Opt+Esc`), and Show Desktop.
- 🎮 **Gaming & Custom Macro Builder**: Built-in CS Buy sequence (`0x41`) + interactive custom macro creator saved in persistent `localStorage`.
- 🖱️ **Precision Virtual Trackpad**: Multi-touch gestures (tap for Left Click, 2-finger tap for Right Click), cursor position indicator, scroll triggers, and sensitivity multiplier (1.0x - 5.0x).
- 📜 **GATT Packet Terminal**: Real-time packet telemetry console with byte counter, timestamp, Hex payload formatting, and copy log export.

---

## 📐 Architecture & Platform Bridge

```mermaid
graph TD
    UI[React 18 + Tailwind PWA UI] --> Bridge[Universal Platform Bridge (universalBle.ts)]
    Bridge -->|Desktop / Android Chrome| WebBLE[Web Bluetooth API + Web Vibration]
    Bridge -->|iOS Native App| CoreBT[Capacitor CoreBluetooth + Taptic Engine]
    Bridge -->|Android Native App| AndroidBLE[Capacitor Android BLE + Vibrator]
    
    WebBLE --> BLE[HM-10 / ESP32 GATT Service 0xFFE0]
    CoreBT --> BLE
    AndroidBLE --> BLE
    BLE --> MCU[ATmega32U4 USB HID Controller]
    MCU --> PC[Target Host PC]
```

---

## ⚡ Quick Start

### 1. Web Development
```bash
# Install dependencies
npm install

# Start Vite local development server
npm run dev
```
Open `http://localhost:3000` in Google Chrome, Microsoft Edge, or Opera.

### 2. Native Mobile Sync & IDE Launch
```bash
# Compile and sync to iOS & Android native projects
npm run cap:sync

# Open in Xcode (iOS)
npm run cap:open:ios

# Open in Android Studio (Android)
npm run cap:open:android
```

---

## 🗺️ Single-Byte Protocol Map

| Category | Action | Hex Code | Host HID Execution |
| :--- | :--- | :--- | :--- |
| **Media** | Play / Pause | `0x11` | Media Play/Pause key |
| | Next Track | `0x12` | Media Next Track |
| | Previous Track | `0x13` | Media Previous Track |
| | Volume Up / Down | `0x14` / `0x15` | Media Volume Up / Down |
| | Mute Toggle | `0x16` | Media Mute |
| **Presentation** | Next / Prev Slide | `0x21` / `0x22` | Right / Left Arrow |
| | Fullscreen / Black | `0x23` / `0x24` | F5 / 'B' |
| **Security** | Lock Screen | `0x31` | `Win + L` / `Ctrl + Cmd + Q` |
| | Mouse Jiggler | `0x32` | Periodic micro-movements |
| | Task Manager | `0x33` | `Ctrl + Shift + Esc` / `Cmd + Opt + Esc` |
| | Show Desktop | `0x34` | `Win + D` / `Cmd + F3` |
| | Vibration Pulse | `0x35` | Pin 2 haptic pulse |
| **Gaming** | CS Buy Macro | `0x41` | Buy chain (`'b' -> 4 -> 2`) |
| **Trackpad** | Move Packet | `0x80` | `[0x80, deltaX, deltaY]` relative vector |
| | Left / Right Click | `0x81` / `0x82` | `Mouse.click(MOUSE_LEFT / RIGHT)` |
| | Scroll Up / Down | `0x84` / `0x85` | `Mouse.move(0, 0, 1 / -1)` |

---

## 📜 License

This project is licensed under the [Apache License 2.0](../LICENSE).
