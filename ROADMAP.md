# Engineering Roadmap

Delivered milestones and planned technical work for RubberOtter (`ATmega32U4` + `HM-10`/`ESP32` hardware, Caterina 1200 bps Web Serial flasher, and `rubberotter` Python SDK/CLI/MCP).

---

## Delivered Milestones

### v1.0.x – v1.2.x: Core ATmega32U4 Firmware & Framing
- ATmega32U4 firmware (`firmware/`) with native USB HID keyboard and mouse emulation.
- RubberOtter v1 binary framing (`STX`/`VER`/`SEQ`/`LEN`/`PAYLOAD`/`XOR`/`ETX`) with 6-byte ACK responses and single-byte fallback shortcuts (`0x11`–`0x85`).
- 512-byte UART ring buffer state machine for `Serial1` (`9600` baud).
- EEPROM non-volatile macro storage (`m0`–`m5`) and background mouse jiggler task.

### v1.3.x: Python SDK, CLI & MCP Server
- `rubberotter` Python package (`python/`) supporting BLE GATT (`0xFFE0`/`0xFFE1` via Bleak) and USB CDC Serial (PySerial).
- Command-line interface (`rubberotter`, `otter-cli`) and stdio Model Context Protocol (MCP) server exposing 13 hardware AI tools.
- Automated PyPI publishing via Trusted Publishing.

### v1.4.0: Hardware-Focused Split & Editorial Docs
- Decoupled control PWA and Capacitor 8 mobile apps into [RubberDeck](https://github.com/AtaCanYmc/RubberDeck).
- Extracted zero-build static Caterina 1200 bps Web Serial Flasher and live payload simulator into `site/` (GitHub Pages).
- Unified Release Please versioning (`vX.Y.Z`) with automatic ATmega32U4 `.hex` release assets, PyPI Trusted Publishing, and Homebrew distribution (`AtaCanYmc/tap/rubberotter`).
- Single-chip ESP32-S3 successor shipped separately as [RubberOrca](https://github.com/AtaCanYmc/RubberOrca).
- Editorial HTML + SVG architecture, sequence, wiring, and MCP diagrams in `docs/assets/`.

---

## Planned Milestones

### v1.5.x: Firmware Reliability & Direct Browser Flashing
- Direct AVR109 / STK500 Intel HEX streaming inside `site/` so ATmega32U4 boards flash without external CLI tools.
- Automated PlatformIO host-side unit tests for `PacketParser` and `CommandExecutor` in CI.
- Configurable UART baud rate presets between ATmega32U4 `Serial1` and ESP32/HM-10 bridges.
- One-click release `.hex` fetching from GitHub Releases directly inside the Web Serial flasher.

### v1.6.x: Developer Experience & Diagnostics
- Live serial telemetry & ACK latency inspector in `site/` and `otter-cli doctor`.
- Prebuilt signed binaries and reproducible firmware checksums (`SHA256SUMS`) on every release.
- MCP tool schema validation and structured error codes for autonomous AI agent retries.
- Hardware Bill of Materials (BOM) and 3D-printable enclosure (`.stl`) for Pro Micro + HM-10 + haptic motor.
- Live hardware demo GIF/video and GitHub social preview in `README.md`.

### v2.0.0: Protocol Hardening & Internationalization
- Optional authenticated session layer for BLE frames on bridge modules with sufficient RAM.
- Replay protection via monotonic sequence windows.
- Non-US HID keymap translation tables selectable in firmware for ATmega32U4 targets.
