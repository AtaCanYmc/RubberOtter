# Rubber Otter — Firmware (Arduino)

This repository contains the Arduino firmware for Rubber Otter: a small HID-enabled device (ATmega32U4-based) that receives framed commands over a serial link (typically BLE / HM-10) and emits USB HID events (keyboard and optional media keys) and other side effects (vibration motor, macros saved in EEPROM).

This README explains the full system, wiring, command set, framing protocol, build instructions (PlatformIO and Arduino IDE), CLion tips (External Tools), continuous integration (GitHub Actions) and a simple host test script to send framed commands and wait for ACKs.

Table of contents
- Project overview and architecture
- Wiring and hardware notes
- Frame protocol (host ↔ device)
- Supported commands (syntax + examples)
- Macros and EEPROM behavior
- Build & upload (PlatformIO + Arduino IDE)
- CLion: Terminal vs External Tool setup
- Continuous Integration (GitHub Actions)
- Quick test: `scripts/send_packet.py` (usage example)
- Troubleshooting and tips


## Project overview and architecture

Rubber Otter runs on an ATmega32U4-based microcontroller (Arduino Leonardo or Pro Micro are supported). The firmware listens on a serial Stream (by default `Serial1` — hardware UART connected to an HM-10 BLE module). Each incoming framed packet is parsed by the Packet Parser module and passed to the Command Executor which executes a defined set of commands (typing text, pressing keys, controlling modifiers, vibrate motor, macro define/run, etc.).

Key modules (in `src/`):
- `Hardware.*` — hardware initialization and pin definitions (BLE serial pointer, vibration pin, optional SoftwareSerial).
- `Protocol.h` — framing constants (STX/ETX, version) and buffer limits.
- `PacketParser.*` — safe ring buffer and framed packet parsing.
- `CommandExecutor.*` — implements the supported command set and issues HID calls.
- `InputHelpers.*` — helper functions for typing, modifiers, media keys and help text.
- `MacroStore.*` — EEPROM-backed macro store (m0..m5).
- `Utils.*` — general helpers and ACK building.
- `RubberOtter.ino` — minimal `setup()` / `loop()` that wires the modules together.

The code is organized to follow single responsibility principles: parsing, execution, hardware, macro storage are separate modules so they are easier to test and maintain.


## Wiring and hardware notes

Recommended board: Arduino Leonardo or Pro Micro (ATmega32U4). Important wiring notes:
- HM-10 BLE module: power and logic levels must be 3.3V.
  - HM-10 VCC -> 3.3V
  - HM-10 GND -> GND
  - HM-10 TX -> MCU RX (Serial1 RX if using hardware UART). On Leonardo the hardware serial pins are different from Pro Micro — PlatformIO envs are provided for both.
  - HM-10 RX <- MCU TX (use a level shifter or voltage divider if the MCU/board operates at 5V)
- Vibration motor
  - Use a MOSFET (N-channel) or transistor to switch the motor. Do NOT drive the motor directly from the MCU pin.
  - Place a flyback diode or TVS across the motor to protect from inductive spikes.
  - Default vibration control pin: `VIB_PIN = 2` (see `Hardware.h`).

Pins and serial options
- Default BLE serial: `Serial1` (hardware). If you prefer `SoftwareSerial`, define `USE_SOFTSERIAL` in `platformio.ini` or compile flags and the code will use the SoftwareSerial pins defined in `Hardware.cpp`.

Safety
- Never power the HM-10 with 5V. Use 3.3V only.
- Protect HM-10 RX from 5V signals.
- Keep motor switching components separate from MCU pin (use MOSFET + gate resistor and pull-down).


## Frame protocol (host → device) and ACK (device → host)

All communication uses a small fixed framing format so the device can re-synchronize and the host can detect failures.

Transmit frame (host → device):
- STX: 0x02 (1 byte)
- VERSION: 0x01 (1 byte)
- SEQ: 1 byte sequence number (0..255) chosen by host to match ACKs
- LEN: 2 bytes, big-endian (payload length in bytes)
- PAYLOAD: ASCII command string (not null-terminated)
- CHECKSUM: 1 byte — XOR of all payload bytes
- ETX: 0x03 (1 byte)

