"""Tests for Rubber Otter Model Context Protocol (MCP) Server."""

import asyncio
import json
import unittest
from unittest.mock import MagicMock

from rubberotter.mcp.server import RubberOtterMcpServer


class TestMcpServer(unittest.TestCase):

    def setUp(self):
        self.mock_client = MagicMock()
        self.server = RubberOtterMcpServer(client=self.mock_client)

    def _run_async(self, coro):
        return asyncio.run(coro)

    def test_mcp_initialize(self):
        req = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "initialize",
            "params": {
                "protocolVersion": "2024-11-05",
                "clientInfo": {"name": "TestClient", "version": "1.0.0"}
            }
        }
        res = self._run_async(self.server.handle_request(req))
        self.assertEqual(res["jsonrpc"], "2.0")
        self.assertEqual(res["id"], 1)
        self.assertIn("serverInfo", res["result"])
        self.assertEqual(res["result"]["serverInfo"]["name"], "rubberotter-mcp")
        self.assertIn("capabilities", res["result"])
        self.assertIn("tools", res["result"]["capabilities"])
        self.assertIn("prompts", res["result"]["capabilities"])
        self.assertIn("resources", res["result"]["capabilities"])

    def test_mcp_ping(self):
        req = {"jsonrpc": "2.0", "id": 2, "method": "ping"}
        res = self._run_async(self.server.handle_request(req))
        self.assertEqual(res["id"], 2)
        self.assertEqual(res["result"], {})

    def test_mcp_tools_list(self):
        req = {"jsonrpc": "2.0", "id": 3, "method": "tools/list"}
        res = self._run_async(self.server.handle_request(req))
        self.assertEqual(res["id"], 3)
        tools = res["result"]["tools"]
        self.assertGreaterEqual(len(tools), 13)
        tool_names = [t["name"] for t in tools]
        self.assertIn("rubberotter_type", tool_names)
        self.assertIn("rubberotter_lock", tool_names)
        self.assertIn("rubberotter_vibrate", tool_names)

    def test_mcp_tools_call_success(self):
        req = {
            "jsonrpc": "2.0",
            "id": 4,
            "method": "tools/call",
            "params": {
                "name": "rubberotter_vibrate",
                "arguments": {"duration_ms": 200}
            }
        }
        res = self._run_async(self.server.handle_request(req))
        self.assertEqual(res["id"], 4)
        self.assertFalse(res["result"]["isError"])
        content = res["result"]["content"][0]
        self.assertEqual(content["type"], "text")
        parsed_res = json.loads(content["text"])
        self.assertTrue(parsed_res["success"])
        self.assertEqual(parsed_res["duration_ms"], 200)
        self.mock_client.vibrate.assert_called_once_with(200)

    def test_mcp_tools_call_invalid_tool(self):
        req = {
            "jsonrpc": "2.0",
            "id": 5,
            "method": "tools/call",
            "params": {
                "name": "non_existing_tool",
                "arguments": {}
            }
        }
        res = self._run_async(self.server.handle_request(req))
        self.assertEqual(res["id"], 5)
        self.assertTrue(res["result"]["isError"])
        self.assertIn("Error", res["result"]["content"][0]["text"])

    def test_mcp_prompts_list_and_get(self):
        req_list = {"jsonrpc": "2.0", "id": 6, "method": "prompts/list"}
        res_list = self._run_async(self.server.handle_request(req_list))
        self.assertEqual(res_list["id"], 6)
        prompts = res_list["result"]["prompts"]
        self.assertGreaterEqual(len(prompts), 3)

        req_get = {
            "jsonrpc": "2.0",
            "id": 7,
            "method": "prompts/get",
            "params": {
                "name": "automate_terminal_task",
                "arguments": {"task_description": "List files and print pwd", "target_os": "macos"}
            }
        }
        res_get = self._run_async(self.server.handle_request(req_get))
        self.assertEqual(res_get["id"], 7)
        msg_text = res_get["result"]["messages"][0]["content"]["text"]
        self.assertIn("List files and print pwd", msg_text)
        self.assertIn("macos", msg_text)

    def test_mcp_resources_list_and_read(self):
        req_list = {"jsonrpc": "2.0", "id": 8, "method": "resources/list"}
        res_list = self._run_async(self.server.handle_request(req_list))
        self.assertEqual(res_list["id"], 8)
        resources = res_list["result"]["resources"]
        uris = [r["uri"] for r in resources]
        self.assertIn("rubberotter://status", uris)

        req_read = {
            "jsonrpc": "2.0",
            "id": 9,
            "method": "resources/read",
            "params": {"uri": "rubberotter://status"}
        }
        res_read = self._run_async(self.server.handle_request(req_read))
        self.assertEqual(res_read["id"], 9)
        content = res_read["result"]["contents"][0]
        self.assertEqual(content["uri"], "rubberotter://status")
        parsed_status = json.loads(content["text"])
        self.assertIn("connected", parsed_status)
        self.assertIn("device_type", parsed_status)

    def test_mcp_unknown_method_error(self):
        req = {"jsonrpc": "2.0", "id": 10, "method": "unknown_function"}
        res = self._run_async(self.server.handle_request(req))
        self.assertEqual(res["id"], 10)
        self.assertIn("error", res)
        self.assertEqual(res["error"]["code"], -32601)


if __name__ == "__main__":
    unittest.main()
