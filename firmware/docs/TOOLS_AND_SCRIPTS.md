# 🛠️ Rubber Otter — Helper Tools & Scripts Documentation

This document provides comprehensive technical documentation for all helper scripts included in the `scripts/` directory of the Rubber Otter project. These scripts assist with device discovery, framed packet testing, and local Continuous Integration (CI) builds.

---

## 📌 Table of Contents

- [1. Device Scanner (`scripts/scan_devices.py`)](#1-device-scanner-scriptsscan_devicespy)
  - [Overview](#overview)
  - [Prerequisites](#prerequisites)
  - [CLI Arguments](#cli-arguments)
  - [Usage Examples](#usage-examples)
  - [Detection Logic](#detection-logic)
- [2. Framed Packet Sender (`scripts/send_packet.py`)](#2-framed-packet-sender-scriptssend_packetpy)
  - [Overview](#overview-1)
  - [Protocol Frame Layout](#protocol-frame-layout)
  - [CLI Arguments](#cli-arguments-1)
  - [Usage Examples](#usage-examples-1)
  - [ACK Packet Format](#ack-packet-format)
- [3. Local CI Build Script (`scripts/ci-local.sh`)](#3-local-ci-build-script-scriptsci-localsh)
  - [Overview](#overview-2)
  - [Usage](#usage)
  - [Target Environments](#target-environments)

---

## 1. Device Scanner (`scripts/scan_devices.py`)

### Overview
`scripts/scan_devices.py` is a cross-platform Python utility designed to discover Rubber Otter devices across two transport channels:
1. **USB Serial Ports**: Scans connected USB CDC / Serial COM ports and identifies ATmega32U4 microcontrollers (SparkFun Pro Micro / Arduino Leonardo).
2. **Bluetooth Low Energy (BLE)**: Scans nearby BLE advertisements and filters for the HM-10 BLE module (default advertised device name: `Otter`, `HMSoft`, or `MLT-BT05`).

### Prerequisites
Install optional helper dependencies for full hardware identification and BLE scanning:
```bash
pip3 install pyserial bleak
```
*Note: If `pyserial` or `bleak` are missing, the script gracefully falls back to system device globbing for `/dev/tty.*` ports.*

### CLI Arguments

| Argument | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `--mode` | `string` | `all` | Scan target mode: `serial` (USB ports only), `ble` (Bluetooth LE only), or `all` (both). |
| `--target` | `string` | `Otter` | Case-insensitive device name filter for BLE scanning. |
| `--timeout` | `float` | `5.0` | BLE advertisement discovery duration in seconds. |

### Usage Examples

#### Run complete scan (USB Serial + BLE):
```bash
python3 scripts/scan_devices.py --mode all
```

#### Scan USB Serial ports only:
```bash
python3 scripts/scan_devices.py --mode serial
```

#### Scan for BLE devices with a custom name and 10s timeout:
```bash
python3 scripts/scan_devices.py --mode ble --target Otter --timeout 10.0
```

### Detection Logic

- **USB Serial Matching**: Matches Vendor ID (VID) and Product ID (PID) against known board profiles:
  - `1b4f:9204`: SparkFun Pro Micro 5V/16MHz
  - `1b4f:9203`: SparkFun Pro Micro 3.3V/8MHz
  - `2341:8036`: Arduino Leonardo
  - Matches keywords in hardware descriptions: `usbmodem`, `usbserial`, `promicro`, `leonardo`, `atmega32u4`.
- **BLE Matching**: Filters local device names and advertisement data matching `Otter`, `HMSoft`, `MLT-BT05`, or `HM-10`, displaying the device MAC/UUID and RSSI signal strength (dBm).

---

## 2. Framed Packet Sender (`scripts/send_packet.py`)

### Overview
`scripts/send_packet.py` allows developers to test Rubber Otter command execution over a Serial interface by framing raw payload commands, computing XOR checksums, transmitting over UART, and waiting for an Acknowledgement (ACK) packet from the microcontroller.

### Protocol Frame Layout

The script packages command strings into binary frames structured as follows:

```text
+------+---------+-----+---------+---------+---------+----------+------+
| STX  | VERSION | SEQ | LEN_HI  | LEN_LO  | PAYLOAD | CHECKSUM | ETX  |
| 0x02 |  0x01   | 1B  |   1B    |   1B    |   N B   |  XOR 1B  | 0x03 |
+------+---------+-----+---------+---------+---------+----------+------+
```

### CLI Arguments

| Argument | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `port` | `string` | **Yes** | — | Target serial port path (e.g., `/dev/tty.usbmodem14101` or `COM3`). |
| `--cmd` | `string` | **Yes** | — | Command payload string (e.g. `type "Hello World\n"`). |
| `--baud` | `int` | No | `9600` | Serial baud rate (matches HM-10 default baud rate). |
| `--seq` | `int` | No | `1` | Sequence number (0–255) for frame tracking. |
| `--timeout` | `float` | No | `1.0` | Timeout in seconds to wait for an ACK response. |
| `--retries` | `int` | No | `2` | Number of retry attempts upon response timeout. |

### Usage Examples

#### Send a basic keyboard typing command:
```bash
python3 scripts/send_packet.py /dev/tty.usbmodem14101 --cmd 'type "Hello World\n"' --seq 1
```

#### Trigger a key combination (e.g., Command + Space):
```bash
python3 scripts/send_packet.py /dev/tty.usbmodem14101 --cmd 'press GUI space' --seq 2
```

#### Execute an EEPROM macro (e.g., macro m0):
```bash
python3 scripts/send_packet.py /dev/tty.usbmodem14101 --cmd 'run m0' --seq 3
```

### ACK Packet Format

Upon receiving and validating a frame, Rubber Otter replies with a 6-byte ACK packet:

```text
+------+---------+-----+--------+------+------+
| STX  | VERSION | SEQ | STATUS | CODE | ETX  |
| 0x02 |  0x01   | 1B  |  0x00  | 0x00 | 0x03 |
+------+---------+-----+--------+------+------+
```
- **STATUS `0x00`**: Success / Executed clean.
- **STATUS `0x01`**: Checksum error / Invalid frame.
- **STATUS `0x02`**: Unknown or malformed command payload.

---

## 3. Local CI Build Script (`scripts/ci-local.sh`)

### Overview
`scripts/ci-local.sh` is a shell script that reproduces the full GitHub Actions CI matrix on a local workstation. It sequentially builds all four target PlatformIO environments defined in `platformio.ini`.

### Usage
Make the script executable and execute:
```bash
chmod +x scripts/ci-local.sh
./scripts/ci-local.sh
```

### Target Environments

1. **`leonardo`**: Standard Arduino Leonardo (ATmega32U4 16MHz).
2. **`leonardo_hid`**: Arduino Leonardo with `HID-Project` library enabled (`-D USE_HID_PROJECT`).
3. **`pro_micro`**: SparkFun Pro Micro 5V/16MHz (`sparkfun_promicro16`).
4. **`pro_micro_hid`**: SparkFun Pro Micro 5V/16MHz with `HID-Project` library enabled (`-D USE_HID_PROJECT`).

Artifacts are compiled into `.pio/build/<env>/firmware.hex`.
