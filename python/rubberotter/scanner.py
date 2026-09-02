"""
Rubber Otter Hardware Scanner Module
Scans connected USB CDC Serial ports and nearby Bluetooth Low Energy (BLE) devices.
"""

import asyncio
import concurrent.futures
import glob
import os
import sys

# Known USB Vendor/Product IDs for ATmega32U4 microcontrollers
KNOWN_VID_PID = {
    "2341:8036": "Arduino Leonardo",
    "2341:0036": "Arduino Leonardo Bootloader",
    "1b4f:9204": "SparkFun Pro Micro 5V/16MHz",
    "1b4f:9206": "SparkFun Pro Micro",
    "1b4f:9203": "SparkFun Pro Micro 3.3V/8MHz",
    "2341:0037": "Arduino Micro",
    "2341:8037": "Arduino Micro",
}

DEFAULT_BLE_TARGETS = ["otter", "hmsoft", "mlt-bt05", "hm-10", "bt05"]


def _run_async(coro):
    """Safely executes a coroutine from synchronous code regardless of active event loops."""
    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        loop = None

    if loop and loop.is_running():
        with concurrent.futures.ThreadPoolExecutor(max_workers=1) as executor:
            return executor.submit(lambda: asyncio.run(coro)).result()
    else:
        return asyncio.run(coro)


def scan_serial_ports(quiet: bool = False):
    """
    Scans available USB CDC Serial ports.
    Returns list of dicts with port metadata and candidate matching flags.
    """
    found_ports = []

    try:
        import serial.tools.list_ports
        ports = serial.tools.list_ports.comports()

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
                kw in (device + desc + hwid).lower()
                for kw in ["usbmodem", "usbserial", "leonardo", "promicro", "atmega32u4", "arduino"]
            ):
                is_candidate = True

            item = {
                "device": device,
                "description": desc,
                "hwid": hwid,
                "vid_pid": vid_pid_str,
                "candidate": is_candidate,
                "board": board_name or ("Rubber Otter Candidate" if is_candidate else ""),
            }
            found_ports.append(item)

    except ImportError:
        patterns = ["/dev/tty.usbmodem*", "/dev/tty.usbserial*", "/dev/ttyACM*", "/dev/ttyUSB*"]
        system_ports = []
        for p in patterns:
            system_ports.extend(glob.glob(p))

        for port in sorted(system_ports):
            found_ports.append({
                "device": port,
                "description": "USB Modem Device",
                "hwid": "n/a",
                "vid_pid": "",
                "candidate": True,
                "board": "Rubber Otter Candidate",
            })

    return found_ports


async def scan_ble_devices_async(target_name: str = "Otter", timeout: float = 5.0):
    """
    Asynchronously scans for nearby Bluetooth Low Energy (BLE) devices matching target_name or HM-10 defaults.
    """
    try:
        from bleak import BleakScanner
    except ImportError:
        return {"error": "bleak module is not installed", "devices": []}

    targets = list(set([target_name.lower()] + DEFAULT_BLE_TARGETS))
    seen_addresses = set()
    found_devices = []

    def callback(device, advertising_data):
        name = device.name or advertising_data.local_name or "Unknown"
        rssi = advertising_data.rssi
        address = device.address

        if address in seen_addresses:
            return
        seen_addresses.add(address)

        is_target = any(kw in name.lower() for kw in targets)

        if is_target or advertising_data.local_name:
            found_devices.append({
                "name": name,
                "address": address,
                "rssi": rssi,
                "is_target": is_target,
            })

    scanner = BleakScanner(detection_callback=callback)
    await scanner.start()
    await asyncio.sleep(timeout)
    await scanner.stop()

    return {"error": None, "devices": found_devices}


def scan_ble_devices(target_name: str = "Otter", timeout: float = 5.0):
    """Synchronous wrapper for BLE scanning."""
    try:
        return _run_async(scan_ble_devices_async(target_name=target_name, timeout=timeout))
    except Exception as e:
        return {"error": str(e), "devices": []}


async def auto_detect_ble_device_async(target_name: str = "Otter", timeout: float = 3.0):
    """
    Asynchronously scans nearby BLE devices and returns the address of the best matching Rubber Otter BLE device.
    """
    res = await scan_ble_devices_async(target_name=target_name, timeout=timeout)
    devices = res.get("devices", [])
    for d in devices:
        if d.get("is_target"):
            return d.get("address")
    if devices:
        return devices[0].get("address")
    return None


def auto_detect_ble_device(target_name: str = "Otter", timeout: float = 3.0):
    """
    Scans nearby BLE devices and returns the address of the best matching Rubber Otter BLE device.
    """
    try:
        return _run_async(auto_detect_ble_device_async(target_name=target_name, timeout=timeout))
    except Exception:
        return None


def scan_all(target_ble_name: str = "Otter", ble_timeout: float = 3.0):
    """Scans both USB Serial ports and Bluetooth LE devices."""
    ports = scan_serial_ports(quiet=True)
    ble_res = scan_ble_devices(target_name=target_ble_name, timeout=ble_timeout)
    return {
        "serial_ports": ports,
        "ble_devices": ble_res.get("devices", []),
        "ble_error": ble_res.get("error"),
    }
