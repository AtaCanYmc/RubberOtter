# 📦 Rubber Otter — Unified Protocol Specification

The Rubber Otter ecosystem uses a hybrid communication protocol designed for low-latency, robust transmission over **Bluetooth Low Energy (HM-10 / BT05 GATT)** and **USB CDC Serial**.

---

## 1. Protocol Layers

1. **Framed ASCII Command Mode (`STX` .. `ETX`)**: High-level commands, variable-length text typing, macro management, delays, and chaining.
2. **Single-Byte Quick Action Mode (`0x11` .. `0x85`)**: Ultra-low-latency 1-byte payloads for real-time media controls, presentation remotes, mouse clicks, and gestures.

---

## 2. Framed ASCII Packet Structure

Every multi-byte command frame follows this strict framing format:

```text
+----------+---------+------------+----------+----------+----------+
| STX      | VERSION | LENGTH     | PAYLOAD  | CHECKSUM | ETX      |
| (1 Byte) | (1 Byte)| (2 Bytes)  | (N Bytes)| (1 Byte) | (1 Byte) |
| 0x02     | 0x01    | Little-End | ASCII    | XOR Sum  | 0x03     |
+----------+---------+------------+----------+----------+----------+
```

### Field Definitions

| Field | Size | Value | Description |
| :--- | :--- | :--- | :--- |
| **STX** | 1 byte | `0x02` | Start of Transmission marker |
| **VERSION** | 1 byte | `0x01` | Protocol specification version |
| **LENGTH** | 2 bytes | `uint16_t` | Little-endian payload byte count ($N \le 384$) |
| **PAYLOAD** | $N$ bytes | ASCII String | Raw command string (e.g. `type "Hello"\n`) |
| **CHECKSUM**| 1 byte | `uint8_t` | Cumulative XOR over `VERSION`, `LENGTH` bytes, and `PAYLOAD` bytes |
| **ETX** | 1 byte | `0x03` | End of Transmission marker |

### Checksum Calculation Algorithm

```python
def compute_checksum(version: int, length: int, payload: bytes) -> int:
    chk = version
    chk ^= (length & 0xFF)
    chk ^= ((length >> 8) & 0xFF)
    for byte in payload:
        chk ^= byte
    return chk
```

---

## 3. Framed Command Reference

Commands can be chained using `&&` or `;`.

| Command Syntax | Arguments / Options | Description |
| :--- | :--- | :--- |
| `type "<string>"` | Text string (supports `\n`, `\t`, `\"`, `\\`) | Types text via USB HID Keyboard |
| `press <key>` | `enter`, `tab`, `esc`, `gui`, `ctrl`, `f1`-`f12` | Single key tap |
| `hold <key>` | Modifier key name | Presses and holds a key |
| `release <key>` / `all` | Key name or `all` | Releases held key(s) |
| `combo <keys...>` | Space-delimited key list (e.g., `gui r`) | Executes a multi-key simultaneous shortcut |
| `delay <ms>` | Milliseconds ($1 \le ms \le 65535$) | Pauses execution on MCU |
| `vibrate <ms>` | Milliseconds ($10 \le ms \le 1000$) | Triggers haptic vibration pulse |
| `mouse click <btn>` | `left`, `right`, `middle` | Virtual mouse click |
| `mouse move <x> <y> [w]` | Delta X, Delta Y, Scroll wheel | Moves cursor or scrolls relative to current position |
| `jiggler <cmd>` | `start`, `stop`, `toggle`, `status` | Controls non-blocking background mouse jiggler |
| `macro save <slot> <cmd>`| `m0` - `m5`, command string | Persists macro chain to EEPROM |
| `macro run <slot>` | `m0` - `m5` | Executes saved EEPROM macro |
| `macro list` | None | Returns contents of all 6 EEPROM macro slots |
| `ping` | None | Firmware connectivity probe (returns `ACK: pong`) |

---

## 4. Single-Byte Quick Action Codes

For instant latency without frame overhead (used by Web PWA trackpad, media, and presentation buttons):

| Category | Action | Hex Code | Host Execution |
| :--- | :--- | :--- | :--- |
| **Media** | Play / Pause | `0x11` | Media Play/Pause toggle |
| | Next Track | `0x12` | Next track media key |
| | Previous Track | `0x13` | Previous track media key |
| | Volume Up | `0x14` | Increment volume |
| | Volume Down | `0x15` | Decrement volume |
| | Mute Toggle | `0x16` | Mute toggle |
| **Presentation** | Next Slide | `0x21` | Right Arrow (`KEY_RIGHT_ARROW`) |
| | Previous Slide | `0x22` | Left Arrow (`KEY_LEFT_ARROW`) |
| | Fullscreen Slide | `0x23` | F5 (`KEY_F5`) |
| | Black / White Screen | `0x24` | Key `B` / `W` toggle |
| **Security** | Lock Screen | `0x31` | `Win + L` (Windows) / `Ctrl+Cmd+Q` (macOS) |
| | Mouse Jiggler Toggle | `0x32` | Toggles periodic subtle cursor movement |
| | Task Manager | `0x33` | `Ctrl + Shift + Esc` (Windows) |
| | Show Desktop | `0x34` | `Win + D` (Windows) |
| **Trackpad / Mouse** | Move Relative | `0x80` | Followed by 2 signed bytes: `[0x80, dX, dY]` |
| | Left Click | `0x81` | Mouse left click |
| | Right Click | `0x82` | Mouse right click |
| | Middle Click | `0x83` | Mouse middle click |
| | Scroll Up | `0x84` | Mouse wheel scroll up |
| | Scroll Down | `0x85` | Mouse wheel scroll down |
| **Gaming** | CS Buy Armor/Helmet | `0x41` | Quick buy sequence (`b` -> `4` -> `2`) |
