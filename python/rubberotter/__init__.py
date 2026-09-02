"""
Rubber Otter Python SDK Package
Comprehensive library for discovering, controlling, and managing Rubber Otter microcontrollers.
"""

from .protocol import build_frame, parse_ack, ProtocolError, PayloadTooLargeError
from .scanner import scan_serial_ports, scan_ble_devices, scan_all
from .client import RubberOtter, AsyncRubberOtter, RubberOtterConnectionError
from .ai.tools import RubberOtterToolRegistry, ToolDefinition
from .mcp.server import RubberOtterMcpServer, run_stdio_server

__version__ = "1.3.0"
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
    "RubberOtterToolRegistry",
    "ToolDefinition",
    "RubberOtterMcpServer",
    "run_stdio_server",
]
