"""
Rubber Otter Synchronous & Asynchronous Client APIs
Provides Python inline functions and context managers to discover, connect, and manage Rubber Otter devices over BLE and Serial.
"""

import asyncio
import time
from typing import Optional, Dict, Any, List

from .protocol import build_frame, parse_ack, PayloadTooLargeError
from .scanner import scan_serial_ports, auto_detect_ble_device, auto_detect_ble_device_async, _run_async


class RubberOtterConnectionError(Exception):
    """Raised when connection to Rubber Otter device fails or times out."""
    pass


class BLERubberOtter:
    """
    Bluetooth Low Energy (BLE) Transport Client for Rubber Otter MCU device using Bleak.
    Communicates via HM-10 / BT05 GATT characteristics.
    """
    HM10_CHAR_UUID = "0000ffe1-0000-1000-8000-00805f9b34fb"

    def __init__(
        self,
        ble_address: Optional[str] = None,
        target_name: str = "Otter",
        timeout: float = 3.0,
        retries: int = 2,
    ):
        self.ble_address = ble_address
        self.target_name = target_name
        self.timeout = timeout
        self.retries = retries
        self._seq = 1
        self._client = None
        self._buf = bytearray()
        self._ack_received = None

    def connect(self):
        """Connects to target BLE device via Bleak synchronously."""
        if not self.ble_address:
            self.ble_address = auto_detect_ble_device(target_name=self.target_name)
        if not self.ble_address:
            raise RubberOtterConnectionError("No BLE Rubber Otter device found or address specified.")

        _run_async(self.connect_async())

    async def connect_async(self):
        """Asynchronously connects to target BLE device."""
        if not self.ble_address:
            self.ble_address = await auto_detect_ble_device_async(target_name=self.target_name)
        if not self.ble_address:
            raise RubberOtterConnectionError("No BLE Rubber Otter device found or address specified.")

        try:
            from bleak import BleakClient
            self._client = BleakClient(self.ble_address)
            await self._client.connect()

            def notification_handler(sender, data: bytearray):
                self._buf.extend(data)
                ack = parse_ack(bytes(self._buf))
                if ack:
                    self._ack_received = ack
                else:
                    text = bytes(self._buf).decode("utf-8", errors="ignore").strip().upper()
                    if "OK" in text or "ACK" in text or "SUCCESS" in text:
                        self._ack_received = {
                            "version": 1,
                            "seq": self._seq,
                            "status": 1,
                            "code": 0,
                            "success": True,
                        }

            subscribed = False
            try:
                await self._client.start_notify(self.HM10_CHAR_UUID, notification_handler)
                subscribed = True
            except Exception:
                if getattr(self._client, "services", None):
                    for service in self._client.services:
                        for char in service.characteristics:
                            if "notify" in char.properties:
                                try:
                                    await self._client.start_notify(char.uuid, notification_handler)
                                    subscribed = True
                                    break
                                except Exception:
                                    pass
                        if subscribed:
                            break
        except Exception as e:
            self._client = None
            raise RubberOtterConnectionError(f"Failed to connect to BLE device '{self.ble_address}': {e}")

    def disconnect(self):
        """Closes the BLE connection."""
        if self._client:
            try:
                _run_async(self._client.disconnect())
            except Exception:
                pass
            self._client = None

    def send(self, cmd_str: str, seq: Optional[int] = None, raw: bool = False, no_ack: bool = False) -> Dict[str, Any]:
        """Sends raw command string to Rubber Otter over BLE and waits for ACK response."""
        return _run_async(self.send_async(cmd_str, seq, raw=raw, no_ack=no_ack))

    async def send_async(self, cmd_str: str, seq: Optional[int] = None, raw: bool = False, no_ack: bool = False) -> Dict[str, Any]:
        """Asynchronously sends raw command over BLE and waits for ACK response."""
        if not self._client or not getattr(self._client, "is_connected", False):
            await self.connect_async()

        if seq is None:
            seq = self._seq
            self._seq = (self._seq % 254) + 1

        if raw:
            frame = (cmd_str + "\n").encode("utf-8")
        else:
            payload = cmd_str.encode("utf-8")
            frame = build_frame(seq & 0xFF, payload)

        if no_ack:
            try:
                await self._client.write_gatt_char(self.HM10_CHAR_UUID, frame, response=False)
            except Exception:
                pass
            await asyncio.sleep(0.1)
            return {
                "success": True,
                "seq": seq,
                "status": 1,
                "code": 0,
                "note": "Payload transmitted without waiting for ACK",
                "ble_address": self.ble_address,
            }

        for attempt in range(1, self.retries + 2):
            self._buf.clear()
            self._ack_received = None

            written = False
            try:
                await self._client.write_gatt_char(self.HM10_CHAR_UUID, frame, response=False)
                written = True
            except Exception:
                if getattr(self._client, "services", None):
                    for service in self._client.services:
                        for char in service.characteristics:
                            if "write-without-response" in char.properties or "write" in char.properties:
                                try:
                                    await self._client.write_gatt_char(char.uuid, frame, response=False)
                                    written = True
                                    break
                                except Exception:
                                    pass
                        if written:
                            break

            start = time.time()
            while time.time() - start < self.timeout:
                if self._ack_received:
                    res = self._ack_received
                    res["attempt"] = attempt
                    res["ble_address"] = self.ble_address
                    return res
                await asyncio.sleep(0.02)

        return {
            "error": f"Timeout waiting for ACK over BLE after {self.retries + 1} attempts. (Check MCU Serial1 baud rate, TX/RX wiring, or firmware)",
            "success": False,
            "ble_address": self.ble_address,
            "seq": seq,
        }


