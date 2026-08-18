"""
Unit tests for RubberOtter Web Dashboard REST API endpoints.
"""

import json
import unittest
from unittest.mock import patch, MagicMock
from rubberotter.web.server import create_app


class TestWebDashboardAPI(unittest.TestCase):

    def setUp(self):
        self.app = create_app()
        self.client = self.app.test_client()

    def test_index_page(self):
        response = self.client.get('/')
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'OtterDeck', response.data)

    def test_api_status(self):
        response = self.client.get('/api/status')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('connected', data)

    def test_api_scan(self):
        response = self.client.get('/api/scan?timeout=0.1')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('serial_ports', data)
        self.assertIn('ble_devices', data)

    @patch('rubberotter.web.server.RubberOtter.send')
    @patch('rubberotter.web.server.RubberOtter.connect')
    def test_api_endpoints_mocked(self, mock_connect, mock_send):
        mock_send.return_value = {"success": True, "seq": 1, "status": 1, "code": 0}

        # Test /api/type
        res = self.client.post('/api/type', json={"text": "Hello World"})
        self.assertEqual(res.status_code, 200)
        self.assertTrue(json.loads(res.data).get("success"))

        # Test /api/press
        res = self.client.post('/api/press', json={"key": "enter"})
        self.assertEqual(res.status_code, 200)

        # Test /api/combo
        res = self.client.post('/api/combo', json={"keys": ["press", "GUI", "space"]})
        self.assertEqual(res.status_code, 200)

        # Test /api/mouse
        res = self.client.post('/api/mouse', json={"action": "click", "button": "left"})
        self.assertEqual(res.status_code, 200)

        # Test /api/vibrate
        res = self.client.post('/api/vibrate', json={"duration": 200})
        self.assertEqual(res.status_code, 200)

        # Test /api/jiggler
        res = self.client.post('/api/jiggler', json={"action": "toggle"})
        self.assertEqual(res.status_code, 200)

        # Test /api/ble-name
        res = self.client.post('/api/ble-name', json={"name": "Otter_Pro"})
        self.assertEqual(res.status_code, 200)

        # Test /api/macro/run
        res = self.client.post('/api/macro/run', json={"slot": "m0"})
        self.assertEqual(res.status_code, 200)

        # Test /api/macro/save
        res = self.client.post('/api/macro/save', json={"slot": "m0", "body": "type 'hi'"})
        self.assertEqual(res.status_code, 200)

        # Test /api/macro/list
        res = self.client.get('/api/macro/list')
        self.assertEqual(res.status_code, 200)


if __name__ == "__main__":
    unittest.main()
