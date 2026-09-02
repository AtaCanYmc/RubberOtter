"""
Rubber Otter Python SDK Package
Comprehensive library for discovering, controlling, and managing Rubber Otter microcontrollers.
"""

from .protocol import build_frame, parse_ack, ProtocolError, PayloadTooLargeError
from .scanner import scan_serial_ports, scan_ble_devices, scan_all
from .client import RubberOtter, AsyncRubberOtter, RubberOtterConnectionError

__version__ = "1.1.0"
__author__ = "Rubber Otter Developer"

__all__ = [
    "RubberOtter",
    "AsyncRubberOtter",
    "RubberOtterConnectionError",
    "scan_serial_ports",
    "scan_ble_devices",
    "scan_all",
    "build_frame",
    "parse_ack",
    "ProtocolError",
    "PayloadTooLargeError",
]
