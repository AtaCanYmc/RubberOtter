#!/usr/bin/env python3
"""
Rubber Otter Device Scanner script.
Scans for connected USB Serial ports (ATmega32U4 / Pro Micro / Leonardo)
and nearby Bluetooth Low Energy (BLE) devices (HM-10 "Otter").

Usage:
    python3 scripts/scan_devices.py [--mode serial|ble|all] [--target Otter] [--timeout 5.0]

Requirements (optional but recommended):
    pip install pyserial bleak
"""

import argparse
import asyncio
import glob
import os
import sys
import time

# Known USB Vendor/Product IDs for ATmega32U4 boards
KNOWN_VID_PID = {
    "2341:8036": "Arduino Leonardo",
    "2341:0036": "Arduino Leonardo Bootloader",
    "1b4f:9204": "SparkFun Pro Micro 5V/16MHz",
    "1b4f:9206": "SparkFun Pro Micro",
    "1b4f:9203": "SparkFun Pro Micro 3.3V/8MHz",
    "2341:0037": "Arduino Micro",
    "2341:8037": "Arduino Micro",
}


def scan_serial_ports():
    """Scans available serial/USB ports for Rubber Otter devices."""
    print("=" * 60)
    print(" 🔌 SCANNING USB / SERIAL PORTS")
    print("=" * 60)

    found_ports = []

    try:
        import serial.tools.list_ports

        ports = serial.tools.list_ports.comports()
        if not ports:
            print("No serial ports detected.")
            return []

        for port in ports:
            hwid = port.hwid or ""
            desc = port.description or ""
            device = port.device

            vid_pid_str = ""
            if port.vid and port.pid:
                vid_pid_str = f"{port.vid:04x}:{port.pid:04x}".lower()

            is_candidate = False
            board_name = KNOWN_VID_PID.get(vid_pid_str, "")

            if board_name:
                is_candidate = True
            elif any(
                keyword in (device + desc + hwid).lower()
                for keyword in ["usbmodem", "usbserial", "leonardo", "promicro", "atmega32u4", "arduino"]
            ):
                is_candidate = True

            match_label = f" ★ [MATCH: {board_name or 'Rubber Otter Candidate'}]" if is_candidate else ""
            print(f" Port: {device}")
            print(f"   - Description: {desc}")
            print(f"   - HWID:        {hwid}{match_label}")
            print("-" * 60)

            found_ports.append({"device": device, "candidate": is_candidate, "board": board_name})

    except ImportError:
        print("[!] 'pyserial' module not found. Falling back to system device check.")
        print("[!] Install pyserial for detailed hardware info: pip install pyserial\n")

        # Fallback listing for macOS and Linux
        patterns = ["/dev/tty.usbmodem*", "/dev/tty.usbserial*", "/dev/ttyACM*", "/dev/ttyUSB*"]
        system_ports = []
        for pattern in patterns:
            system_ports.extend(glob.glob(pattern))

        if not system_ports:
            print("No candidate USB serial devices found in /dev/")
            return []

        for port in sorted(system_ports):
            print(f" Port: {port} ★ [Candidate USB Modem]")
            found_ports.append({"device": port, "candidate": True, "board": "USB Serial Device"})
        print("-" * 60)

    return found_ports


async def scan_ble_devices(target_name="Otter", timeout=5.0):
    """Scans for nearby Bluetooth Low Energy (BLE) devices matching target_name or HM-10 defaults."""
    print("=" * 60)
    print(f" 📡 SCANNING BLUETOOTH LE (BLE) DEVICES (Timeout: {timeout}s)")
    print("=" * 60)

    try:
        from bleak import BleakScanner
    except ImportError:
        print("[!] 'bleak' module not found. BLE scanning requires bleak.")
        print("[!] Install bleak using: pip install bleak\n")
        return []

    target_keywords = [target_name.lower(), "hmsoft", "mlt-bt05", "hm-10", "otter", "bt05"]
    seen_addresses = set()
    found_devices = []

    def callback(device, advertising_data):
        name = device.name or advertising_data.local_name or "Unknown"
        rssi = advertising_data.rssi
        address = device.address

        if address in seen_addresses:
            return
        seen_addresses.add(address)

        is_target = any(kw in name.lower() for kw in target_keywords)

        if is_target or advertising_data.local_name:
            found_devices.append({
                "name": name,
                "address": address,
                "rssi": rssi,
                "is_target": is_target
            })
            tag = " ★ [MATCH - Rubber Otter BLE]" if is_target else ""
            print(f" Device: {name}")
            print(f"   - Address/UUID: {address}")
            print(f"   - RSSI (Signal): {rssi} dBm{tag}")
            print("-" * 60)

    scanner = BleakScanner(detection_callback=callback)
    await scanner.start()
    await asyncio.sleep(timeout)
    await scanner.stop()

    if not found_devices:
        print("No matching BLE devices discovered.")

    return found_devices


def main():
    parser = argparse.ArgumentParser(description="Rubber Otter Serial & BLE Device Scanner")
    parser.add_argument(
        "--mode",
        choices=["serial", "ble", "all"],
        default="all",
        help="Scan mode: serial (USB port), ble (Bluetooth LE), or all (default: all)",
    )
    parser.add_argument(
        "--target",
        default="Otter",
        help="Target BLE device name filter (default: Otter)",
    )
    parser.add_argument(
        "--timeout",
        type=float,
        default=5.0,
        help="BLE scan duration in seconds (default: 5.0)",
    )

    args = parser.parse_args()

    print("\n🦦 Rubber Otter Device Scanner")
    print(f"Mode: {args.mode.upper()} | Target BLE: '{args.target}'\n")

    if args.mode in ["serial", "all"]:
        scan_serial_ports()

    if args.mode in ["ble", "all"]:
        try:
            asyncio.run(scan_ble_devices(target_name=args.target, timeout=args.timeout))
        except KeyboardInterrupt:
            print("\nBLE Scan interrupted by user.")
        except Exception as e:
            print(f"\n[!] BLE Scan Error: {e}")

    print("\nScan completed.\n")


if __name__ == "__main__":
    main()