Notes:
- Payload length must be ≤ payload limit defined in `Protocol.h` (e.g. 384 bytes). Because BLE MTU is often ~20 bytes the host should chunk frames appropriately or rely on a serial link that handles streaming. PacketParser uses an internal ring buffer to reassemble stream fragments.
- Host must retry if ACK not received within a timeout.

ACK frame (device → host):
- STX: 0x02
- VERSION: 0x01
- SEQ: same sequence byte sent by host
- STATUS: 1 byte — 1 = OK, 0 = ERROR
- CODE: 1 byte — error / result code (0 for success; non-zero for specific errors)
- ETX: 0x03

Possible device error codes (examples used in code):
- 1: generic parse/invalid syntax
- 2: payload length exceeds maximum
- 3: checksum mismatch

Host behavior recommendation: send frame, wait for ACK for up to ~500–1000 ms, on timeout retry 2–3 times then escalate.


## Command set (detailed) — exact syntax and examples

All commands are ASCII text in the payload. Commands are executed sequentially. Commands may be chained using `&&` or `;` inside a single payload (the executor executes left-to-right). Spaces separate arguments unless inside quoted strings.

Common syntactic rules:
- Strings: `type "some text"` — use double quotes to surround literal text. Inside a quoted string, `\\n` represents newline, `\\t` tab and `\\"` a literal double quote.
- Numeric arguments are plain decimal integers.
- Macro names: `m0`..`m5` refer to macro slots 0..5.

Supported commands (examples):

- `help` or `?`
  - Prints full help text to both Serial and BLE. Example: `help`

- `type "..."`
  - Types the literal characters to the USB host using `Keyboard.write`. Supports escapes: `\\n`, `\\t`, `\\"`.
  - Example: `type "Hello\\n"` (types Hello and Enter via newline escape — but consider also `enter` for explicit ENTER key).

- `delay N`
  - Delay for N milliseconds (blocks execution of command sequence). Example: `delay 200`

- `enter`, `tab`, `backspace`
  - Sends common control keys. Example: `enter`

- `press <modifier> <ms>`
  - Temporarily presses a modifier (shift, ctrl, alt, gui) for `<ms>` milliseconds then releases it.
  - Example: `press shift 50`

- `hold <modifier>` and `release <modifier>`
  - Hold keeps the modifier pressed until a later `release` call.
  - Example: `hold ctrl && type "a" && release ctrl`

- `vibrate N`
  - Vibrates the motor for N milliseconds (drives `VIB_PIN`). Example: `vibrate 100`

- `media <cmd>` (requires HID-Project / consumer support)
  - Multimedia commands: `play_pause`, `volume_up`, `volume_down`, `next`.
  - Example: `media play_pause`

- `macro define mX { ... }`
  - Saves the content between the nearest `{}` into macro slot `mX` where X is 0..5.
  - The body is stored as plain ASCII and later executed as a payload when running the macro.
  - Example: `macro define m0 { type "Hello" && enter }`

- `macro run mX`
  - Runs a previously saved macro slot.
  - Example: `macro run m0`

Chaining example
- `type "notepad" && enter && delay 200 && type "Hello"`
  - The executor will type `notepad`, press enter, wait 200 ms, and type `Hello`.

Return/ACK behavior
- After each top-level payload is parsed and executed the device sends an ACK with the sequence number. The ACK communicates success or a simple single-byte code for errors.


## Macros and EEPROM

- The firmware provides `MACRO_SLOTS` (defaults to 6, `m0`..`m5`) and each slot has a `MACRO_SLOT_SIZE` (e.g. 256 bytes) limit.
- Macros are written to EEPROM via `macro define` and read back with `macro run`.
- EEPROM writes are limited in lifetime — avoid excessively frequent writes.
- On first boot (if EEPROM magic missing) the firmware initializes macro slots to empty.


## Build & upload

PlatformIO (recommended)
- Install PlatformIO (pip recommended):

```bash
python3 -m pip install --user -U platformio
# or with Homebrew on macOS
brew install platformio
```

- Build for Leonardo (default env):