class SerialRubberOtter:
    """
    USB Serial Transport Client for Rubber Otter MCU device.
    """
    def __init__(self, port: Optional[str] = None, baud: int = 9600, timeout: float = 1.0, retries: int = 2):
        self.port = port or self.auto_detect_port()
        self.baud = baud
        self.timeout = timeout
        self.retries = retries
        self._seq = 1
        self._serial = None

    @staticmethod
    def auto_detect_port() -> Optional[str]:
        ports = scan_serial_ports(quiet=True)
        for p in ports:
            if p.get("candidate"):
                return p.get("device")
        if ports:
            return ports[0].get("device")
        return None

    def connect(self):
        if not self.port:
            raise RubberOtterConnectionError("No USB Serial port specified or auto-detected.")
        try:
            import serial
            self._serial = serial.Serial(self.port, self.baud, timeout=0.05)
            self._serial.dtr = True
            self._serial.rts = True
            time.sleep(0.3)
        except Exception as e:
            raise RubberOtterConnectionError(f"Failed to open serial port '{self.port}': {e}")

    def disconnect(self):
        if self._serial and self._serial.is_open:
            self._serial.close()
            self._serial = None

    def send(self, cmd_str: str, seq: Optional[int] = None, raw: bool = False, no_ack: bool = False) -> Dict[str, Any]:
        if not self._serial or not self._serial.is_open:
            self.connect()

        if seq is None:
            seq = self._seq
            self._seq = (self._seq % 254) + 1

        if raw:
            frame = (cmd_str + "\n").encode("utf-8")
        else:
            payload = cmd_str.encode("utf-8")
            frame = build_frame(seq & 0xFF, payload)

        if no_ack:
            self._serial.write(frame)
            self._serial.flush()
            return {"success": True, "seq": seq, "status": 1, "code": 0, "port": self.port}

        for attempt in range(1, self.retries + 2):
            self._serial.write(frame)
            self._serial.flush()

            start = time.time()
            buf = bytearray()
            while time.time() - start < self.timeout:
                chunk = self._serial.read(128)
                if chunk:
                    buf.extend(chunk)
                    ack = parse_ack(buf)
                    if ack:
                        ack["attempt"] = attempt
                        ack["port"] = self.port
                        return ack
                else:
                    time.sleep(0.01)

        return {
            "error": f"Timeout waiting for ACK after {self.retries + 1} attempts",
            "success": False,
            "port": self.port,
            "seq": seq,
        }


