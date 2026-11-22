# Engineering Roadmap

Delivered milestones and planned technical work for RubberOtter (`ATmega32U4` + `HM-10`/`ESP32` hardware, Web Serial flasher, and `rubberotter` Python SDK/CLI/MCP).

## Delivered Milestones

### v1.0.x - v1.2.x: Core ATmega32U4 Firmware and Framing
- ATmega32U4 firmware (`firmware/`) with USB HID keyboard and mouse emulation.
- RubberOtter v1 binary framing (`STX`/`VER`/`SEQ`/`LEN`/`PAYLOAD`/`XOR`/`ETX`) with 6-byte ACK responses and single-byte fallback shortcuts (`0x11`..`0x85`).
- 512-byte UART ring buffer state machine for `Serial1` (`9600` baud).
- EEPROM non-volatile macro storage (`m0`..`m5`) and background mouse jiggler task.

### v1.3.x: Python SDK, CLI, and MCP Server
- `rubberotter` Python package (`python/`) supporting BLE GATT (`0xFFE0`/`0xFFE1` via Bleak) and USB CDC Serial (PySerial).
- Command-line interface (`rubberotter`, `otter-cli`) and stdio Model Context Protocol (MCP) server.
- Automated PyPI publishing via Trusted Publishing.

### v1.4.0: Hardware-Focused Repository Split (ADR-20261122-01)
- Decoupled control PWA and Capacitor 8 mobile apps into the standalone [RubberDeck](https://github.com/AtaCanYmc/RubberDeck) repository.
- Extracted zero-build static Caterina 1200 bps Web Serial Flasher and live payload simulator into `site/` (GitHub Pages).
- Unified Release Please versioning (`vX.Y.Z`) with automatic ATmega32U4 `.hex` release assets, PyPI Trusted Publishing, and Homebrew formula distribution (`AtaCanYmc/tap/rubberotter`).
- Single-chip ESP32-S3 successor shipped separately as [RubberOrca](https://github.com/AtaCanYmc/RubberOrca).

## Planned Milestones

### v1.5.x: Firmware Reliability and Flasher Enhancements
- Direct AVR109 / STK500 Intel HEX streaming inside `site/` so ATmega32U4 boards flash without external CLI tools.
- Automated PlatformIO host-side unit tests for `PacketParser` and `CommandExecutor` in CI.
- Configurable UART baud rate presets between ATmega32U4 `Serial1` and ESP32/HM-10 bridges.

### v2.0.0: Protocol Hardening
- Optional authenticated session layer for BLE frames on bridge modules with sufficient RAM.
- Replay protection via monotonic sequence windows.
- Non-US keymap translation tables selectable in firmware for ATmega32U4 targets.
