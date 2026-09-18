# Engineering Roadmap

This document outlines delivered milestones and planned technical objectives for the Rubber Otter ecosystem.

## Milestones

### Phase 1: Core Hardware Emulation and Framing (Completed)
- ATmega32U4 firmware supporting standard Keyboard.h and Mouse.h HID emulation.
- STX/ETX binary framing with XOR checksum validation.
- Ring buffer state machine handling UART baud rate fluctuations.
- EEPROM non-volatile macro storage across slots m0 through m5.
- Background non-blocking mouse jiggler task.

### Phase 2: Web Workstation and Zero-Install Flasher (Completed)
- React 18, Vite, TypeScript, and Tailwind CSS Progressive Web Application.
- Web Bluetooth GATT client connecting to HM-10 / ESP32 Service 0xFFE0.
- Web Serial API firmware flasher with Caterina 1200bps bootloader reset.
- Five interface localizations (EN, TR, DE, FR, ES) and dual-theme engine.
- GitHub Pages automated deployment pipeline.

### Phase 3: Mobile Packaging and Automation Decoupling (Completed)
- Native Capacitor 8 integration for Apple iOS (CoreBluetooth engine, Taptic feedback).
- Native Capacitor 8 integration for Google Android (BLE service, Vibrator haptics).
- Decoupled GitHub Actions release matrix for web, Android APK, and iOS unsigned IPA/App bundles.
- Python SDK packaging with Model Context Protocol (MCP) server and CLI tool.

### Phase 4: Protocol Hardening and Transport Security (Planned)
- AES-128-CTR payload encryption layer for over-the-air BLE frames.
- Replay attack mitigation via cryptographic nonces in sequence counters.
- BLE bonding and passkey authentication enforcement on supported BLE modules.
- Dynamic baud rate negotiation between MCU Serial1 and BLE peripheral.

### Phase 5: Hardware and Layout Expansion (Planned)
- Native WebUSB direct HID fallback for environments without Bluetooth.
- Dynamic keymap layout translation (ISO, ANSI, non-US layouts) executed in firmware.
- Support for RP2040 and ESP32-S3 direct USB native targets.
- Bi-directional telemetry streaming for hardware sensor readings.
