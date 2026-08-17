"""
Rubber Otter Synchronous & Asynchronous Client APIs
Provides Python inline functions and context managers to discover, connect, and manage Rubber Otter devices.
"""

import asyncio
import time
from typing import Optional, Dict, Any, List

from .protocol import build_frame, parse_ack, PayloadTooLargeError
from .scanner import scan_serial_ports


class RubberOtterConnectionError(Exception):
    """Raised when connection to Rubber Otter device fails or times out."""
    pass


class RubberOtter:
    """
    Synchronous Python Client for Rubber Otter MCU device.

    Example Usage:
        with RubberOtter() as otter:
            otter.type("Hello World\\n")
            otter.vibrate(200)
            otter.jiggler_toggle()
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
        """Auto-detects the first candidate Rubber Otter USB Serial port."""
        ports = scan_serial_ports(quiet=True)
        for p in ports:
            if p.get("candidate"):
                return p.get("device")
        if ports:
            return ports[0].get("device")
        return None

    def connect(self):
        """Opens serial connection to target Rubber Otter device."""
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
        """Closes the serial connection."""
        if self._serial and self._serial.is_open:
            self._serial.close()
            self._serial = None

    def __enter__(self):
        self.connect()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.disconnect()

    def send(self, cmd_str: str, seq: Optional[int] = None) -> Dict[str, Any]:
        """
        Sends a raw command string to Rubber Otter and waits for ACK response.
        """
        if not self._serial or not self._serial.is_open:
            self.connect()

        if seq is None:
            seq = self._seq
            self._seq = (self._seq % 254) + 1

        payload = cmd_str.encode("utf-8")
        frame = build_frame(seq & 0xFF, payload)

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

    async def send_async(self, cmd_str: str, seq: Optional[int] = None) -> Dict[str, Any]:
        """Asynchronously executes command on thread loop."""
        return await asyncio.to_thread(self.send, cmd_str, seq)

    async def type_async(self, text: str) -> Dict[str, Any]:
        return await asyncio.to_thread(self.type, text)

    async def jiggler_toggle_async(self) -> Dict[str, Any]:
        return await asyncio.to_thread(self.jiggler_toggle)

    async def vibrate_async(self, ms: int = 100) -> Dict[str, Any]:
        return await asyncio.to_thread(self.vibrate, ms)