class RubberOtter:
    """
    Primary Synchronous Python Client for Rubber Otter MCU device.
    Prioritizes Bluetooth Low Energy (BLE) communication by default, with USB serial support.
    """

    def __init__(
        self,
        port: Optional[str] = None,
        ble_address: Optional[str] = None,
        ble_target: str = "Otter",
        baud: int = 9600,
        timeout: float = 3.0,
        retries: int = 2,
        use_ble: bool = True,
        raw: bool = False,
        no_ack: bool = False,
    ):
        self.port = port
        self.ble_address = ble_address
        self.ble_target = ble_target
        self.baud = baud
        self.timeout = timeout
        self.retries = retries
        self.raw = raw
        self.no_ack = no_ack

        if port and not ble_address:
            self.use_ble = False
        else:
            self.use_ble = use_ble

        if self.use_ble:
            self._transport = BLERubberOtter(
                ble_address=self.ble_address,
                target_name=self.ble_target,
                timeout=self.timeout,
                retries=self.retries,
            )
        else:
            self._transport = SerialRubberOtter(
                port=self.port,
                baud=self.baud,
                timeout=self.timeout,
                retries=self.retries,
            )

    @property
    def connection_target(self) -> str:
        if self.use_ble:
            return getattr(self._transport, "ble_address", None) or f"BLE ({self.ble_target})"
        return getattr(self._transport, "port", None) or "USB Serial"

    @property
    def connection_type(self) -> str:
        return "ble" if self.use_ble else "serial"

    @staticmethod
    def auto_detect_port() -> Optional[str]:
        return SerialRubberOtter.auto_detect_port()

    @staticmethod
    def auto_detect_ble(target_name: str = "Otter") -> Optional[str]:
        return auto_detect_ble_device(target_name=target_name)

    def connect(self):
        self._transport.connect()

    def disconnect(self):
        self._transport.disconnect()

    def __enter__(self):
        self.connect()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.disconnect()

    def send(self, cmd_str: str, seq: Optional[int] = None, raw: Optional[bool] = None, no_ack: Optional[bool] = None) -> Dict[str, Any]:
        is_raw = self.raw if raw is None else raw
        is_no_ack = self.no_ack if no_ack is None else no_ack
        return self._transport.send(cmd_str, seq=seq, raw=is_raw, no_ack=is_no_ack)

    # Inline Convenience API Functions
    def type(self, text: str) -> Dict[str, Any]:
        """Types specified text string using USB HID Keyboard."""
        escaped = text.replace('"', '\\"')
        return self.send(f'type "{escaped}"')

    def delay(self, ms: int) -> Dict[str, Any]:
        """Delays execution on microcontroller by specified milliseconds."""
        return self.send(f"delay {ms}")

    def press(self, key: str) -> Dict[str, Any]:
        """Presses a single key (e.g. enter, tab, backspace, gui)."""
        return self.send(key)

    def combo(self, *keys: str) -> Dict[str, Any]:
        """Presses a key combination (e.g. combo('press GUI space'))."""
        combo_str = " ".join(keys)
        if not combo_str.startswith("press"):
            combo_str = f"press {combo_str}"
        return self.send(combo_str)

    def mouse_click(self, button: str = "left") -> Dict[str, Any]:
        """Clicks mouse button ('left', 'right', 'middle')."""
        btn = button.lower()
        if btn == "right":
            return self.send("mouse right")
        elif btn == "middle":
            return self.send("mouse middle")
        return self.send("mouse left")

    def mouse_move(self, dx: int = 0, dy: int = 0, wheel: int = 0) -> Dict[str, Any]:
        """Moves mouse cursor relative (dx, dy) or scrolls mouse wheel."""
        if wheel != 0:
            return self.send(f"mouse wheel {wheel}")
        return self.send(f"mouse move {dx} {dy}")

    def jiggler_toggle(self) -> Dict[str, Any]:
        """Toggles non-blocking Mouse Jiggler mode."""
        return self.send("jiggler toggle")

    def jiggler_start(self) -> Dict[str, Any]:
        """Starts non-blocking Mouse Jiggler mode."""
        return self.send("jiggler start")

    def jiggler_stop(self) -> Dict[str, Any]:
        """Stops non-blocking Mouse Jiggler mode."""
        return self.send("jiggler stop")

    def vibrate(self, ms: int = 100) -> Dict[str, Any]:
        """Triggers vibration motor haptic burst for ms milliseconds."""
        return self.send(f"vibrate {ms}")

    def set_ble_name(self, name: str) -> Dict[str, Any]:
        """Configures advertised Bluetooth name on HM-10 module."""
        return self.send(f'ble name "{name}"')

    def macro_list(self) -> Dict[str, Any]:
        """Lists persistent EEPROM macros stored on target MCU."""
        return self.send("macro list")

    def macro_save(self, slot: str, body_command: str) -> Dict[str, Any]:
        """Saves command sequence into persistent EEPROM macro slot (e.g., m0..m5)."""
        return self.send(f'macro save {slot} "{body_command}"')

    def macro_run(self, slot: str) -> Dict[str, Any]:
        """Executes persistent EEPROM macro slot (e.g., m0..m5)."""
        return self.send(f"macro run {slot}")


class AsyncRubberOtter(RubberOtter):
    """
    Asynchronous Python Client wrapper for Rubber Otter MCU device.
    """

    async def send_async(self, cmd_str: str, seq: Optional[int] = None, raw: Optional[bool] = None, no_ack: Optional[bool] = None) -> Dict[str, Any]:
        """Asynchronously executes command on thread loop."""
        is_raw = self.raw if raw is None else raw
        is_no_ack = self.no_ack if no_ack is None else no_ack
        if self.use_ble and isinstance(self._transport, BLERubberOtter):
            return await self._transport.send_async(cmd_str, seq, raw=is_raw, no_ack=is_no_ack)
        return await asyncio.to_thread(self.send, cmd_str, seq, raw=is_raw, no_ack=is_no_ack)

    async def type_async(self, text: str) -> Dict[str, Any]:
        return await asyncio.to_thread(self.type, text)

    async def jiggler_toggle_async(self) -> Dict[str, Any]:
        return await asyncio.to_thread(self.jiggler_toggle)

    async def vibrate_async(self, ms: int = 100) -> Dict[str, Any]:
        return await asyncio.to_thread(self.vibrate, ms)
