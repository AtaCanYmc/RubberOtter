import json
import unittest

from rubberotter.mcp.server import RubberOtterMcpServer


class TestMcpErrorResponses(unittest.TestCase):
    def test_mcp_structured_error_response(self):
        srv = RubberOtterMcpServer(client=None)
        resp = srv._error_response(1, -32602, "Invalid param", error_code="ERR_INVALID_PARAMS", retryable=False)
        self.assertEqual(resp["error"]["code"], -32602)
        self.assertEqual(resp["error"]["data"]["error_code"], "ERR_INVALID_PARAMS")
        self.assertIs(resp["error"]["data"]["retryable"], False)

    def test_mcp_retryable_error_response(self):
        srv = RubberOtterMcpServer(client=None)
        resp = srv._error_response(2, -32000, "Timeout", error_code="ERR_TIMEOUT", retryable=True)
        self.assertIs(resp["error"]["data"]["retryable"], True)
        self.assertTrue(json.dumps(resp))
