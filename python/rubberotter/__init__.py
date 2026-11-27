"""
Rubber Otter Python SDK Package
Comprehensive library for discovering, controlling, and managing Rubber Otter microcontrollers.
"""

from .ai.tools import RubberOtterToolRegistry, ToolDefinition
from .client import AsyncRubberOtter, RubberOtter, RubberOtterConnectionError
from .mcp.server import RubberOtterMcpServer, run_stdio_server
from .protocol import PayloadTooLargeError, ProtocolError, build_frame, parse_ack
from .scanner import scan_all, scan_ble_devices, scan_serial_ports

__version__ = "1.5.0"  # x-release-please-version
__author__ = "Rubber Otter Developer"

__all__ = [
    "AsyncRubberOtter",
    "PayloadTooLargeError",
    "ProtocolError",
    "RubberOtter",
    "RubberOtterConnectionError",
    "RubberOtterMcpServer",
    "RubberOtterToolRegistry",
    "ToolDefinition",
    "build_frame",
    "parse_ack",
    "run_stdio_server",
    "scan_all",
    "scan_ble_devices",
    "scan_serial_ports",
]
