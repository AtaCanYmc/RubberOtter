"""
Unit tests for RubberOtter Web Dashboard REST API endpoints.
"""

import json
import unittest
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


if __name__ == "__main__":
    unittest.main()
