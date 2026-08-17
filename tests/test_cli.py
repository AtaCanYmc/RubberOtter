"""
Unit tests for RubberOtter CLI parser and subcommand routing.
"""

import sys
import unittest
from unittest.mock import patch, MagicMock

from rubberotter.cli import main


class TestCLIModule(unittest.TestCase):

    @patch('sys.argv', ['rubberotter', 'scan', '--json', '--scan-timeout', '0.1'])
    @patch('rubberotter.cli.scan_serial_ports')
    @patch('rubberotter.cli.scan_ble_devices')
    def test_cli_scan_json(self, mock_ble, mock_serial):
        mock_serial.return_value = [{"device": "/dev/cu.usbmodem1", "candidate": True, "board": "Leonardo"}]
        mock_ble.return_value = {"error": None, "devices": []}

        with patch('sys.stdout') as mock_stdout:
            try:
                main()
            except SystemExit:
                pass


if __name__ == "__main__":
    unittest.main()