```bash
platformio run -e leonardo
```

- Build for Leonardo with HID-Project (multimedia keys):

```bash
platformio run -e leonardo_hid
```

- Build for Pro Micro:

```bash
platformio run -e pro_micro
```

- Upload to device (example using `leonardo` env):

```bash
platformio run -e leonardo -t upload
```

Notes:
- If using `pro_micro` and upload fails because the card did not enter bootloader, press/reset the board (double-tap reset) and re-run upload.
- Use `platformio run -e <env> -t upload -v` for verbose logs.

Arduino IDE
- Open `src/RubberOtter.ino` in Arduino IDE.
- Select board: `Arduino Leonardo` (or appropriate Pro Micro entry if you have a Pro Micro board package installed).
- Select correct serial port and upload.


## CLion integration (External Tools)

You can run PlatformIO commands inside CLion either via the integrated Terminal or by configuring External Tools.

1. Terminal (fast):
- View > Tool Windows > Terminal (or Alt+F12) and run the PlatformIO CLI commands above.

2. External Tool (single-click / shortcut):
- Preferences / Settings > Tools > External Tools
- Add a new tool, for example:
  - Name: `PlatformIO: Build (leonardo)`
  - Program: the full path to `platformio` (run `which platformio` to get it)
  - Arguments: `run -e leonardo`
  - Working directory: `$ProjectFileDir$`
- Repeat for `upload` with arguments `run -e leonardo -t upload`.
- Optionally bind keyboard shortcuts: Preferences > Keymap > External Tools > choose tool > Add Keyboard Shortcut.

Important: use the absolute path to the `platformio` binary in the External Tool `Program` field to avoid PATH issues inside CLion.


## Continuous Integration (GitHub Actions)

This repository includes a GitHub Actions workflow `.github/workflows/ci.yml` which builds a matrix of PlatformIO environments on each push/PR:
- Environments built: `leonardo`, `leonardo_hid`, `pro_micro`, `pro_micro_hid`.
- The CI publishes `firmware.hex` as artifacts for each environment.

To reproduce CI locally run the included helper script:

```bash
chmod +x scripts/ci-local.sh
./scripts/ci-local.sh
```


## Quick test utility: `scripts/send_packet.py`

A small Python helper is included at `scripts/send_packet.py` to create a properly framed packet, send it over a serial port and wait for an ACK.

Usage example (macOS/Unix):

```bash
pip3 install pyserial
python3 scripts/send_packet.py /dev/cu.usbmodemXXXX --cmd 'type "Hello\\n"' --seq 1
```

The script will print the device ACK frame and a short human-readable result.

(See the `scripts/` directory for the script source and arguments.)


## Troubleshooting & tips

- No ACK received:
  - Verify BLE link (HM-10) is connected and correct serial pins are used.
  - Make sure host sends frames that follow the framing exactly. Use `scripts/send_packet.py` to test.
  - Increase timeout and retries on the host side.

- Wrong keys typed / wrong layout:
  - HID-Project has various keyboard layouts. The firmware uses simple `Keyboard.write` behavior. If you need a different keyboard layout change the layout in `HID-Project` or adapt the `InputHelpers` functions.

- Macro data disappears:
  - Check EEPROM size on your board. Pro Micro usually has limited EEPROM — macro slot sizes are conservative but verify using `MACRO_SLOTS` and `MACRO_SLOT_SIZE` in `MacroStore.h`.

- Build errors regarding `Keyboard.h` vs `HID-Project`:
  - Use `leonardo_hid` / `pro_micro_hid` envs for HID-Project (multimedia) support, or `leonardo`/`pro_micro` for the simpler Keyboard API. The project already configures conditional includes for both.


## Security and reliability considerations

- Do not store secrets in EEPROM or send them in clear over BLE without encryption.
- Host should implement ACK/timeout/retry for reliability.
- Avoid writing macros to EEPROM at extremely high rates to prevent premature EEPROM wear.


## Contact / contribution

If you find issues or want to contribute features, open a GitHub issue or submit a pull request. Include the board used, PlatformIO environment, and reproduction steps for bugs.

---

End of README.
