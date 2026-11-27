"""
Unit tests for RubberOtter CLI parser and subcommand routing.
"""

import unittest
from unittest.mock import patch

from rubberotter.cli import main


class TestCLIModule(unittest.TestCase):

    @patch('sys.argv', ['rubberotter', 'scan', '--json', '--scan-timeout', '0.1'])
    @patch('rubberotter.cli.scan_serial_ports')
    @patch('rubberotter.cli.scan_ble_devices')
    def test_cli_scan_json(self, mock_ble, mock_serial):
        mock_serial.return_value = [{"device": "/dev/cu.usbmodem1", "candidate": True, "board": "Leonardo"}]
        mock_ble.return_value = {"error": None, "devices": []}

        with patch('sys.stdout'):
            try:
                main()
            except SystemExit:
                pass

    @patch('sys.argv', ['rubberotter', 'doctor', '--ping', '--port', '/dev/test', '--baud', '115200'])
    @patch('rubberotter.cli.RubberOtter')
    def test_doctor_ping_connects_and_disconnects(self, mock_otter):
        with patch('sys.stdout') as stdout:
            main()

        mock_otter.assert_called_once_with(
            port='/dev/test', ble_address=None, ble_target='Otter',
            baud=115200, timeout=3.0, retries=2,
        )
        mock_otter.return_value.connect.assert_called_once_with()
        mock_otter.return_value.disconnect.assert_called_once_with()
        self.assertIn('Connect latency:', ''.join(call.args[0] for call in stdout.write.call_args_list))

    @patch('sys.argv', ['rubberotter', 'doctor', '--ping'])
    @patch('rubberotter.cli.RubberOtter')
    def test_doctor_ping_disconnects_after_failure(self, mock_otter):
        mock_otter.return_value.connect.side_effect = RuntimeError('connection failed')
        with patch('sys.stdout'), self.assertRaises(RuntimeError):
            main()
        mock_otter.return_value.disconnect.assert_called_once_with()


if __name__ == "__main__":
    unittest.main()
