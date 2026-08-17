"""
Unit tests for RubberOtter Python client SDK and inline functions.
"""

import unittest
from unittest.mock import MagicMock, patch
from rubberotter.client import RubberOtter, AsyncRubberOtter
from rubberotter.protocol import STX, ETX, VERSION


class TestClientSDK(unittest.TestCase):

    @patch('rubberotter.client.scan_serial_ports')
    def test_auto_detect_port(self, mock_scan):
        mock_scan.return_value = [
            {"device": "/dev/cu.debug-console", "candidate": False},
            {"device": "/dev/cu.usbmodemHIDFG1", "candidate": True, "board": "SparkFun Pro Micro"},
        ]
        port = RubberOtter.auto_detect_port()
        self.assertEqual(port, "/dev/cu.usbmodemHIDFG1")

    @patch('serial.Serial')
    def test_inline_functions_formatting(self, mock_serial_cls):
        mock_serial = MagicMock()
        mock_serial.is_open = True
        # Mock 6-byte ACK response
        ack_bytes = bytes([STX, VERSION, 1, 1, 0, ETX])
        mock_serial.read.return_value = ack_bytes
        mock_serial_cls.return_value = mock_serial

        otter = RubberOtter(port="/dev/test_port")
        otter.connect()

        # Test type() inline method
        res = otter.type("Hello")
        self.assertTrue(res.get("success"))

        # Test vibrate() inline method
        res = otter.vibrate(200)
        self.assertTrue(res.get("success"))

        # Test jiggler_toggle() inline method
        res = otter.jiggler_toggle()
        self.assertTrue(res.get("success"))

        otter.disconnect()


if __name__ == "__main__":
    unittest.main()
