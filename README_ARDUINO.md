Rubber Otter — Arduino side

Quick start
1. Open `RubberOtter.ino` in the Arduino IDE (or PlatformIO).
2. Wiring notes:
   - HM-10 (BLE module) TX -> Pro Micro RX (Serial1 RX pin). If using SoftwareSerial, pins 8/9 are configured in the sketch.
   - HM-10 RX -> Pro Micro TX (through a level shifter or resistor divider if your Pro Micro is 5V).
   - Vibration motor -> N-channel MOSFET (or NPN transistor) -> MCU pin `VIB_PIN` (default pin 2). Add diode/TVS if motor is inductive; use separate power rail if motor current is high.
   - Do NOT power HM-10 at 5V. HM-10 expects 3.3V on VCC and logic.

3. Optional compile flags (top of `RubberOtter.ino`):
   - `USE_SOFTSERIAL` — use SoftwareSerial on pins 8/9 instead of `Serial1`.
   - `USE_HID_PROJECT` — enable multimedia/consumer keys (requires HID-Project library).
   - `USE_USB_DEBUG` — accept framed packets over the USB CDC Serial (useful for desktop testing with the included Python sender).

Protocol overview (host <-> device)
- Framing: STX (0x02), VERSION (0x01), SEQ (1 byte), LEN (2 bytes big-endian), PAYLOAD (ASCII), CHECKSUM (XOR of payload bytes), ETX (0x03)
- ACK from device: STX, VERSION, SEQ, STATUS(1=OK,0=ERR), CODE, ETX
- Host should split the full framed packet into MTU-sized writes when using BLE (typical safe size 20 bytes). The device reassembles via internal ring buffer.

Commands supported (examples)
- type "Hello\n" — type text (supports simple escapes: \n, \t, \\")
- delay 200 — delay 200 ms
- enter / tab / backspace
- press shift 50 — press modifier for 50 ms (shift, ctrl, alt, gui)
- hold ctrl / release ctrl
- vibrate 100 — vibrate motor for 100 ms
- media play_pause / media volume_up — multimedia commands (requires HID-Project)
- macro define m0 { type "hello" && enter } — save macro to slot m0
- macro run m0 — run macro

Testing from desktop (USB)
- Build and flash sketch with `USE_USB_DEBUG` defined. Then run the included Python sender to send a framed packet over serial.

Example: send a typed message and Enter
- The Python sender example below sends: type "Hello from PC" && enter

Troubleshooting
- If nothing types on the host OS, ensure the Arduino appears as an HID device (some OS may need a reset after flashing).
- If HM-10 communication is flaky, check voltage levels and use a reliable hardware UART. Prefer `Serial1` on Pro Micro.

Security & safety
- Use ACK and retries in your host implementation.
- Limit macro sizes and number of writes to EEPROM to avoid wear.

Files in this folder
- `RubberOtter.ino` — main sketch
- `send_packet.py` — example Python script to send framed packets over USB serial when `USE_USB_DEBUG` is enabled


