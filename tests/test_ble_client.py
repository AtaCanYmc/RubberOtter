"""
Unit tests for RubberOtter Bluetooth LE (BLE) client and BLE-first connection routing.
"""

import unittest
from unittest.mock import MagicMock, patch, AsyncMock
from rubberotter.client import RubberOtter, BLERubberOtter, RubberOtterConnectionError
from rubberotter.protocol import STX, ETX, VERSION


class TestBLEClient(unittest.TestCase):

    @patch('rubberotter.client.auto_detect_ble_device')
    def test_ble_auto_detection(self, mock_detect):
        mock_detect.return_value = "60F9F128-5B7C-1258-10D5-2694444599B7"
        otter = RubberOtter(use_ble=True)
        self.assertTrue(otter.use_ble)
        self.assertEqual(otter.connection_type, "ble")
        self.assertIn("BLE", otter.connection_target)

    @patch('rubberotter.client.BLERubberOtter.connect')
    @patch('rubberotter.client.BLERubberOtter.send')
    def test_ble_send_vibrate(self, mock_send, mock_connect):
        mock_send.return_value = {
            "version": VERSION,
            "seq": 1,
            "status": 1,
            "code": 0,
            "success": True,
            "ble_address": "60F9F128-5B7C-1258-10D5-2694444599B7",
        }
        otter = RubberOtter(ble_address="60F9F128-5B7C-1258-10D5-2694444599B7", use_ble=True)
        res = otter.vibrate(200)
        self.assertTrue(res.get("success"))
        mock_send.assert_called_with("vibrate 200", seq=None, raw=False, no_ack=False)

    @patch('rubberotter.client.auto_detect_ble_device')
    def test_ble_connection_error_when_no_device(self, mock_detect):
        mock_detect.return_value = None
        ble_otter = BLERubberOtter(ble_address=None)
        with self.assertRaises(RubberOtterConnectionError):
            ble_otter.connect()


if __name__ == "__main__":
    unittest.main()
